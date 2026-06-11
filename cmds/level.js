// Este archivo REEMPLAZA cmds/level.js completamente

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

function getRankChanged(oldLevel, newLevel) {
  const oldRank = getRankInfo(oldLevel)
  const newRank = getRankInfo(newLevel)
  return oldRank.name !== newRank.name ? newRank : null
}

const growth = Math.pow(Math.PI / Math.E, 1.618) * Math.E * 0.75
function xpRange(level, multiplier = global.multiplier || 2) {
  if (level < 0) throw new TypeError('level cannot be negative value')
  level = Math.floor(level)
  const min = level === 0 ? 0 : Math.round(Math.pow(level, growth) * multiplier) + 1
  const max = Math.round(Math.pow(level + 1, growth) * multiplier)
  return { min, max, xp: max - min }
}
function findLevel(xp, multiplier = global.multiplier || 2) {
  if (xp === Infinity) return Infinity
  if (isNaN(xp)) return NaN
  if (xp <= 0) return -1
  let level = 0
  do { level++ } while (xpRange(level, multiplier).min <= xp)
  return --level
}
function canLevelUp(level, xp, multiplier = global.multiplier || 2) {
  if (level < 0) return false
  if (xp === Infinity) return true
  if (isNaN(xp)) return false
  if (xp <= 0) return false
  return level < findLevel(xp, multiplier)
}

export default async (m, client) => {
  try {
    const user = global.db.data.users[m.sender]
    if (!user) return
    const chatData = global.db.data.chats[m.chat]
    if (!chatData) return
    const users = chatData.users[m.sender]
    if (!users) return

    const levelBefore = user.level

    while (canLevelUp(user.level, user.exp, global.multiplier)) {
      user.level++
    }

    if (levelBefore !== user.level) {
      const coinBonus = Math.floor(Math.random() * (8000 - 5000 + 1)) + 5000
      const expBonus = Math.floor(Math.random() * (500 - 100 + 1)) + 100
      if (user.level % 5 === 0) {
        users.coins = (users.coins || 0) + coinBonus
        user.exp = (user.exp || 0) + expBonus
      }
      const { min, max } = xpRange(user.level, global.multiplier)
      user.minxp = min
      user.maxxp = max

      const newRankInfo = getRankInfo(user.level)
      const rankChanged = getRankChanged(levelBefore, user.level)

      try {
        if (rankChanged) {
          await client.sendMessage(m.chat, {
            text:
              `${rankChanged.badge} *¡SUBISTE DE RANGO!*\n\n` +
              `> 👤 *${user.name || m.pushName}*\n` +
              `> 🏅 Nuevo rango › *${rankChanged.name}* ${rankChanged.badge}\n` +
              `> ⭐ Nivel → *${levelBefore}* ➜ *${user.level}*\n` +
              `> ✨ EXP total › *${(user.exp || 0).toLocaleString()}* XP` +
              (user.level % 5 === 0 ? `\n> 🪙 Bonus › *+${coinBonus}* monedas` : ''),
            mentions: [m.sender]
          })
        } else {
          await client.sendMessage(m.chat, {
            text:
              `${newRankInfo.badge} *¡SUBISTE DE NIVEL!*\n\n` +
              `> 👤 *${user.name || m.pushName}*\n` +
              `> ⭐ Nivel → *${levelBefore}* ➜ *${user.level}*\n` +
              `> 🏅 Rango › *${newRankInfo.name}*\n` +
              `> ✨ EXP total › *${(user.exp || 0).toLocaleString()}* XP` +
              (user.level % 5 === 0 ? `\n> 🪙 Bonus › *+${coinBonus}* monedas y *+${expBonus}* XP extra` : ''),
            mentions: [m.sender]
          })
        }
      } catch (_) {}
    }
  } catch (_) {}
}
