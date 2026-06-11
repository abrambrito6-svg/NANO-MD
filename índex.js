import { Browsers, makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, DisconnectReason, jidDecode } from '@whiskeysockets/baileys';
import NodeCache from 'node-cache';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import cfonts from 'cfonts';
import { createServer } from "http";
import { Server } from "socket.io";
import { smsg } from './message.js'; 
import main from '../main.js';
import events from '../cmds/events.js';

// === CONFIGURACIÓN AUTOMÁTICA DE CARPETA WEB ===
const carpetaWeb = './Kurumi-Web';
if (!fs.existsSync(carpetaWeb)) {
  fs.mkdirSync(carpetaWeb, { recursive: true });
}

// === ENLACE DE CONEXIÓN PRINCIPAL ===
// Usaremos la IP local de tu red o localhost. 
// Nota: Si usas Netlify (HTTPS), necesitas cambiar esto por tu túnel activo.
const BACKEND_URL = "http://localhost:3000"; 

// --- GENERACIÓN AUTOMÁTICA DE ARCHIVOS (INDEX.HTML) ---
const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mancos y Asociados — Gestión de Sub-Bots</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', sans-serif; }
        body { background-color: #030712; color: #ffffff; display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 20px; }
        .container { width: 100%; max-width: 420px; text-align: center; }
        .avatar { width: 130px; height: 130px; border-radius: 50%; border: 3px solid #00f0ff; box-shadow: 0 0 20px #00f0ff88; object-fit: cover; margin-bottom: 15px; }
        .brand-title { font-size: 24px; letter-spacing: 2px; font-weight: bold; text-transform: uppercase; }
        .brand-subtitle { color: #6b7280; font-size: 14px; margin-top: 5px; margin-bottom: 25px; }
        .card { background-color: #0f172a; border: 1px solid #1e293b; border-radius: 16px; padding: 25px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5); }
        .tabs { display: flex; background-color: #020617; padding: 4px; border-radius: 8px; margin-bottom: 20px; }
        .tab-btn { flex: 1; background: transparent; border: none; color: #94a3b8; padding: 10px; font-weight: 600; cursor: pointer; border-radius: 6px; }
        .tab-btn.active { background-color: #00f0ff; color: #000000; }
        .form-group { text-align: left; margin-bottom: 20px; }
        .input-label { display: block; color: #00f0ff; font-size: 14px; font-weight: 600; margin-bottom: 8px; }
        .custom-select, .custom-input { width: 100%; background-color: #020617; border: 1px solid #334155; color: #ffffff; padding: 12px; border-radius: 8px; font-size: 15px; outline: none; }
        .custom-select:focus, .custom-input:focus { border-color: #00f0ff; }
        .btn-primary { width: 100%; background: linear-gradient(90deg, #00f0ff, #0072ff); color: #000000; border: none; padding: 14px; border-radius: 8px; font-weight: bold; font-size: 15px; cursor: pointer; margin-bottom: 12px; }
        .btn-channel { display: block; width: 100%; background-color: transparent; border: 1px solid #10b981; color: #10b981; padding: 12px; border-radius: 8px; font-weight: bold; text-decoration: none; font-size: 14px; margin-bottom: 25px; }
        .display-box { background-color: #020617; border: 1px dashed #334155; border-radius: 8px; padding: 30px 15px; color: #94a3b8; font-size: 14px; min-height: 120px; display: flex; justify-content: center; align-items: center; flex-direction: column; }
        .qr-img { width: 180px; height: 180px; background: white; padding: 5px; border-radius: 4px; }
        .pairing-code-txt { font-size: 24px; font-family: monospace; color: #ffffff; background: #1e293b; padding: 10px 20px; border-radius: 6px; letter-spacing: 3px; border: 1px solid #00f0ff; margin-top: 5px; }
        .hidden { display: none; }
    </style>
</head>
<body>
    <div class="container">
        <img src="https://files.catbox.moe/lwepuq.jpg" alt="Mancos PFP" class="avatar">
        <h1 class="brand-title">MANCOS Y ASOCIADOS</h1>
        <p class="brand-subtitle">Gestión de Sub-Bots & Premium</p>
        <div class="card">
            <div class="tabs">
                <button class="tab-btn active">Estándar</button>
                <button class="tab-btn">Premium</button>
            </div>
            <div class="form-group">
                <label class="input-label">Método de Vinculación</label>
                <select id="metodo-select" class="custom-select">
                    <option value="qr">Código QR</option>
                    <option value="codigo">Código de 8 dígitos</option>
                </select>
            </div>
            <div class="form-group hidden" id="phone-container">
                <label class="input-label">Número de WhatsApp (Sin signos ni espacios)</label>
                <input type="text" id="phone-input" class="custom-input" placeholder="Ej: 50231882808">
            </div>
            <button id="btn-vincular" class="btn-primary">INICIAR VINCULACIÓN</button>
            <a href="https://whatsapp.com/channel/0029Vb88DAM0G0XiQes3K42c" target="_blank" class="btn-channel">💬 UNIRSE AL CANAL</a>
            <div class="display-box" id="console-output">Selecciona opciones y pulsa Iniciar</div>
        </div>
    </div>
    <script src="https://cdn.socket.io/4.7.4/socket.io.min.js"></script>
    <script>
        const BACKEND_URL = "${BACKEND_URL}";
        const socket = io(BACKEND_URL, { transports: ['websocket'] });
        const metodoSelect = document.getElementById('metodo-select');
        const phoneContainer = document.getElementById('phone-container');
        const phoneInput = document.getElementById('phone-input');
        const btnVincular = document.getElementById('btn-vincular');
        const consoleOutput = document.getElementById('console-output');

        metodoSelect.addEventListener('change', () => {
            if (metodoSelect.value === 'codigo') phoneContainer.classList.remove('hidden');
            else phoneContainer.classList.add('hidden');
        });

        socket.on('connect', () => { console.log('Conectado al servidor Termux'); });
        socket.on('connect_error', () => { consoleOutput.innerHTML = '❌ Error de conexión con Termux. Verifica el túnel.'; });

        btnVincular.addEventListener('click', () => {
            const metodo = metodoSelect.value;
            let numero = phoneInput.value.replace(/\\D/g, "");
            if (metodo === 'codigo' && !numero) { alert('Ingresa tu número.'); return; }
            consoleOutput.innerHTML = '🔄 Conectando con las sombras de Kurumi...';
            socket.emit('iniciar_vinculacion', { metodo, phoneNumber: numero });
        });

        socket.on('resultado_qr', (data) => {
            consoleOutput.innerHTML = '<img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=' + encodeURIComponent(data.qr) + '" class="qr-img"><p style="margin-top:10px; color:#00f0ff;">Escanea el QR en WhatsApp</p>';
        });
        socket.on('resultado_codigo', (data) => {
            consoleOutput.innerHTML = '<p style="color:#6b7280;">Introduce este código en WhatsApp:</p><div class="pairing-code-txt">' + data.code + '</div>';
        });
        socket.on('conexion_exitosa', (data) => {
            consoleOutput.innerHTML = '<p style="color:#10b981; font-weight:bold;">¡VINCULACIÓN EXITOSA! 🎉</p><p>Conectado: ' + data.name + '</p>';
        });
        socket.on('conexion_cerrada', () => {
            consoleOutput.innerHTML = '<p style="color:#ef4444;">Sesión cerrada o reintentando...</p>';
        });
    </script>
</body>
</html>`;

fs.writeFileSync(path.join(carpetaWeb, 'index.html'), htmlContent);
console.log(chalk.green("[✔] Carpeta 'Kurumi-Web' creada con index.html integrado perfectamente."));


// === LÓGICA DEL SERVIDOR NODE.JS (BACKEND) ===
const httpServer = createServer((req, res) => {
  // Servir el archivo index.html localmente si entras desde el navegador
  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(fs.readFileSync(path.join(carpetaWeb, 'index.html')));
  } else {
    res.writeHead(404);
    res.end();
  }
});

const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

if (!global.conns) global.conns = [];
const msgRetryCounterCache = new NodeCache({ stdTTL: 0, checkperiod: 0 });
const userDevicesCache = new NodeCache({ stdTTL: 0, checkperiod: 0 });
const groupCache = new NodeCache({ stdTTL: 3600, checkperiod: 300 });
let reintentos = {};
const cleanJid = (jid = '') => jid.replace(/:\d+/, '').split('@')[0];

export async function startSubBot(metodo, phone, socketWeb) {
  const id = phone || "SubBot_" + Math.floor(Math.random() * 10000);
  const sessionFolder = `./Sessions/Subs/${id}`;

  const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);
  const { version } = await fetchLatestBaileysVersion();

  console.info = () => {};
  const sock = makeWASocket({
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    browser: Browsers.macOS('Chrome'),
    auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })) },
    markOnlineOnConnect: true,
    generateHighQualityLinkPreview: true,
    syncFullHistory: false,
    getMessage: async () => '',
    msgRetryCounterCache,
    userDevicesCache,
    cachedGroupMetadata: async (jid) => groupCache.get(jid),
    version,
    keepAliveIntervalMs: 60_000,
    maxIdleTimeMs: 120_000,
  });

  sock.isInit = false;
  sock.ev.on('creds.update', saveCreds);

  sock.decodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
      let decode = jidDecode(jid) || {};
      return (decode.user && decode.server && decode.user + '@' + decode.server) || jid;
    } else return jid;
  };

  sock.ev.on('connection.update', async ({ connection, lastDisconnect, isNewLogin, qr }) => {
    if (isNewLogin) sock.isInit = false;

    if (qr) {
      if (metodo === "qr") {
        socketWeb.emit("resultado_qr", { qr });
      } else if (metodo === "codigo" && !state.creds.registered) {
        try {
          // Retraso controlado para asegurar estabilidad en la petición
          setTimeout(async () => {
            let codeGen = await sock.requestPairingCode(phone, 'KURUMI12');
            codeGen = codeGen.match(/.{1,4}/g)?.join("-") || codeGen;
            console.log(chalk.magenta(`[Código generado]: ${codeGen}`));
            socketWeb.emit("resultado_codigo", { code: codeGen });
          }, 2000);
        } catch (err) {
          console.error("[Error generando código web]", err);
        }
      }
    }

    if (connection === 'open') {
      sock.uptime = Date.now();
      sock.isInit = true;
      sock.userId = cleanJid(sock.user?.id?.split('@')[0]);
      const botDir = sock.userId + '@s.whatsapp.net';
      
      if (!global.db?.data?.settings?.[botDir]) {
        if (!global.db) global.db = { data: { settings: {} } };
        global.db.data.settings[botDir] = {};
      }
      global.db.data.settings[botDir].type = 'Sub';
      
      if (!global.conns.find((c) => c.userId === sock.userId)) {
        global.conns.push(sock);
      }

      delete reintentos[sock.userId || id];
      socketWeb.emit("conexion_exitosa", { name: sock.user.name || "Kurumi Sub-Bot" });
      console.log(chalk.green(`[root@kurumi]# ./connect_subbot.sh ${chalk.yellow(sock.userId)} [OK]`));
    }

    if (connection === 'close') {
      const botId = sock.userId || id;
      const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.reason || 0;
      const intentos = reintentos[botId] || 0;
      reintentos[botId] = intentos + 1;

      socketWeb.emit("conexion_cerrada", { reason });

      if ([401, 403].includes(reason)) {
        if (intentos < 5) {
          setTimeout(() => startSubBot(metodo, phone, socketWeb), 3000);
        } else {
          try { fs.rmSync(sessionFolder, { recursive: true, force: true }); } catch (e) {}
          delete reintentos[botId];
        }
        return;
      }
      setTimeout(() => startSubBot(metodo, phone, socketWeb), 3000);
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    for (let raw of messages) {
      if (!raw.message) continue;
      let msg = await smsg(sock, raw);
      try { main(sock, msg, messages); } catch (err) { console.log(chalk.gray(`[ ✿  ] Sub » ${err}`)); }
    }
  });

  try { await events(sock, null); } catch (err) { console.log(chalk.gray(`[ BOT  ] → ${err}`)); }
  return sock;
}

io.on("connection", (socket) => {
  console.log(chalk.blue("[Web] Cliente conectado mediante Sockets."));
  socket.on("iniciar_vinculacion", async (data) => {
    const { metodo, phoneNumber } = data;
    console.log(chalk.cyan(`[Web] Petición: ${metodo} | Número: ${phoneNumber || "QR"}`));
    await startSubBot(metodo, phoneNumber, socket);
  });
});

console.clear();
cfonts.say('MANCOS SYSTEM', { font: 'block', align: 'center', gradient: ['#00f0ff', '#0072ff'] });

const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(chalk.bgGreen.black.bold(` SERVER OK `), chalk.green(`Servidor todo-en-uno activo en puerto ${PORT}`));
});

if (!global.subsErrorHandler) {
  global.subsErrorHandler = true;
  process.on('uncaughtException', console.error);
}
