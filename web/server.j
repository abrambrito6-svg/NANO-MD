import express from 'express';

import {
default as makeWASocket,
useMultiFileAuthState,
DisconnectReason,
fetchLatestBaileysVersion
} from '@whiskeysockets/baileys';

import P from 'pino';

import path from 'path';

const app = express();

app.use(express.json());

app.use(express.static('public'));

let latestCode = '...';

async function startSubBot(number) {

const sessionPath = `./sessions/${number}`;

const { state, saveCreds } =
await useMultiFileAuthState(sessionPath);

const { version } =
await fetchLatestBaileysVersion();

const sock = makeWASocket({
version,
auth: state,
logger: P({ level: 'silent' })
});

if (!sock.authState.creds.registered) {

const code =
await sock.requestPairingCode(number);

latestCode = code;

console.log('🌸 CODE:', code);

}

sock.ev.on('creds.update', saveCreds);

sock.ev.on('connection.update',
({ connection, lastDisconnect }) => {

if (connection === 'open') {

console.log('🌸 SubBot conectado');

}

if (connection === 'close') {

const shouldReconnect =
lastDisconnect?.error?.output?.statusCode !==
DisconnectReason.loggedOut;

if (shouldReconnect) {

startSubBot(number);

}

}

});

}

app.post('/connect', async (req, res) => {

try {

const number = req.body.number;

if (!number) {

return res.json({
status:false
});

}

await startSubBot(number);

const waitCode = setInterval(() => {

if (latestCode !== '...') {

clearInterval(waitCode);

res.json({
status:true,
code:latestCode
});

latestCode = '...';

}

}, 1000);

setTimeout(() => {

clearInterval(waitCode);

if (!res.headersSent) {

res.json({
status:false
});

}

}, 20000);

} catch (err) {

console.log(err);

res.json({
status:false
});

}

});

app.get('/', (req, res) => {

res.sendFile(
path.join(process.cwd(),
'public/index.html')
);

});

app.listen(3000, () => {

console.log(
'🌸 Yae Miku Web online'
);

});
