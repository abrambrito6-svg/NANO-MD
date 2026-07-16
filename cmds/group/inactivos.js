export default {
  command: ['fantasmas', 'topinactive', 'inactivos'],
  category: 'grupo',
  isAdmin: true,
  run: async (client, m, args, usedPrefix, command) => {
    try {
      const groupMetadata = await client.groupMetadata(m.chat).catch(() => null)
      if (!groupMetadata) return m.reply('> Este comando solo funciona en grupos.')

      const chat = global.db.data.chats[m.chat] || {}
      const chatUsers = chat.users || {}
      const participants = groupMetadata.participants || []

      const DAYS_THRESHOLD = parseInt(args[0]) || 15 // días de inactividad, configurable
      const THRESHOLD_MS = DAYS_THRESHOLD * 24 * 60 * 60 * 1000
      const now = Date.now()

      const candidates = []

      for (const p of participants) {
        const jid = p.id || p.jid
        if (p.admin) continue // nunca incluir admins
        if (jid === client.user.id.split(':')[0] + '@s.whatsapp.net') continue // nunca al bot

        const userData = chatUsers[jid]
        const msgCount = userData?.msgCount || 0
        const lastSeen = userData?.lastSeen || null

        const isInactive = !lastSeen || (now - lastSeen > THRESHOLD_MS)
        if (isInactive) {
          candidates.push({ jid, msgCount, lastSeen })
        }
      }

      if (candidates.length === 0) {
        return m.reply(`> ✎ No se encontraron usuarios inactivos (+${DAYS_THRESHOLD} días).`)
      }

      // Ordena: primero los que nunca han hablado, luego por más tiempo inactivo
      candidates.sort((a, b) => {
        if (!a.lastSeen && !b.lastSeen) return 0
        if (!a.lastSeen) return -1
        if (!b.lastSeen) return 1
        return a.lastSeen - b.lastSeen
      })

      // Guarda la lista en la DB del chat para que kickinactive la use después
      chat.lastInactiveScan = {
        timestamp: now,
        users: candidates.map(c => c.jid)
      }
      global.db.data.chats[m.chat] = chat

      const lines = candidates.slice(0, 30).map((c, i) => {
        const phone = c.jid.split('@')[0]
        const status = c.lastSeen
          ? `inactivo hace ${Math.floor((now - c.lastSeen) / (24 * 60 * 60 * 1000))} días`
          : 'nunca ha hablado'
        return `${i + 1}. @${phone} — ${c.msgCount} msgs, ${status}`
      })

      const text = `╭─❍「 👻 𝗙𝗮𝗻𝘁𝗮𝘀𝗺𝗮𝘀 」❍─╮
┊
┊ Usuarios inactivos (+${DAYS_THRESHOLD} días): *${candidates.length}*
┊
${lines.map(l => `┊ ${l}`).join('\n')}
┊
┊ Usa *${usedPrefix}kickinactive* para expulsarlos.
┊ _(Esta lista se guardó, tienes 10 min para confirmar)_
┊
╰─❍《✧》𝙕𝙖𝙛𝙠𝙞𝙚𝙡 𝙎𝙮𝙨𝙩𝙚𝙢 ❍─╯`

      await client.sendMessage(m.chat, {
        text,
        mentions: candidates.slice(0, 30).map(c => c.jid)
      }, { quoted: m })

    } catch (e) {
      await m.reply(`> An unexpected error occurred while executing command *${usedPrefix + command}*.\n> [Error: *${e.message}*]`)
    }
  }
}