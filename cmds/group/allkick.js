export default {
  command: ['allkick', 'expulsartodos', 'killall'],
  category: 'grupo',
  isAdmin: true,
  botAdmin: true,
  isOwner: true,
  run: async (client, m, args, usedPrefix, command) => {
    try {
      const groupInfo = await client.groupMetadata(m.chat)
      const ownerGroup = groupInfo.owner || m.chat.split`-`[0] + '@s.whatsapp.net'
      const ownerBot = '50231882808' + '@s.whatsapp.net'
      const botJid = client.decodeJid(client.user.id)

      // SOLO EL DUEÑO DEL BOT PUEDE USARLO
      if (m.sender !== ownerBot) {
        return m.reply('《✧》 SOLO EL DUEÑO DEL BOT PUEDE USAR ESTE COMANDO')
      }

      // OBTENER LISTA DE MIEMBROS Y EXCLUIR A LOS PROTEGIDOS
      const miembros = groupInfo.participants.filter(p => 
        p.id !== botJid && 
        p.id !== m.sender && 
        p.id !== ownerGroup
      )

      if (miembros.length === 0) {
        return m.reply('《✧》 No hay miembros para expulsar')
      }

      // ADVERTENCIA ANTES DE EMPEZAR
      await m.reply('《✧》 VAS A EXPULSAR A ' + miembros.length + ' MIEMBROS\n⚠️ UNA VEZ INICIADO NO HAY VUELTA ATRÁS\n🚫 EL PROCESO NO SE PUEDE DETENER')

      // EMPEZAR A EXPULSAR A TODOS
      for (const usuario of miembros) {
        try {
          await client.groupParticipantsUpdate(m.chat, [usuario.id], 'remove')
          // PAUSA PARA NO BLOQUEAR
          await new Promise(function(resolve) { setTimeout(resolve, 1000) })
        } catch (e) {
          console.log('Error al expulsar:', e.message)
        }
      }

      // MENSAJE FINAL
      return m.reply('《✧》 PROCESO TERMINADO ✅\n📤 TOTAL EXPULSADOS: ' + miembros.length + '\n🚫 EL GRUPO HA SIDO LIMPIADO COMPLETAMENTE')

    } catch (e) {
      return m.reply('> Ocurrió un error al ejecutar el comando *' + usedPrefix + command + '*\n> [Error: *' + e.message + '*]')
    }
  },
}
