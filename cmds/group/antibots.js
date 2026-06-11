// cmds/antibots.js
const NL = {
  contextInfo: {
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: '120363427643259597@newsletter',
      newsletterName: '『 𝙕𝙖𝙛𝙠ι𝙚λ 𝘾𝙝𝙖𝗻𝗻𝙚𝙡 』',
      serverMessageId: 1
    }
  }
}

const warnedBots = globalThis.__kurumiWarnedBots ||= {}

export const all = async function (m, { client }) {
  try {
    if (!m.isGroup || m.fromMe) return

    const bot = (global.db.data.settings ||= {})[client.user?.id?.split(':')[0] + '@s.whatsapp.net'] ||= {}
    if (!bot.antibots) return

    const sender = m.sender
    const text = (m.text || '').toLowerCase().trim()

    // Protección: no tocar owner ni admins
    try {
      const meta = await client.groupMetadata(m.chat)
      const isAdmin = meta.participants?.find(p => p.id === sender)?.admin
      const isOwner = sender.includes("50231882808") || (global.owner || []).some(num => (num + '@s.whatsapp.net') === sender)
      if (isAdmin || isOwner) return
    } catch {}

    // Patrones típicos de bots intrusos
    const botPatterns = [
      "gojobot", "bot-md", "status - ping", "latency", "uptime", "ram", "node v", "error usuario.exe", "sistema corrupto"
    ]

    const isBotDetected = botPatterns.some(p => text.includes(p))
    if (!isBotDetected) return

    console.log(`[ANTIBOTS] 🚨 Detectado bot: "${text}" → ${sender}`)

    // Eliminar mensaje
    await client.sendMessage(m.chat, { delete: m.key }).catch(() => {})

    // Advertencias y kick
    warnedBots[sender] = (warnedBots[sender] || 0) + 1
    const warns = warnedBots[sender]

    if (warns === 1) {
      await client.sendMessage(m.chat, {
        text: `⚠️ @${sender.split('@')[0]} posible bot detectado. Primera advertencia.`,
        mentions: [sender], ...NL
      }, { quoted: m })
    } else if (warns === 2) {
      await client.sendMessage(m.chat, {
        text: `⚠️ @${sender.split('@')[0]} segunda advertencia. El sistema Gardner observa...`,
        mentions: [sender], ...NL
      }, { quoted: m })
    } else if (warns >= 3) {
      await client.sendMessage(m.chat, {
        text: `👺 @${sender.split('@')[0]} eliminado por comportamiento de bot.`,
        mentions: [sender], ...NL
      }, { quoted: m })

      await client.groupParticipantsUpdate(m.chat, [sender], 'remove').catch(() => {})
      delete warnedBots[sender]
    }

  } catch (e) {
    console.error('[ANTIBOTS ERROR]:', e)
  }
}

export default {
  command: ['antibots'],
  category: 'grupo',
  isAdmin: true,

  run: async (client, m, args) => {
    const bot = (global.db.data.settings ||= {})[client.user?.id?.split(':')[0] + '@s.whatsapp.net'] ||= {}
    const op = (args[0] || '').toLowerCase()

    if (op === 'on') {
      bot.antibots = true
      m.reply(`《✧》 𝑲𝒖𝒓𝒖𝒎𝒊 activó el **Anti-Bots ULTRA** ✿`)
    } else if (op === 'off') {
      bot.antibots = false
      m.reply(`《✧》 𝑲𝒖𝒓𝒖𝒎𝒊 desactivó el Anti-Bots.`)
    } else {
      m.reply(`Estado actual: ${bot.antibots ? '🟢 Activo' : '🔴 Inactivo'}\nUso: .antibots on/off`)
    }
  }
}
