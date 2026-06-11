import express from 'express'
import path from 'path'
import P from 'pino'

import pkg from '@whiskeysockets/baileys'

const {
default: makeWASocket,
useMultiFileAuthState
} = pkg

const app = express()

app.use(express.json())
app.use(express.static('public'))

let latestCode = null

async function startBot(number) {

const { state, saveCreds } =
await useMultiFileAuthState(`./sessions/${number}`)

const sock = makeWASocket({
auth: state,
printQRInTerminal: false,
browser: ['Yae Miku','Safari','1.0.0'],
logger: P({ level: 'silent' })
})

sock.ev.on('creds.update', saveCreds)

sock.ev.on('connection.update',
async ({ connection }) => {

if (connection === 'connecting') {
console.log('🌸 Conectando...')
}

if (connection === 'open') {
console.log('🌸 Conectado')
}

if (!sock.authState.creds.registered) {

try {

const code =
await sock.requestPairingCode(number)

latestCode = code

console.log('🌸 CODE:', code)

} catch(err){

console.log(err)

}

}

if (connection === 'close') {
console.log('❌ conexión cerrada')
}

})

}

app.post('/code', async (req,res)=>{

const number =
req.body.number?.replace(/[^0-9]/g,'')

if (!number) {
return res.json({
status:false
})
}

latestCode = null

await startBot(number)

let checks = 0

const timer =
setInterval(()=>{

checks++

if (latestCode) {

clearInterval(timer)

return res.json({
status:true,
code:latestCode
})

}

if (checks >= 20) {

clearInterval(timer)

return res.json({
status:false
})

}

},1000)

})

app.get('/',(req,res)=>{

res.sendFile(
path.join(
process.cwd(),
'public/index.html'
)
)

})

app.listen(3000,()=>{

console.log('🌸 Yae Miku Web online')

})
