const express = require('express')
const path = require('path')
const P = require('pino')
const QRCode = require('qrcode')

const {
default: makeWASocket,
useMultiFileAuthState,
fetchLatestBaileysVersion,
DisconnectReason
} = require('@whiskeysockets/baileys')

const app = express()

app.use(express.static(path.join(__dirname, 'public')))

let currentQR = null
let sock = null

async function startBot() {

const { state, saveCreds } =
await useMultiFileAuthState('./session')

const { version } =
await fetchLatestBaileysVersion()

sock = makeWASocket({
version,
logger: P({ level: 'silent' }),
auth: state,
browser: ['NanoVoid','Chrome','1.0']
})

sock.ev.on('creds.update', saveCreds)

sock.ev.on(
'connection.update',
async(update) => {

const {
connection,
qr,
lastDisconnect
} = update

if(qr){

currentQR =
await QRCode.toDataURL(qr)

console.log('QR ACTUALIZADO 🥀')

}

if(connection === 'open'){

console.log('BOT CONECTADO 🥀')

currentQR = null

}

if(connection === 'close'){

console.log('CONEXIÓN CERRADA 💀')

const reason =
lastDisconnect?.error?.output?.statusCode

if(reason !== DisconnectReason.loggedOut){

startBot()

}

}

})

}

app.get('/', (req,res) => {

res.sendFile(
path.join(__dirname,'public/index.html')
)

})

app.get('/generate', async(req,res) => {

try {

currentQR = null

await startBot()

return res.json({
status:true
})

} catch(e){

console.log(e)

return res.json({
status:false
})

}

})

app.get('/qr', async(req,res) => {

if(!currentQR){

return res.json({
status:false
})

}

return res.json({
status:true,
qr:currentQR
})

})

app.listen(3000, () => {

console.log('WEB ONLINE EN 3000 🥀')

})
