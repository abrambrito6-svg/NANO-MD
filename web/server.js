import express from 'express';
import path from 'path';
import P from 'pino';

import pkg from '@whiskeysockets/baileys';

const {
default: makeWASocket,
useMultiFileAuthState
} = pkg;
const app = express();

app.use(express.json());
app.use(express.static('public'));

let latestCode = null;

async function startSubBot(number) {

const sessionPath = `./sessions/${number}`;

const { state, saveCreds } =
await useMultiFileAuthState(sessionPath);

const version = [2, 3000, 1015901307];

const sock = makeWASocket({
version,
auth: state,
mobile: false,
printQRInTerminal: false,
browser: ['Yae Miku', 'Safari', '1.0.0'],
logger: P({ level: 'silent' })
});

sock.ev.on('creds.update', saveCreds);

sock.ev.on(
'connection.update',
async ({ connection, qr, receivedPendingNotifications }) => {

if (connection === 'connecting') {

console.log('🌸 Conectando...');

}

if (connection === 'open') {

console.log('🌸 Conectado correctamente');

}

if (
!sock.authState.creds.registered &&
receivedPendingNotifications === true
) {

try {

const code =
await sock.requestPairingCode(number);

latestCode = code;

console.log('🌸 CODE:', code);

} catch(err){

console.log(err);

}

}

if (connection === 'close') {

console.log('❌ conexión cerrada');

}

});

}

app.post('/connect', async (req, res) => {

try {

const number =
req.body.number?.replace(/[^0-9]/g,'');

if (!number) {

return res.json({
status:false
});

}

latestCode = null;

await startSubBot(number);

let checks = 0;

const check =
setInterval(() => {

checks++;

if (latestCode) {

clearInterval(check);

return res.json({
status:true,
code:latestCode
});

}

if (checks >= 30) {

clearInterval(check);

return res.json({
status:false
});

}

}, 1000);

} catch(err){

console.log(err);

res.json({
status:false
});

}

});

app.get('/', (req,res)=>{

res.sendFile(
path.join(
process.cwd(),
'public/index.html'
)
);

});

app.listen(3000, ()=>{

console.log('🌸 Yae Miku Web online');

});
