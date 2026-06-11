export default {
  command: ['unbanchat', 'unbanuser', 'unlockuser'],
  category: 'owner',
  run: async (client, m, args, command) => {
    // Tu ID de Owner permitido para quitar el baneo
    const miNumero = "50231882808@s.whatsapp.net"
    const esOwner = m.sender.replace(/[^0-9]/g, '') + '@s.whatsapp.net' === miNumero || m.sender === miNumero

    if (!esOwner) {
      return m.reply("⏳ ¿Quién te dio autorización? Solo mi jefe puede otorgar el perdón celestial.")
    }

    // Limpiamos el número ingresado (borra espacios, signos + o guiones)
    let numeroADesbanear = args.join('').replace(/[^0-9]/g, '')

    if (!numeroADesbanear) {
      return m.reply("⏳ Indica el número de teléfono que deseas regresar a la vida.\n> Ejemplo: `.unbanchat 50244765267`")
    }

    // Estructuramos la ID oficial de WhatsApp
    const jidUsuario = `${numeroADesbanear}@s.whatsapp.net`

    try {
      // Verificamos si la base de datos de ese usuario existe o si de verdad está baneado
      if (!global.db.data.users || !global.db.data.users[jidUsuario] || !global.db.data.users[jidUsuario].banned) {
        return m.reply(`⏳ Ese usuario no está baneado en los registros del bot.`)
      }

      // Quitamos el baneo y restauramos sus permisos en tu base de datos
      global.db.data.users[jidUsuario].banned = false
      delete global.db.data.users[jidUsuario].bannedReason // Borramos la razón del baneo

      await m.reply(`⏳ *¡Línea temporal restaurada!* ⏳\n\nEl usuario *@${numeroADesbanear}* ha sido perdonado. Su flujo de tiempo vuelve a la normalidad y a partir de ahora el bot volverá a responder a sus mensajes y comandos de forma habitual. ✨`, null, { mentions: [jidUsuario] })

    } catch (e) {
      console.error(e)
      m.reply(`❌ Ocurrió un fallo en el sistema al intentar restaurar al usuario: ${e.message}`)
    }
  }
}
