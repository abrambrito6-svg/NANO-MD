import chalk from 'chalk'

// ===========================
// SET de comandos restringidos (Set tiene .has() más rápido)
// ===========================
export const restrictedCommands = new Set([
  'play', 'play2', 'mp3', 'mp4',
  'spotify', 'sp', 'spoti',
  'tiktok', 'tt',
  'facebook', 'fb',
  'instagram', 'ig', 'reel',
  'twitter', 'x',
  'mediafire', 'mf',
  'pinterest', 'pin',
  'pinterestimg', 'pinimg',
  'pinvid', 'pinvideo',
  'wallpaper', 'wall',
  'rollwaifu', 'rw', 'roll',
  'claim', 'c', 'reclamar',
  'harem', 'waifus',
  'trade', 'sell', 'buychar',
  'spamwa', 'spam',
  'animeinfo', 'animeinf',
  'stickerdow', 'sdow',
])

export const premiumPlans = {
  '1h': { label: '1 Hora',   duration: 1000 * 60 * 60,          price: 500   },
  '1d': { label: '1 Día',    duration: 1000 * 60 * 60 * 24,     price: 2000  },
  '7d': { label: '7 Días',   duration: 1000 * 60 * 60 * 24 * 7, price: 10000 },
}

// ===========================
// FUNCIÓN: Verificar premium activo
// ===========================
export function hasPremium(sender) {
  try {
    const user = global.db.data.users?.[sender]
    if (!user?.premium) return false
    if (user.premium.expiry < Date.now()) {
      user.premium.active = false
      return false
    }
    return true
  } catch {
    return false
  }
}

// ===========================
// FUNCIÓN: Verificar si botJid es sub-bot
// ===========================
export function isSubBotJid(botJid) {
  try {
    // Obtener JID del bot owner principal
    const ownerPhone = global.owner?.[0]
    if (!ownerPhone) return false
    const ownerJid = ownerPhone + '@s.whatsapp.net'
    // Si el botJid es el owner, NO es sub-bot
    if (botJid === ownerJid) return false
    // Si settings.type es 'Sub', es sub-bot
    const settings = global.db.data.settings?.[botJid] || {}
    return settings.type === 'Sub'
  } catch {
    return false
  }
}

