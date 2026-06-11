import fetch from 'node-fetch'
import chalk from 'chalk'

export default {
  command: ['robloxstalk', 'rblx', 'roblox'],
  category: 'utils',

  run: async (client, m, args, usedPrefix, command) => {
    const username = args[0]

    if (!username) {
      return m.reply(`🔮 *Uso:* ${usedPrefix + command} [usuario]\n\n*Ejemplo:*\n${usedPrefix + command} AbramBrito`)
    }

    try {
      await m.react('🔍')
      console.log(chalk.cyan(`[ROBLOX] Buscando usuario: ${username}`))

      // ===========================
      // PASO 1: Obtener ID por nombre
      // ===========================
      console.log(chalk.gray(`[ROBLOX] → Obteniendo ID de ${username}...`))

      const searchRes = await fetch('https://users.roblox.com/v1/usernames/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0'
        },
        body: JSON.stringify({
          usernames: [username],
          excludeBannedUsers: false
        })
      }).then(r => r.json())

      const userData = searchRes?.data?.[0]

      if (!userData) {
        await m.react('❌')
        console.log(chalk.red(`[ROBLOX] ✗ Usuario no encontrado: ${username}`))
        return m.reply(`💀 *Usuario no encontrado*\n\n🦖 No existe ningún usuario con el nombre *${username}* en Roblox.\n\n> ❄️ *Kurumi Protocol*`)
      }

      const userId = userData.id
      console.log(chalk.green(`[ROBLOX] ✓ ID encontrado: ${userId}`))

      // ===========================
      // PASO 2: Info completa del user
      // ===========================
      console.log(chalk.gray(`[ROBLOX] → Obteniendo info completa...`))

      const [infoRes, followersRes, followingsRes, avatarRes, presenceRes] = await Promise.allSettled([
        // Info básica
        fetch(`https://users.roblox.com/v1/users/${userId}`, {
          headers: { 'User-Agent': 'Mozilla/5.0' }
        }).then(r => r.json()),

        // Seguidores
        fetch(`https://friends.roblox.com/v1/users/${userId}/followers/count`, {
          headers: { 'User-Agent': 'Mozilla/5.0' }
        }).then(r => r.json()),

        // Seguidos
        fetch(`https://friends.roblox.com/v1/users/${userId}/followings/count`, {
          headers: { 'User-Agent': 'Mozilla/5.0' }
        }).then(r => r.json()),

        // Avatar thumbnail
        fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png&isCircular=false`, {
          headers: { 'User-Agent': 'Mozilla/5.0' }
        }).then(r => r.json()),

        // Presencia (online/offline)
        fetch('https://presence.roblox.com/v1/presence/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0'
          },
          body: JSON.stringify({ userIds: [userId] })
        }).then(r => r.json())
      ])

      // Extraer datos seguros
      const info = infoRes.status === 'fulfilled' ? infoRes.value : {}
      const followers = followersRes.status === 'fulfilled' ? followersRes.value?.count : null
      const followings = followingsRes.status === 'fulfilled' ? followingsRes.value?.count : null
      const avatarData = avatarRes.status === 'fulfilled' ? avatarRes.value?.data?.[0] : null
      const presenceData = presenceRes.status === 'fulfilled' ? presenceRes.value?.userPresences?.[0] : null

      console.log(chalk.green(`[ROBLOX] ✓ Info obtenida`))
      console.log(chalk.gray(`[ROBLOX] → Seguidores: ${followers ?? 'N/A'}`))
      console.log(chalk.gray(`[ROBLOX] → Seguidos: ${followings ?? 'N/A'}`))
      console.log(chalk.gray(`[ROBLOX] → Avatar: ${avatarData?.imageUrl ?? 'N/A'}`))

      // ===========================
      // PASO 3: Formatear datos
      // ===========================
      const displayName = info.displayName || username
      const name = info.name || username
      const description = info.description?.trim() || null
      const isBanned = info.isBanned ?? false
      const created = info.created
        ? new Date(info.created).toLocaleDateString('es-ES', {
            day: '2-digit', month: '2-digit', year: 'numeric'
          })
        : 'N/A'

      const presenceType = presenceData?.userPresenceType
      const presenceMap = {
        0: '⚫ Offline',
        1: '🟢 Online',
        2: '🎮 En juego',
        3: '🛠️ En Studio'
      }
      const presence = presenceMap[presenceType] ?? '⚫ Desconocido'
      const lastGame = presenceData?.lastLocation || null

      const formatNum = (n) => n != null
        ? Number(n).toLocaleString('es-ES')
        : 'N/A'

      // ===========================
      // PASO 4: Construir mensaje
      // ===========================
      const caption = `┏━━━━━✦❘༻🎮༺❘✦━━━━━┓
┃ —͟͞ ♱ *ROBLOX STALK* ♱ —͟͞
┗━━━━━✦❘༻🎮༺❘✦━━━━━┛

╭─━━━⊱ *PERFIL* ⊰━━━─╮
│
│ 🔮 *Nombre:* ${name}
│ 🧿 *Display Name:* ${displayName}
│ 🦖 *ID:* ${userId}
│ 🚬 *Creado:* ${created}
│ 💀 *Estado:* ${isBanned ? '🔴 BANEADO' : '🟢 Activo'}
│ 📡 *Presencia:* ${presence}
${lastGame ? `│ 🎮 *Último juego:* ${lastGame}\n` : ''}│
╰─━━━⊱✧༻♱༺✧⊰━━━─╯

╭─━━━⊱ *ESTADÍSTICAS* ⊰━━━─╮
│
│ 👥 *Seguidores:* ${formatNum(followers)}
│ 🫂 *Seguidos:* ${formatNum(followings)}
│ 🔗 *Perfil:* roblox.com/users/${userId}/profile
│
╰─━━━⊱✧༻♱༺✧⊰━━━─╯
${description ? `\n╭─━━━⊱ *DESCRIPCIÓN* ⊰━━━─╮\n│\n│ ${description.substring(0, 150)}${description.length > 150 ? '...' : ''}\n│\n╰─━━━⊱✧༻♱༺✧⊰━━━─╯\n` : ''}
▰▰▰▰▰
—͟͞ ♱ *Roblox Stalk* by NanoVoid
▰▰▰▰▰

> ❄️ *Kurumi Protocol* - NanoVoid 💜`

      // ===========================
      // PASO 5: Enviar con avatar
      // ===========================
      const avatarUrl = avatarData?.imageUrl
      const banner = global.getBocchiBanner?.() || 'https://files.catbox.moe/49up9h.jpg'

      if (avatarUrl) {
        console.log(chalk.green(`[ROBLOX] ✓ Enviando con avatar: ${avatarUrl}`))
        await client.sendMessage(m.chat, {
          image: { url: avatarUrl },
          caption,
          contextInfo: {
            externalAdReply: {
              title: `🎮 ${name} - Roblox`,
              body: `${presence} | 👥 ${formatNum(followers)} seguidores`,
              mediaType: 1,
              thumbnailUrl: avatarUrl,
              sourceUrl: `https://www.roblox.com/users/${userId}/profile`,
              renderLargerThumbnail: false
            }
          }
        }, { quoted: m })
      } else {
        console.log(chalk.yellow(`[ROBLOX] ⚠ Sin avatar, enviando solo texto`))
        await m.reply(caption)
      }

      await m.react('✅')
      console.log(chalk.green(`[ROBLOX] ✓ Completado para ${username}`))

    } catch (e) {
      await m.react('❌')
      console.error(chalk.red(`[ROBLOX] ✗ Error: ${e.message}`))
      await m.reply(`> Error en *${usedPrefix + command}*\n> [${e.message}]`)
    }
  }
}
