import os from 'os'
import { performance } from 'perf_hooks'

function runtime(seconds) {
  seconds = Number(seconds)
  const d = Math.floor(seconds / (3600 * 24))
  const h = Math.floor(seconds % (3600 * 24) / 3600)
  const m = Math.floor(seconds % 3600 / 60)
  const s = Math.floor(seconds % 60)
  return `${d}d ${h}h ${m}m ${s}s`
}

export default {
  command: ['infobot', 'infosocket', 'info', 'botinfo'],
  category: 'info',

  run: async (client, m, args, usedPrefix, command) => {
    try {
      const startTime = performance.now()

      // ===== DETECTAR BOT =====
      const botId = client.user?.id || client.user?.jid
      const botNumber = botId?.split(':')[0] + '@s.whatsapp.net'
      const settings = global.db?.data?.settings?.[botNumber] || {}

      // ===== INFO DEL BOT =====
      const botname = settings.botname || 'nano-MD'
      const namebot = settings.namebot || 'Nano System'
      const owner = settings.owner || global.owner?.[0]?.[0] + '@s.whatsapp.net' || 'Sin owner'
      const prefix = settings.prefix || usedPrefix || '.'
      const link = settings.link || 'https://whatsapp.com/channel/TU-CANAL-AQUI'

      // ===== SISTEMA CON VALIDACION =====
      const platform = os.platform().toUpperCase()
      const arch = os.arch()
      const nodeVer = process.version

      const totalRam = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2)
      const usedRam = ((os.totalmem() - os.freemem()) / 1024 / 1024).toFixed(2)
      const ramPercent = ((usedRam / totalRam) * 100).toFixed(1)

      // CPU Safe
      const cpus = os.cpus()
      let cpuInfo = 'Unknown CPU'
      let cpuCores = 'N/A'
      if (cpus && cpus.length > 0) {
        cpuInfo = cpus[0].model?.split(' ').slice(0, 2).join(' ') || 'Unknown'
        cpuCores = cpus.length + ' Cores'
      }

      const uptime = runtime(process.uptime())
      const ping = (performance.now() - startTime).toFixed(2)

      // ===== TIPO DE BOT =====
      const isMain = botNumber === global.client?.user?.id?.split(':')[0] + '@s.whatsapp.net'
      const typeBot = isMain? '👑 Principal' : '🔹 Sub-Bot'

      // ===== STATS =====
      const totalUsers = global.db?.data?.users? Object.keys(global.db.data.users).length : 0
      const totalChats = global.db?.data?.chats? Object.keys(global.db.data.chats).length : 0
      const totalCmds = global.plugins? Object.keys(global.plugins).length : 0
      const mode = global.db?.data?.settings?.[botNumber]?.self? '🔒 Self' : '🌐 Public'

      // ===== PREFIX FORMATEADO =====
      const prefixText = Array.isArray(prefix)? prefix.join(' | ') : prefix

      const text = `
╔═══❖•ೋ° 𝗜𝗡𝗙𝗢 𝗡𝗔𝗡𝗢-𝗠𝗗 °ೋ•❖═══╗
║ —͟͞ ♱ *SISTEMA ACTIVO* ♱ —͟͟͞͞
╚═══❖•ೋ° ༻✧༺ °ೋ•❖═══╝

┏━━━━━✦❘༻༺❘✦━━━━━┓
┃ 💎 *Nombre* » ${botname}
┃ 🩸 *Sistema* » ${namebot}
┃ 🔱 *Tipo* » ${typeBot}
┃ ⚙️ *Modo* » ${mode}
┃ 🌐 *Plataforma* » ${platform} ${arch}
┃ 📊 *Node* » ${nodeVer}
┗━━━━━✦❘༻🤖༺❘✦━━━━━┛

╭─━━━⊱ 📈 *RECURSOS* ⊰━━━─╮
│ 🧠 *RAM* » ${usedRam}GB / ${totalRam}GB [${ramPercent}%]
│ 🔥 *CPU* » ${cpuInfo}
│ ⚡ *Cores* » ${cpuCores}
│ ⏳ *Uptime* » ${uptime}
│ 📡 *Ping* » ${ping}ms
╰─━━━⊱✧༻♱༺✧⊰━━━─╯

╭─━━━⊱ 📊 *ESTADISTICAS* ⊰━━━─╮
│ 👥 *Usuarios* » ${totalUsers}
│ 💬 *Chats* » ${totalChats}
│ ⚡ *Comandos* » ${totalCmds}
│ 💎 *Prefix* » ${prefixText}
╰─━━━⊱✧༻♱༺✧⊰━━━─╯

╭─━━━⊱ 👑 *OWNER* ⊰━━━─╮
│ ⬡ @${owner.replace(/@s\.whatsapp\.net/g, '')}
╰─━━━⊱✧༻♱༺✧⊰━━━─╯

╭─━━━⊱ 🔗 *LINK OFICIAL* ⊰━━━─╮
│ ${link}
╰─━━━⊱✧༻♱༺✧⊰━━━─╯

> “el código no falla…
> solo tú no lo entiendes ”
>
> —͟͟͞͞ ♱ *Nano Protocol* ♱ —͟͟͞͞`.trim()

      await m.react('💎')

      await client.sendMessage(
        m.chat,
        {
          image: {
            url: 'https://i.ibb.co/QF9swPd5/7a5656fd1a1038e5a686392823c48ace.jpg'
          },
          caption: text,
          contextInfo: {
            mentionedJid: [owner],
            forwardingScore: 999999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: '120363427643259597@newsletter',
              newsletterName: '『 𝙉𝙖𝙣𝙤 𝙎𝙮𝙨𝙩𝙚𝙢 𝘾𝙝𝙖𝙣𝙚𝙡 』',
              serverMessageId: 1
            },
            externalAdReply: {
              title: `💎 ${botname}`,
              body: 'Nano Protocol Active',
              thumbnailUrl: 'https://i.ibb.co/QF9swPd5/7a5656fd1a1038e5a686392823c48ace.jpg',
              sourceUrl: link,
              mediaType: 1,
              renderLargerThumbnail: true,
              showAdAttribution: false
            }
          }
        },
        { quoted: m }
      )

    } catch (e) {
      console.error(e)
      m.reply(`《✧》 Error en infobot\n\n${e.message}\n\n💀 *Nano System*`)
    }
  }
}
