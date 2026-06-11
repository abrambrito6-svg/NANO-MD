import os from 'os'
import { performance } from 'perf_hooks'

export default {
  command: ['ownerpanel', 'panelowner', 'opanel', 'nano'],
  category: 'owner',
  owner: true,

  run: async (client, m) => {
    try {
      // ===== TIEMPO Y PERFORMANCE =====
      const runtime = process.uptime()
      const startTime = performance.now()

      const formatTime = (seconds) => {
        const d = Math.floor(seconds / (3600 * 24))
        const h = Math.floor(seconds % (3600 * 24) / 3600)
        const m = Math.floor(seconds % 3600 / 60)
        const s = Math.floor(seconds % 60)
        return `${d}d ${h}h ${m}m ${s}s`
      }

      // ===== SISTEMA CON VALIDACION =====
      const totalRam = (os.totalmem() / 1024).toFixed(2)
      const usedRam = ((os.totalmem() - os.freemem()) / 1024 / 1024 / 1024).toFixed(2)
      const ramPercent = ((usedRam / totalRam) * 100).toFixed(1)

      // FIX: Validar que exista CPU antes de leer model
      const cpus = os.cpus()
      let cpuInfo = 'Unknown CPU'
      let cpuSpeed = 'N/A'

      if (cpus && cpus.length > 0 && cpus[0].model) {
        const modelSplit = cpus[0].model.split(' ')
        cpuInfo = modelSplit.slice(0, 2).join(' ') || 'Unknown'
        cpuSpeed = cpus[0].speed? (cpus[0].speed / 1000).toFixed(1) + 'GHz' : 'N/A'
      }

      const platform = os.platform().toUpperCase()
      const nodeVer = process.version
      const arch = os.arch()

      // ===== BOT STATS CON VALIDACION =====
      const totalUsers = global.db?.data?.users? Object.keys(global.db.data.users).length : 0
      const totalChats = global.db?.data?.chats? Object.keys(global.db.data.chats).length : 0
      const totalCmds = global.plugins? Object.keys(global.plugins).length : 0
      const banned = global.db?.data?.users? Object.values(global.db.data.users).filter(v => v?.banned).length : 0

      // ===== STATUS DINAMICO CON VALIDACION =====
      const botJid = client.user?.jid || client.user?.id
      const dbStatus = global.db? '🟢' : '🔴'
      const aiStatus = global.db?.data?.settings?.[botJid]?.ia? '🟢' : '🔴'
      const antiBotStatus = global.db?.data?.settings?.[botJid]?.antibot? '🟢' : '🔴'
      const ping = (performance.now() - startTime).toFixed(2)

      const text = `
╔═══❖•ೋ° 𝗡𝗔𝗡𝗢 𝗣𝗔𝗡𝗘𝗟 °ೋ•❖═══╗
║ —͟͞ ♱ *CONTROL TOTAL* ♱ —͟͟͞͞
╚═══❖•ೋ° ༻✧༺ °ೋ•❖═══╝

┏━━━━━✦❘༻💀༺❘✦━━━━━┓
┃ 👑 *Owner* » nano
┃ 🩸 *Bot* » ${global.namebot || 'nano-MD'}
┃ ⚡ *Runtime* » ${formatTime(runtime)}
┃ 🔱 *Platform* » ${platform} ${arch}
┃ 🧠 *RAM* » ${usedRam}GB / ${totalRam}GB [${ramPercent}%]
┃ 🔥 *CPU* » ${cpuInfo} @${cpuSpeed}
┃ 📊 *Node* » ${nodeVer}
┃ ☠️ *Users* » ${totalUsers} | *Chats* » ${totalChats}
┃ ⛔ *Banned* » ${banned}
┃ 📡 *Ping* » ${ping}ms
┗━━━━━✦❘༻💀༺❘✦━━━━━┛

╭─━━━⊱ ⚙️ *CONTROL* ⊰━━━─╮
│ ⬡ *.public* » Modo publico
│ ⬡ *.self* » Modo privado
│ ⬡ *.ban* • *.unban* + [@]
│ ⬡ *.gp on/off* » Solo grupos
│ ⬡ *.antibots on/off* » Anti-spam
│ ⬡ *.welcome on/off* » Bienvenida
│ ⬡ *.detect on/off* » Detector
╰─━━━⊱✧༻♱༺✧⊰━━━─╯

╭─━━━⊱ 🩸 *IA SYSTEM* ⊰━━━─╮
│ ⬡ *.chatgpt* » ChatGPT-5
│ ⬡ *.autoreply on/off* » Auto IA
│ ⬡ *.resetia* » Reset memoria
│ ⬡ *.setprompt* + [texto]
│ ⬡ *.memory* » Ver contexto
│ ⬡ *.aiimg* » Generar imagen
╰─━━━⊱✧༻♱༺✧⊰━━━─╯

╭─━━━⊱ 💀 *DEV TOOLS* ⊰━━━─╮
│ ⬡ *.eval* » Ejecutar JS
│ ⬡ *.exec* » Terminal
│ ⬡ *.restart* » Reiniciar bot
│ ⬡ *.backup* » Backup DB
│ ⬡ *.update* » Git pull
│ ⬡ *.getplugin* » Descargar plugin
│ ⬡ *.addowner* • *.delowner*
╰─━━━⊱✧༻♱༺✧⊰━━━─╯

╭─━━━⊱ 📊 *STATUS LIVE* ⊰━━━─╮
│ ${dbStatus} Database Connected
│ 🟢 Baileys Online
│ ${antiBotStatus} AntiBots Active
│ ${aiStatus} AI System Loaded
│ 🟢 ${totalCmds} Commands Ready
│ 🔴 Mental Stability Missing
╰─━━━⊱✧༻♱༺✧⊰━━━─╯

> “el poder no corrompe…
> solo revela al pendejo que ya eras 💀”
>
> —͟͟͞͞ ♱ *Nano Void* ♱ —͟͟͞͞`.trim()

      await m.react('⚡')

      await client.sendMessage(
        m.chat,
        {
          image: {
            url: 'https://i.ibb.co/QF9swPd5/7a5656fd1a1038e5a686392823c48ace.jpg'
          },
          caption: text,
          contextInfo: {
            forwardingScore: 999999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: '120363427643259597@newsletter',
              newsletterName: '『 𝙉𝙖𝙣𝙤 𝙎𝙮𝙨𝙩𝙚𝙢 𝘾𝙝𝙖𝙣𝙚𝙡 』',
              serverMessageId: 1
            },
            externalAdReply: {
              title: '⚡ NANO PANEL V2.1',
              body: 'Control Total del Sistema',
              thumbnailUrl: 'https://i.ibb.co/QF9swPd5/7a5656fd1a1038e5a686392823c48ace.jpg',
              sourceUrl: 'https://whatsapp.com/channel/TU-CANAL-AQUI',
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
      await m.reply(`《✧》 Error en el panel\n\n${e.message}`)
    }
  }
}