export function formatTime(ms) {
  const d = Math.floor(ms / 86400000)
  const h = Math.floor((ms % 86400000) / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  if (d > 0) return `${d}d ${h}h ${m}m`
  if (h > 0) return `${h}h ${m}m ${s}s`
  return `${m}m ${s}s`
}

export default {
  command: ['comprarpremium', 'premium', 'buypremium'],
  category: 'economy',

  run: async (client, m, args, usedPrefix, command) => {
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const settings = global.db.data.settings?.[botId] || {}
    const user = global.db.data.users?.[m.sender] || {}
    const banner = global.getBocchiBanner?.() || 'https://files.catbox.moe/m4efyp.jpg'
    const plan = args[0]?.toLowerCase()

    if (!plan) {
      const premiumData = user.premium
      const ahora = Date.now()
      const tienePremium = premiumData?.expiry && premiumData.expiry > ahora
      const tiempoRestante = tienePremium ? formatTime(premiumData.expiry - ahora) : null

      const caption = `┏━━━━━✦❘༻👑༺❘✦━━━━━┓
┃ —͟͞ ♱ *SISTEMA PREMIUM* ♱ —͟͞
┗━━━━━✦❘༻👑༺❘✦━━━━━┛

${tienePremium
  ? `╭─━━━⊱ *TU ESTADO* ⊰━━━─╮\n│\n│ 👑 *Premium:* ACTIVO ✅\n│ |🜸 *Expira en:* ${tiempoRestante}\n│\n╰─━━━⊱✧༻♱༺✧⊰━━━─╯`
  : `╭─━━━⊱ *TU ESTADO* ⊰━━━─╮\n│\n│ 👑 *Premium:* Inactivo ❌\n│ |🜸 *Coins:* ${(user.coins || 0).toLocaleString()}\n│\n╰─━━━⊱✧༻♱༺✧⊰━━━─╯`}

╭─━━━⊱ *PLANES* ⊰━━━─╮
│
│ |🜸 *1h* → ${premiumPlans['1h'].price.toLocaleString()} coins
│ |🜸 *1d* → ${premiumPlans['1d'].price.toLocaleString()} coins
│ |🜸 *7d* → ${premiumPlans['7d'].price.toLocaleString()} coins
│
╰─━━━⊱✧༻♱༺✧⊰━━━─╯

╭─━━━⊱ *DESBLOQUEA* ⊰━━━─╮
│ |🜸 play, spotify, tiktok
│ |🜸 pinterest, wallpaper
│ |🜸 rollwaifu, claim, harem
│ |🜸 stickerdow, animeinfo
╰─━━━⊱✧༻♱༺✧⊰━━━─╯

▰▰▰▰▰
—͟͞ ♱ *Uso:* ${usedPrefix}premium [plan]
—͟͞ ♱ *Ej:* ${usedPrefix}premium 1d
▰▰▰▰▰

> ❄️ *Kurumi Protocol* - NanoVoid 💜`

      await client.sendMessage(m.chat, {
        image: { url: banner }, caption
      }, { quoted: m })
      return
    }

    const selectedPlan = premiumPlans[plan]
    if (!selectedPlan) {
      return m.reply(`❌ Plan inválido. Usa: *1h*, *1d* o *7d*`)
    }

    const userCoins = user.coins || 0
    if (userCoins < selectedPlan.price) {
      const falta = selectedPlan.price - userCoins
      return m.reply(`╭─━━━⊱ *COINS INSUFICIENTES* ⊰━━━─╮\n│\n│ |🜸 *Necesitas:* ${selectedPlan.price.toLocaleString()}\n│ |🜸 *Tienes:* ${userCoins.toLocaleString()}\n│ |🜸 *Faltan:* ${falta.toLocaleString()}\n│\n╰─━━━⊱✧༻♱༺✧⊰━━━─╯`)
    }

    const ahora = Date.now()
    const premiumData = user.premium
    const yaActivo = premiumData?.expiry && premiumData.expiry > ahora
    const baseTime = yaActivo ? premiumData.expiry : ahora
    const nuevaExpiry = baseTime + selectedPlan.duration

    global.db.data.users[m.sender].coins = userCoins - selectedPlan.price
    global.db.data.users[m.sender].premium = {
      active: true,
      plan,
      expiry: nuevaExpiry,
      boughtAt: ahora
    }

    console.log(chalk.green(`[PREMIUM] ✓ ${m.sender} compró ${plan} hasta ${new Date(nuevaExpiry).toLocaleString()}`))

    await client.sendMessage(m.chat, {
      image: { url: banner },
      caption: `┏━━━━━✦❘༻👑༺❘✦━━━━━┓\n┃ —͟͞ ♱ *¡PREMIUM ACTIVADO!* ♱ —͟͞\n┗━━━━━✦❘༻👑༺❘✦━━━━━┛\n\n╭─━━━⊱ *RESUMEN* ⊰━━━─╮\n│\n│ 👑 *Plan:* ${selectedPlan.label}\n│ 💰 *Costo:* ${selectedPlan.price.toLocaleString()} coins\n│ ⏰ *Expira:* ${new Date(nuevaExpiry).toLocaleString('es-ES')}\n│ 💳 *Saldo:* ${(userCoins - selectedPlan.price).toLocaleString()}\n│\n╰─━━━⊱✧༻♱༺✧⊰━━━─╯\n\n> ❄️ *Kurumi Protocol* - NanoVoid 💜`
    }, { quoted: m })
    await m.react('👑')
  }
}
