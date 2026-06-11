const NL = {
  contextInfo: {
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: '120363427643259597@newsletter',
      newsletterName: '『 𝙕𝙖𝙛𝙠ι𝙚λ 𝘾𝙝𝙖𝙣𝗻𝙚λ 』',
      serverMessageId: 1
    }
  }
}

// ─── Memoria en RAM ──────────────
const tagCount = globalThis.__kurumiTagCount ||= {}     // contador por usuario
const warnedTag = globalThis.__kurumiWarnedTag ||= {}   // avisos por usuario

// ╔══════════ HOOK before ══════════
export async function before(client, m) {
  try {
    if (!m || !m.isGroup || m.fromMe) return

    const chat = (global.db.data.chats ||= {})[m.chat] ||= {}
    const bot = (global.db.data.settings ||= {})[client.user?.id?.split(':')[0] + '@s.whatsapp.net'] ||= {}

    if (!bot.antitag) return

    // Proteger admins y owners
    try {
      const meta = await client.groupMetadata(m.chat)
      const participant = meta.participants.find(v => v.id === m.sender)
      const isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin'
      const isOwner = (global.owner || []).some(([n]) => (n + '@s.whatsapp.net') === m.sender)

      if (isAdmin || isOwner) return
    } catch {}

    const sender = m.sender
    const now = Date.now()

    // Detectar menciones masivas
    let mentionCount = 0

    // Caso 1: Menciones directas (@everyone o muchas personas)
    const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || 
                     m.message?.extendedTextMessage?.mentionedJid || []

    mentionCount = mentioned.length

    // Caso 2: Mensajes que contienen ".tagall", ".everyone", ".mencion", etc.
    const text = (m.text || m.body || '').toLowerCase()
    const tagCommands = ['.tagall', '.tag', '.everyone', '.todos', '.mencion', '.mention', '.hidetag']
    
    const isTagCommand = tagCommands.some(cmd => text.includes(cmd))

    if (isTagCommand || mentionCount >= 8) {  // 8+ menciones = considerado tagall
      tagCount[sender] = (tagCount[sender] || 0) + 1

      const totalTags = tagCount[sender]

      const mentionUser = `@${sender.split('@')[0]}`

      if (totalTags === 2) {
        warnedTag[sender] = 1
        await client.sendMessage(m.chat, {
          text: `╭━━━〔 𝙆𝙪𝙧𝙪𝙢𝙞 𝙏𝙤𝙠𝙞𝙨𝙖𝙠𝙞 〕━━━╮\n` +
                `┃ ⚠︎ Primera advertencia ${mentionUser}\n` +
                `┃ ✿ Detecté que mencionaste a todos por segunda vez.\n` +
                `┃ ❏ Detente o serás eliminada del tiempo.\n` +
                `╰━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
                `《✧》 「 𝙕𝙖𝙛𝙠𝙞𝙚𝙡 𝘾𝙝𝙖𝙣𝙣𝙚𝙡 」`,
          mentions: [sender],
          ...NL
        }, { quoted: m })

      } else if (totalTags === 3) {
        warnedTag[sender] = 2
        await client.sendMessage(m.chat, {
          text: `╭━━━〔 𝙆𝙪𝙧𝙪𝙢𝙞 𝙏𝙤𝙠𝙞𝙨𝙖𝙠𝙞 〕━━━╮\n` +
                `┃ ⚠︎ Segunda advertencia ${mentionUser}\n` +
                `┃ ✿ Te lo advertí... una más y te enviaré al vacío.\n` +
                `╰━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
                `《✧》 「 𝙕𝙖𝙛𝙠𝙞𝙚𝙡 𝘾𝙝𝙖𝙣𝙣𝙚𝙡 」`,
          mentions: [sender],
          ...NL
        }, { quoted: m })

      } else if (totalTags >= 4) {
        await client.sendMessage(m.chat, {
          text: `╭━━━〔 𝙆𝙪𝙧𝙪𝙢𝙞 𝙏𝙤𝙠𝙞𝙨𝙖𝙠𝙞 〕━━━╮\n` +
                `┃ 👺 Eliminad@: ${mentionUser}\n` +
                `┃ ✎ Razón: Abuso de menciones masivas.\n` +
                `┃ ❏ El tiempo de tu existencia en este grupo ha terminado.\n` +
                `╰━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
                `《✧》 「 𝙕𝙖𝙛𝙠𝙞𝙚𝙡 𝘾𝙝𝙖𝙣𝙣𝙚𝙡 」`,
          mentions: [sender],
          ...NL
        }, { quoted: m })

        await client.groupParticipantsUpdate(m.chat, [sender], 'remove').catch(() => {})
        delete tagCount[sender]
        delete warnedTag[sender]
      }
    }

  } catch (e) {
    console.error('[antitag] error:', e)
  }
}

// ╔══════════ Comando principal ══════════
export default {
  command: ['antitag'],
  category: 'grupo',
  isAdmin: true,
  botAdmin: false,
  isOwner: false,
  before,

  run: async (client, m, args, usedPrefix, command) => {
    try {
      const jid = client.user?.id?.split(':')[0] + '@s.whatsapp.net'
      const bot = global.db.data.settings[jid] ||= {}

      const op = (args[0] || '').toLowerCase()

      if (!['on', 'off'].includes(op)) {
        return client.sendMessage(m.chat, {
          text: `╭━━〔 𝙆𝙪𝙧𝙪𝙢𝙞 𝘼𝙣𝙩𝙞-𝙏𝙖𝙜 〕━━╮\n` +
                `┃ ✿ Uso: \( {usedPrefix} \){command} on/off\n` +
                `┃ ❏ Estado: ${bot.antitag ? '🟢 Activo' : '🔴 Inactivo'}\n` +
                `┃ ❏ Límite: 2 menciones masivas = aviso | 4 = expulsión\n` +
                `╰━━━━━━━━━━━━━━━━━━━━╯\n\n` +
                `《✧》 「 𝙕𝙖𝙛𝙠𝙞𝙚𝙡 𝘾𝙝𝙖𝙣𝙣𝙚𝙡 」`,
          ...NL
        }, { quoted: m })
      }

      bot.antitag = op === 'on'

      await client.sendMessage(m.chat, {
        text: `《✧》 𝑲𝒖𝒓𝒖𝒎𝒊 ${bot.antitag ? 'activó' : 'desactivó'} el modo *Anti-Tag* ✿\n\n` +
              `❏ A partir de ahora, quien abuse de las menciones masivas será castigado.\n` +
              `「 𝙕𝙖𝙛𝙠𝙞𝙚𝙡 𝘾𝙝𝙖𝙣𝙣𝙚𝙡 」`,
        ...NL
      }, { quoted: m })

    } catch (e) {
      m.reply(`✘ Error en *\( {usedPrefix + command}*\n\n \){e.message}`)
    }
  }
}
