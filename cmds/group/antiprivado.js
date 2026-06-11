export default {
  command: ['antiprivado', 'antiprivate'],
  category: 'grupo',

  run: async (client, m, args) => {

    // Solo owner o admins
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const isOwner = global.owner.includes(m.sender.split('@')[0])

    if (!isOwner) {
      return m.reply('❌ Solo el owner puede usar este comando.')
    }

    const option = args[0]?.toLowerCase()

    // Inicializar settings si no existe
    if (!global.db.data.settings[botId]) {
      global.db.data.settings[botId] = {}
    }

    if (!option || !['on', 'off'].includes(option)) {
      const status = global.db.data.settings[botId].antiprivado ? 'activado ✅' : 'desactivado ❌'
      return m.reply(`❄️ *ANTIPRIVADO*\n\nEstado: ${status}\n\n*Uso:* .antiprivado on/off\n\n*¿Qué hace?*\nCuando está ON, el bot ignorará a desconocidos en privado.\nSolo funciona en grupos o chats donde el usuario ya esté registrado.`)
    }

    if (option === 'on') {
      global.db.data.settings[botId].antiprivado = true
      await m.reply(`✅ *Antiprivado activado*\n\n❄️ El bot ignorará mensajes de desconocidos en privado.\n\nSolo responderá en:\n▸ Grupos\n▸ Privado del owner\n▸ Usuarios registrados`)
    } else {
      global.db.data.settings[botId].antiprivado = false
      await m.reply(`❌ *Antiprivado desactivado*\n\n❄️ El bot responderá a cualquiera en privado.`)
    }
  }
}
