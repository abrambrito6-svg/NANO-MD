import { startSubBot } from '../../core/subs.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
let commandFlags = {}

export default {
  command: ['code', 'qr'],
  category: 'socket',
  run: async (client, m, args, usedPrefix, command) => {
    let time = global.db.data.users[m.sender].Subs + 120000 || ''
    if (new Date() - global.db.data.users[m.sender].Subs < 120000) {
      return client.reply(m.chat, `⏰ *Piso B6 - Espera*\n\nDebes esperar *${msToTime(time - new Date())}* para invocar otro socket.`, m)
    }

    const subsPath = path.join(dirname, '../../Sessions/Subs')
    const subsCount = fs.existsSync(subsPath)
     ? fs.readdirSync(subsPath).filter((dir) => {
          const credsPath = path.join(subsPath, dir, 'creds.json')
          return fs.existsSync(credsPath)
        }).length : 0

    const maxSubs = 50
    if (subsCount >= maxSubs) {
      return client.reply(m.chat, '💔 *Piso B6 saturado*\n\nNo hay más celdas disponibles. Zack está ocupado...', m)
    }

    commandFlags[m.sender] = true

    const botJid = client.user?.id?.split(':')[0] + '@s.whatsapp.net'
    const botSettings = global.db.data?.settings?.[botJid] || {}
    const namebot = botSettings.namebot || 'Rachel-MD'
    const senderTag = `@${m.sender.split('@')[0]}`

    // 🥀 MINI BANNER RACHEL
    const miniBanner = `╭─⌈ |🜸*${namebot}*  ⌋─╮\n│ |🜸 *Piso B6 - Angels of Death*\n╰────────────────╯\n\n *Canal Oficial:* https://whatsapp.com/channel/0029Vb88DAM0G0XiQes3K42c\n`

    const rtx = `${miniBanner}
┏━━━━━━━━━━━━━━━━━━┓
┃  |🜸 solicitud de *CODE**  ┃
┗━━━━━━━━━━━━━━━━━━┛

➊ *WhatsApp* > Dispositivos vinculados
➋ *Vincular dispositivo* > Con número  
➌ *Ingresa el código* que te dará Dios

┌─⌈ *|🜸* ⌋─
├ |🜸 usuario: ${senderTag}
├ |🜸msximo: *${subsCount}/${maxSubs}* 
├ |🜸estado: desconocido 
└─⌈ *PRAY FOR ME* ⌋─

⚠️ *El código se desvanece en 60s*`

    const rtx2 = `${miniBanner}
┏━━━━━━━━━━━━━━━━━━┓
┃  🥀 *INVOCACIÓN QR*  ┃
┗━━━━━━━━━━━━━━━━━━┛

➊ *WhatsApp* > Dispositivos vinculados  
➋ *Vincular dispositivo*
➌ *Escanea el sello* de Dios

┌─⌈ *CELDA B6* ⌋─
├ Prisionero: ${senderTag}
├ Celdas: *${subsCount}/${maxSubs}* 💔
├ Estado: *Esperando a Zack* ✅
└─⌈ *PRAY FOR ME* ⌋─

⚠️ *El sello se desvanece en 60s*`

    const isCode = /^(code)$/.test(command)
    const isCommands = /^(code|qr)$/.test(command)
    const isCommand = isCommands? true : false
    const caption = isCode? rtx : rtx2
    const phone = args[0]? args[0].replace(/\D/g, '') : m.sender.split('@')[0]

    await startSubBot(m, client, caption, isCode, phone, m.chat, commandFlags, isCommand)
    global.db.data.users[m.sender].Subs = new Date() * 1
  }
};

function msToTime(duration) {
  var milliseconds = parseInt((duration % 1000) / 100),
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
  hours = hours < 10? '0' + hours : hours
  minutes = minutes > 0? minutes : ''
  seconds = seconds < 10 && minutes > 0? '0' + seconds : seconds
  if (minutes) {
    return `${minutes} minuto${minutes > 1? 's' : ''}, ${seconds} segundo${seconds > 1? 's' : ''}`
  } else {
    return `${seconds} segundo${seconds > 1? 's' : ''}`
  }
}
