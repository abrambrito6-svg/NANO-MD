export default {
  command: ['audit', 'groupaudit'],
  category: 'grupo',
  isAdmin: true,
  run: async (client, m, args, usedPrefix, command) => {
    try {
      const groupMetadata = await client.groupMetadata(m.chat).catch(() => null)
      if (!groupMetadata) return m.reply('> Este comando solo funciona en grupos.')

      const participants = groupMetadata.participants || []
      const totalMembers = participants.length
      const totalAdmins = participants.filter(p => p.admin).length

      const chat = global.db.data.chats[m.chat] || {}
      const chatUsers = chat.users || {}

      // Inactividad: usuarios trackeados (con lastSeen) sin actividad en 30+ días
      const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000
      const now = Date.now()
      let trackedUsers = 0
      let inactiveUsers = 0
      let totalWarnings = 0

      for (const uid of Object.keys(chatUsers)) {
        const u = chatUsers[uid]
        if (u.lastSeen) {
          trackedUsers++
          if (now - u.lastSeen > THIRTY_DAYS) inactiveUsers++
        }
        if (Array.isArray(u.warnings)) totalWarnings += u.warnings.length
      }

      // Flags de seguridad/config activos
      const flags = {
        antilink: !!chat.antilinks,
        antistatus: !!chat.antistatus,
        adminonly: !!chat.adminonly,
        nsfw: !!chat.nsfw,
        gacha: !!chat.gacha,
        economy: !!chat.economy,
        welcome: !!chat.welcome,
        alerts: !!chat.alerts
      }

      // ── Cálculo de "Nivel de seguridad" (0-10) ──
      let score = 5 // base neutral

      // Proporción de admins (ideal: entre 3% y 15% de miembros)
      const adminRatio = totalMembers > 0 ? totalAdmins / totalMembers : 0
      if (adminRatio >= 0.03 && adminRatio <= 0.15) score += 1
      else if (adminRatio > 0.30) score -= 1.5
      else if (adminRatio === 0) score -= 1

      // Protecciones activas suman
      if (flags.antilink) score += 1.2
      if (flags.antistatus) score += 0.8
      if (flags.alerts) score += 0.5

      // Advertencias acumuladas (relativo al tamaño del grupo)
      const warnRatio = totalMembers > 0 ? totalWarnings / totalMembers : 0
      if (warnRatio > 0.5) score -= 1.5
      else if (warnRatio > 0.2) score -= 0.7
      else if (warnRatio === 0) score += 0.5

      // Inactividad (relativo a usuarios trackeados)
      const inactiveRatio = trackedUsers > 0 ? inactiveUsers / trackedUsers : 0
      if (inactiveRatio > 0.4) score -= 1
      else if (inactiveRatio < 0.1 && trackedUsers > 0) score += 0.5

      score = Math.max(0, Math.min(10, score))

      const scoreEmoji = score >= 8 ? '🟢' : score >= 5 ? '🟡' : '🔴'

      const report = `╭─❍「 📊 𝗚𝗿𝗼𝘂𝗽 𝗔𝘂𝗱𝗶𝘁 」❍─╮
┊
┊ 👥 *Miembros ›* ${totalMembers}
┊ 🛡️ *Administradores ›* ${totalAdmins}
┊ 💤 *Usuarios inactivos (+30 días) ›* ${inactiveUsers}${trackedUsers === 0 ? ' _(sin datos de actividad)_' : ` _(de ${trackedUsers} rastreados)_`}
┊
┊ 🔗 *Antilink ›* ${flags.antilink ? 'ON ✅' : 'OFF ❌'}
┊ 📵 *Antistatus ›* ${flags.antistatus ? 'ON ✅' : 'OFF ❌'}
┊ 🔒 *Solo Admins ›* ${flags.adminonly ? 'ON ✅' : 'OFF ❌'}
┊ 🎰 *Gacha ›* ${flags.gacha ? 'ON ✅' : 'OFF ❌'}
┊ 💰 *Economía ›* ${flags.economy ? 'ON ✅' : 'OFF ❌'}
┊ 🔞 *NSFW ›* ${flags.nsfw ? 'ON ⚠️' : 'OFF ✅'}
┊
┊ ⚠️ *Advertencias totales ›* ${totalWarnings}
┊
┊ ${scoreEmoji} *Nivel de seguridad ›* ${score.toFixed(1)}/10
┊
╰─❍《✧》𝙕𝙖𝙛𝙠𝙞𝙚𝙡 𝙎𝙮𝙨𝙩𝙚𝙢 ❍─╯`

      await client.sendMessage(m.chat, { text: report }, {
        quoted: m,
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363427643259597@newsletter',
            newsletterName: '『 𝙕𝙖𝙛𝙠𝙞𝙚𝙡 𝘾𝙝𝙖𝙣𝙣𝙚𝙡 』',
            serverMessageId: 1
          }
        }
      })

    } catch (e) {
      await m.reply(`> An unexpected error occurred while executing command *${usedPrefix + command}*.\n> [Error: *${e.message}*]`)
    }
  }
}