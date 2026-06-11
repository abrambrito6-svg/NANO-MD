const NL = {
  contextInfo: {
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: '120363427643259597@newsletter',
      newsletterName: '『 𝙕𝙖𝙛𝙠ι𝙚λ 𝘾𝙝𝙖𝙣𝗻𝙚𝙡 』',
      serverMessageId: 1
    }
  }
}

// ─── Memoria en RAM ──────────────
const spamMap = globalThis.__kurumiSpamMap ||= {}
const warnedSpam = globalThis.__kurumiWarnedSpam ||= {}

// ╔══════════ ANTI-SPAM (PROTECCIÓN OWNER MEJORADA) ══════════
export const all = async function (m, { client }) {
  try {
    if (!m.isGroup || m.fromMe) return

    const bot = (global.db.data.settings ||= {})[client.user?.id?.split(':')[0] + '@s.whatsapp.net'] ||= {}
    if (!bot.antiSpam) return

    const sender = m.sender
    const senderNumber = sender.split('@')[0]

    // === PROTECCIÓN OWNER MUY ROBUSTA ===
    const isOwner = (global.owner || []).some(owner => {
      if (!owner) return false
      const ownerStr = Array.isArray(owner) ? owner[0].toString() : owner.toString()
      return ownerStr === senderNumber || 
             ownerStr === senderNumber.replace('+', '') ||
             '+'.concat(ownerStr) === sender ||
             ownerStr.includes(senderNumber) ||
             sender.includes(ownerStr)
    })

    if (isOwner) {
      console.log(`[ANTI-SPAM] Owner detectado: ${sender} → Ignorado`)
      return
    }

    // Proteger admins del grupo
    try {
      const meta = await client.groupMetadata(m.chat)
      const isAdmin = meta.participants.find(p => p.id === sender)?.admin
      if (isAdmin) return
    } catch {}

    const now = Date.now()
    const WINDOW = 8000
    const LIMIT = 4
    const REPEAT_LIMIT = 3

    let text = (m.text || m.body || m.message?.conversation || m.message?.extendedTextMessage?.text || '').toString().trim().toLowerCase()
    const stickerId = m.message?.stickerMessage?.fileSha256?.toString('base64')
    const fingerprint = stickerId || text

    if (!fingerprint) return

    spamMap[sender] ||= { times: [], hist: [] }
    const s = spamMap[sender]

    s.times = s.times.filter(t => now - t < WINDOW)
    s.times.push(now)

    s.hist.push(fingerprint)
    if (s.hist.length > 8) s.hist.shift()

    const repeatCount = s.hist.filter(x => x === fingerprint).length
    const isSpam = s.times.length >= LIMIT || repeatCount >= REPEAT_LIMIT

    if (!isSpam) return

    console.log(`[ANTI-SPAM] 🔥 Detectado spam de: ${sender}`)

    warnedSpam[sender] = (warnedSpam[sender] || 0) + 1
    const warns = warnedSpam[sender]

    if (warns === 1) {
      await client.sendMessage(m.chat, { text: `⚠️ @${senderNumber} Primera advertencia por spam.`, mentions: [sender], ...NL }, { quoted: m })
    } else if (warns === 2) {
      await client.sendMessage(m.chat, { text: `⚠️ @${senderNumber} Última oportunidad.`, mentions: [sender], ...NL }, { quoted: m })
    } else if (warns >= 3) {
      await client.sendMessage(m.chat, {
        text: `╭━━━〔 𝙆𝙪𝙧𝙪𝙢𝙞 𝙏𝙤𝙠𝙞𝙨𝙖𝙠𝙞 〕━━━╮\n┃ 👺 Eliminad@ @${senderNumber}\n┃ ✎ Razón: Spam reiterado.\n┃ ❏ Tu tiempo aquí ha terminado.\n╰━━━━━━━━━━━━━━━━━━━━━╯`,
        mentions: [sender],
        ...NL
      }, { quoted: m })

      await client.groupParticipantsUpdate(m.chat, [sender], 'remove').catch(() => {})
      delete spamMap[sender]
      delete warnedSpam[sender]
    }

  } catch (e) {
    console.error('[ANTI-SPAM ERROR]:', e)
  }
}

// ╔══════════ Comando Toggle ══════════
export default {
  command: ['antispam'],
  category: 'grupo',
  isAdmin: true,

  run: async (client, m, args) => {
    const bot = (global.db.data.settings ||= {})[client.user?.id?.split(':')[0] + '@s.whatsapp.net'] ||= {}
    const op = (args[0] || '').toLowerCase()

    if (op === 'on') {
      bot.antiSpam = true
      m.reply(`《✧》 𝑲𝒖𝒓𝒖𝒎𝒊 activó el **Anti-Spam** ✿`)
    } else if (op === 'off') {
      bot.antiSpam = false
      m.reply(`《✧》 𝑲𝒖𝒓𝒖𝒎𝒊 desactivó el Anti-Spam.`)
    } else {
      m.reply(`Estado: ${bot.antiSpam ? '🟢 Activo' : '🔴 Inactivo'}\nUso: .antispam on/off`)
    }
  }
}
