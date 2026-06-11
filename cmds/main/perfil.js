function getRankInfo(level) {
  if (level >= 100) return { name: 'Leyenda', badge: '🌟' }
  if (level >= 75)  return { name: 'Gran Maestro', badge: '👑' }
  if (level >= 50)  return { name: 'Maestro', badge: '🔱' }
  if (level >= 35)  return { name: 'Élite', badge: '💫' }
  if (level >= 20)  return { name: 'Guerrero', badge: '🛡️' }
  if (level >= 10)  return { name: 'Aventurero', badge: '🗺️' }
  if (level >= 5)   return { name: 'Aprendiz', badge: '⚔️' }
  return              { name: 'Novato', badge: '🌱' }
}

function formatCoins(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return (n || 0).toLocaleString()
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('es-CO', {
    timeZone: 'America/Bogota',
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

const growth = Math.pow(Math.PI / Math.E, 1.618) * Math.E * 0.75
function xpRange(level, multiplier = global.multiplier || 2) {
  level = Math.floor(Math.max(0, level))
  const min = level === 0 ? 0 : Math.round(Math.pow(level, growth) * multiplier) + 1
  const max = Math.round(Math.pow(level + 1, growth) * multiplier)
  return { min, max }
}

function progressBar(current, min, max, len = 10) {
  const pct = Math.min(Math.max((current - min) / Math.max(max - min, 1), 0), 1)
  return '█'.repeat(Math.round(pct * len)) + '░'.repeat(len - Math.round(pct * len)) + ` ${Math.round(pct * 100)}%`
}

export default {
  command: ['perfil', 'profile', 'yo', 'me', 'miperfil'],
  category: 'main',
  run: async (client, m, args, usedPrefix, command) => {
    const target = m.mentionedJid?.[0] || m.quoted?.sender || m.sender
    const userData = global.db.data.users[target]
    if (!userData) return m.reply('《✧》 No encontré datos de ese usuario.')

    const chatUser = global.db.data.chats[m.chat]?.users?.[target] || {}

    // Auto-expirar premium
    if (userData.premium && userData.premiumExpiry && new Date() > new Date(userData.premiumExpiry)) {
      userData.premium = false
      userData.premiumExpiry = null
    }

    const level = userData.level || 0
    const exp = userData.exp || 0
    const { min, max } = xpRange(level)
    const { name: rankName, badge } = getRankInfo(level)
    const bar = progressBar(exp, min, max)
    const name = userData.name || target.split('@')[0]
    const coins = chatUser.coins || 0
    const bank = chatUser.bank || 0
    const cmds = userData.usedcommands || 0
    const isPremium = userData.premium === true
    const premiumText = isPremium
      ? `💎 *Premium* (vence ${formatDate(userData.premiumExpiry)})`
      : '❌ Sin Premium'
    const streak = userData.dailyStreak || 0
    const lastDaily = userData.lastDaily
      ? `*${userData.lastDaily}*`
      : '—'
    const marry = userData.marry
      ? `@${userData.marry.split('@')[0]}`
      : '—'
    const desc = userData.description?.trim() || '—'

    let position = '—'
    if (m.isGroup) {
      try {
        const groupInfo = await client.groupMetadata(m.chat)
        const participants = groupInfo.participants?.map(p => p.id || p.jid) || []
        const usersData = global.db.data.users || {}
        const ranking = participants
          .map(jid => ({ jid, level: usersData[jid]?.level || 0, exp: usersData[jid]?.exp || 0 }))
          .sort((a, b) => b.level !== a.level ? b.level - a.level : b.exp - a.exp)
        const pos = ranking.findIndex(u => u.jid === target)
        if (pos !== -1) position = `#${pos + 1} del grupo`
      } catch (_) {}
    }

    await m.reply(
      `${badge} *PERFIL — ${name}*\n\n` +
      `> 👤 Nombre › *${name}*\n` +
      `> 📝 Bio › ${desc}\n` +
      `> 💍 Pareja › ${marry}\n\n` +
      `━━━━ 🏅 RANGO ━━━━\n` +
      `> ${badge} Rango › *${rankName}*\n` +
      `> ⭐ Nivel › *${level}*\n` +
      `> ✨ EXP › *${exp.toLocaleString()}* XP\n` +
      `> 📊 Progreso: \`${bar}\`\n` +
      `> 🏆 Posición › *${position}*\n\n` +
      `━━━━ 🪙 ECONOMÍA ━━━━\n` +
      `> 💵 Monedas › *${formatCoins(coins)}*\n` +
      `> 🏦 Banco › *${formatCoins(bank)}*\n` +
      `> 💎 Plan › ${premiumText}\n\n` +
      `━━━━ 📈 STATS ━━━━\n` +
      `> 💻 Comandos usados › *${cmds}*\n` +
      `> 🔥 Racha diaria › *${streak} día${streak !== 1 ? 's' : ''}*\n` +
      `> 📅 Último daily › ${lastDaily}`
    )
  }
}
