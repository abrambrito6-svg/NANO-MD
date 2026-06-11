import express from 'express'
import cors from 'cors'
import { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, Browsers } from '@whiskeysockets/baileys'
import pino from 'pino'
import NodeCache from 'node-cache'
import fs from 'fs'

const app = express()
app.use(cors())
app.use(express.json())

const msgRetryCounterCache = new NodeCache({ stdTTL: 0 })
const pendingSessions = new Map()

// ===========================
// GENERAR CÓDIGO
// ===========================
app.post('/api/code', async (req, res) => {
  const { phone } = req.body

  if (!phone || phone.length < 8) {
    return res.json({ success: false, error: 'Número inválido' })
  }

  // Limpiar número
  const cleanPhone = phone.replace(/\D/g, '')

  // Verificar si ya tiene sesión activa
  const sessionFolder = `./Sessions/Subs/${cleanPhone}`
  const credsPath = `${sessionFolder}/creds.json`
  if (fs.existsSync(credsPath)) {
    return res.json({ success: false, error: 'Este número ya tiene un sub-bot activo' })
  }

  // Verificar límite de sub-bots
  const subsPath = './Sessions/Subs'
  const subsCount = fs.existsSync(subsPath)
    ? fs.readdirSync(subsPath).filter(dir => {
        return fs.existsSync(`${subsPath}/${dir}/creds.json`)
      }).length
    : 0

  if (subsCount >= 50) {
    return res.json({ success: false, error: 'Límite de sub-bots alcanzado (50/50)' })
  }

  try {
    const { state, saveCreds } = await useMultiFileAuthState(sessionFolder)
    const { version } = await fetchLatestBaileysVersion()

    const sock = makeWASocket({
      logger: pino({ level: 'silent' }),
      printQRInTerminal: false,
      browser: Browsers.macOS('Chrome'),
      auth: state,
      version,
      msgRetryCounterCache
    })

    sock.ev.on('creds.update', saveCreds)

    // Esperar QR event para pedir código
    const code = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout al generar código'))
      }, 15000)

      sock.ev.on('connection.update', async ({ qr, connection }) => {
        if (qr) {
          clearTimeout(timeout)
          try {
            let pairingCode = await sock.requestPairingCode(cleanPhone, 'KURUMI12')
            pairingCode = pairingCode?.match(/.{1,4}/g)?.join('-') || pairingCode
            resolve(pairingCode)
          } catch (err) {
            reject(err)
          }
        }

        if (connection === 'open') {
          clearTimeout(timeout)
          // Bot conectado exitosamente
          console.log(`[API] Sub-bot conectado: ${cleanPhone}`)

          // Agregar a global.conns si existe
          if (global.conns) {
            sock.userId = cleanPhone
            if (!global.conns.find(c => c.userId === cleanPhone)) {
              global.conns.push(sock)
            }
          }
        }
      })
    })

    res.json({ success: true, code })

  } catch (err) {
    console.error('[API Error]', err)
    // Limpiar sesión fallida
    try { fs.rmSync(sessionFolder, { recursive: true, force: true }) } catch {}
    res.json({ success: false, error: err.message || 'Error al generar código' })
  }
})

// ===========================
// STATS
// ===========================
app.get('/api/stats', (req, res) => {
  const subsPath = './Sessions/Subs'
  const subsCount = fs.existsSync(subsPath)
    ? fs.readdirSync(subsPath).filter(dir => {
        return fs.existsSync(`${subsPath}/${dir}/creds.json`)
      }).length
    : 0

  res.json({
    success: true,
    subs: subsCount,
    maxSubs: 50,
    available: 50 - subsCount,
    status: 'online'
  })
})

// ===========================
// INICIAR SERVIDOR
// ===========================
export function startAPI() {
  const PORT = process.env.PORT || 3001
  app.listen(PORT, () => {
    console.log(`[API] Servidor corriendo en puerto ${PORT}`)
  })
}

export default app
