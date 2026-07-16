export default {
  command: ['kickinactive', 'kickfantasmas'],
  category: 'grupo',
  isAdmin: true,
  run: async (client, m, args, usedPrefix, command) => {
    try {
      const chat = global.db.data.chats[m.chat] || {}
      const scan = chat.lastInactiveScan

      if (!scan || !scan.users?.length) {
        return m.reply(`> ✎ No hay una lista de inactivos reciente. Usa *${usedPrefix}topinactive* primero.`)
      }

      const TEN_MIN = 10 * 60 * 1000
      if (Date.now() - scan.timestamp > TEN_MIN) {
        return m.reply(`> ✎ La lista expiró (han pasado más de 10 minutos). Usa *${usedPrefix}topinactive* de nuevo para generar una nueva.`)
      }

      const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
      const groupMetadata = await client.groupMetadata(m.chat).catch(() => null)
      const isBotAdmin = groupMetadata?.participants?.find(p => p.id === botId)?.admin

      if (!isBotAdmin) {
        return m.reply('> ✎ Necesito ser administrador del grupo para expulsar usuarios.')
      }

      await m.reply(`> ⏳ Expulsando a *${scan.users.length}* usuarios inactivos...`)

      let kicked = 0
      let failed = 0

      for (const jid of scan.users) {
        try {
          await client.groupParticipantsUpdate(m.chat, [jid], 'remove')
          kicked++
          await new Promise(r => setTimeout(r, 1200)) // pausa para evitar rate-overlimit
        } catch (e) {
          failed++
        }
      }

      // Limpia la lista para que no se pueda reusar
      chat.lastInactiveScan = null
      global.db.data.chats[m.chat] = chat

      await client.sendMessage(m.chat, {
        text: `✎ Expulsión completada.\n> ✅ Expulsados: ${kicked}\n> ❌ Fallidos: ${failed}`
      }, { quoted: m })

    } catch (e) {
      await m.reply(`> An unexpected error occurred while executing command *${usedPrefix + command}*.\n> [Error: *${e.message}*]`)
    }
  }
}