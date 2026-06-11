import chalk from 'chalk'

export default {
  command: ['topinactivos', 'fantasmas', 'inactivos'],
  category: 'group',

  run: async (client, m, args, usedPrefix, command) => {

    // ===========================
    // VALIDACIONES INICIALES
    // ===========================

    // Solo en grupos
    if (!m.isGroup) {
      return m.reply('🧿 Este comando solo funciona en grupos.')
    }

    // Verificar que el bot esté activado en el grupo
    const chat = global.db.data.chats?.[m.chat]
    if (!chat || chat.isBanned) {
      return m.reply('🔮 El bot no está activado en este grupo.\n\nUsa *#bot on* para activarlo.')
    }

    // Solo admins o owner
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const isOwner = global.owner.includes(m.sender.split('@')[0])

    let groupMetadata
    try {
      groupMetadata = await client.groupMetadata(m.chat)
    } catch (e) {
      console.error(chalk.red(`[TOPINACTIVOS] ✗ Error obteniendo metadata: ${e.message}`))
      return m.reply('❌ No se pudo obtener información del grupo.')
    }

    const groupAdmins = groupMetadata.participants
      .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
      .map(p => p.id)

    const isAdmin = groupAdmins.includes(m.sender)

    if (!isAdmin && !isOwner) {
      return m.reply('💀 Solo los admins pueden usar este comando.')
    }

    try {
      await m.react('🔍')
      console.log(chalk.cyan(`[TOPINACTIVOS] → Analizando grupo: ${groupMetadata.subject}`))

      // ===========================
      // PASO 1: OBTENER PARTICIPANTES REALES
      // ===========================
      const participants = groupMetadata.participants

      // Filtrar al bot de la lista
      const realParticipants = participants.filter(p => {
        const pid = p.id || p.jid
        return pid !== botId && !pid.includes('bot')
      })

      console.log(chalk.gray(`[TOPINACTIVOS] → Participantes reales: ${realParticipants.length}`))

      // ===========================
      // PASO 2: OBTENER HISTORIAL DE MENSAJES
      // ===========================
      // Leer datos del chat almacenados en la DB
      const chatUsers = chat?.users || {}

      console.log(chalk.gray(`[TOPINACTIVOS] → Usuarios con historial: ${Object.keys(chatUsers).length}`))

      // ===========================
      // PASO 3: CONTAR MENSAJES POR USUARIO
      // ===========================
      const userMessageCount = {}

      // Inicializar todos los participantes con 0
      for (const participant of realParticipants) {
        const pid = participant.id || participant.jid
        if (!pid) continue
        userMessageCount[pid] = 0
      }

      // Llenar con datos reales de la DB
      for (const [userId, userData] of Object.entries(chatUsers)) {
        // Saltar si no es participante actual
        if (!userMessageCount.hasOwnProperty(userId)) continue

        // Saltar al bot
        if (userId === botId) continue

        // Obtener conteo de mensajes
        // msgCount es el campo que registra main.js
        const msgCount = userData?.msgCount || 0

        // Validar que sea número real
        if (typeof msgCount === 'number' && msgCount >= 0) {
          userMessageCount[userId] = msgCount
        }
      }

      console.log(chalk.gray(`[TOPINACTIVOS] → Conteo completado para ${Object.keys(userMessageCount).length} usuarios`))

      // ===========================
      // PASO 4: FILTRAR INACTIVOS
      // ===========================
      // Umbral: menos de 4 mensajes = inactivo/fantasma
      const UMBRAL_INACTIVO = 4

      const inactivos = Object.entries(userMessageCount)
        .filter(([userId, count]) => {
          // No contar al bot
          if (userId === botId) return false
          // Solo inactivos
          return count < UMBRAL_INACTIVO
        })
        .sort((a, b) => a[1] - b[1]) // Ordenar de menos a más mensajes

      console.log(chalk.yellow(`[TOPINACTIVOS] → Inactivos encontrados: ${inactivos.length}`))

      // ===========================
      // PASO 5: VALIDAR SI HAY INACTIVOS
      // ===========================
      if (inactivos.length === 0) {
        await m.react('✅')
        return m.reply(`✅ *¡No hay fantasmas!*\n\n🔮 Todos los miembros del grupo tienen más de ${UMBRAL_INACTIVO} mensajes registrados.\n\n> ❄️ *Kurumi Protocol*`)
      }

      // ===========================
      // PASO 6: CONSTRUIR LISTA Y MENCIONES
      // ===========================
      // Limitar a 50 para no hacer el mensaje enorme
      const topInactivos = inactivos.slice(0, 50)

      // JIDs para mencionar
      const mentions = topInactivos.map(([userId]) => userId)

      // Construir lista de texto
      let lista = ''
      topInactivos.forEach(([userId, count], index) => {
        const phone = userId.split('@')[0]
        const msgText = count === 0
          ? '0 mensajes'
          : count === 1
          ? '1 mensaje'
          : `${count} mensajes`

        lista += `│ *${index + 1}.* @${phone} → ${msgText}\n`
      })

      // ===========================
      // PASO 7: CONSTRUIR MENSAJE FINAL
      // ===========================
      const totalAnalizados = Object.keys(userMessageCount).length
      const totalInactivos = inactivos.length

      const caption = `┏━━━━━✦❘༻👻༺❘✦━━━━━┓
┃ —͟͞ ♱ *TOP INACTIVOS* ♱ —͟͞
┗━━━━━✦❘༻👻༺❘✦━━━━━┛

╭─━━━⊱ *FANTASMAS* ⊰━━━─╮
│
${lista}│
╰─━━━⊱✧༻♱༺✧⊰━━━─╯

╭─━━━⊱ *ESTADÍSTICAS* ⊰━━━─╮
│
│ 🧿 *Grupo:* ${groupMetadata.subject}
│ 📊 *Analizados:* ${totalAnalizados} usuarios
│ 🦖 *Inactivos:* ${totalInactivos} usuarios
│ 🔮 *Umbral:* menos de ${UMBRAL_INACTIVO} mensajes
│ 🚬 *Mostrando:* top ${topInactivos.length}
│
╰─━━━⊱✧༻♱༺✧⊰━━━─╯

▰▰▰▰▰
—͟͞ ♱ Usa *#kickinactive* para expulsarlos
▰▰▰▰▰

> ❄️ *Kurumi Protocol* - NanoVoid 💜`

      // ===========================
      // PASO 8: ENVIAR MENSAJE
      // ===========================
      const banner = global.getBocchiBanner?.() || 'https://files.catbox.moe/yx5r7h.jpg'

      await client.sendMessage(m.chat, {
        image: { url: banner },
        caption,
        mentions,
        contextInfo: {
          mentionedJid: mentions,
          externalAdReply: {
            title: `👻 Top Inactivos - ${groupMetadata.subject}`,
            body: `💀 ${totalInactivos} fantasmas de ${totalAnalizados} usuarios`,
            mediaType: 1,
            thumbnailUrl: banner,
            renderLargerThumbnail: false
          }
        }
      }, { quoted: m })

      await m.react('✅')
      console.log(chalk.green(`[TOPINACTIVOS] ✓ Completado - ${totalInactivos} inactivos de ${totalAnalizados} analizados`))

    } catch (e) {
      await m.react('❌')
      console.error(chalk.red(`[TOPINACTIVOS] ✗ Error: ${e.message}`))
      console.error(e.stack)
      await m.reply(`> Error en *${usedPrefix + command}*\n> [${e.message}]`)
    }
  }
}
