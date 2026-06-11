export default {
  command: ['primarydel', 'resetprimary'],
  category: 'owner',
  isOwner: true,

  run: async (client, m, args) => {
    try {
      const text = args[0]

      if (!text) {
        return m.reply(
          '💀 Usa:\n\n' +
          '.primarydel linkdelgrupo'
        )
      }

      const match = text.match(/chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i)

      if (!match) {
        return m.reply('❌ Link inválido.')
      }

      const code = match[1]

      let groupId = null

      try {
        groupId = await client.groupAcceptInvite(code)
      } catch {
        try {
          groupId = await client.groupGetInviteInfo(code)
          groupId = groupId.id
        } catch {
          return m.reply('❌ No pude obtener el grupo.')
        }
      }

      if (!groupId) {
        return m.reply('❌ Grupo no encontrado.')
      }

      const chat = global.db.data.chats[groupId]

      if (!chat) {
        return m.reply('❌ Ese grupo no existe en la DB.')
      }

      delete chat.primaryBot

      await m.reply(
        `🩸 PRIMARY ELIMINADO\n\n` +
        `> El sistema primary fue reseteado.\n` +
        `> Todos los bots volverán a responder.`
      )

    } catch (e) {
      console.log(e)
      m.reply('❌ Error al eliminar primary.')
    }
  }
}
