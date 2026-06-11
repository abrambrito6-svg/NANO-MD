export default {
  command: ['banchat', 'banuser', 'blockuser'],
  category: 'owner',
  run: async (client, m, args, command) => {
    // ID de Owner permitido
    const miNumero = "50231882808@s.whatsapp.net"
    const esOwner = m.sender.replace(/[^0-9]/g, '') + '@s.whatsapp.net' === miNumero || m.sender === miNumero

    if (!esOwner) {
      return m.reply("⏳ ¿Quién te dio autorización? Solo mi jefe puede usar este comando.")
    }

    // Limpiamos el número ingresado
    let numeroABanear = args.join('').replace(/[^0-9]/g, '')

    if (!numeroABanear) {
      return m.reply("⏳ Indica el número de teléfono que deseas congelar en el tiempo.\n> Ejemplo: `.banchat 50244765267`")
    }

    const jidUsuario = `${numeroABanear}@s.whatsapp.net`

    try {
      // Accedemos de forma segura a la base de datos de usuarios de tu bot
      if (!global.db.data.users) global.db.data.users = {}
      if (!global.db.data.users[jidUsuario]) global.db.data.users[jidUsuario] = {}

      // Verificamos si ya está baneado
      if (global.db.data.users[jidUsuario].banned) {
        return m.reply(`⏳ Ese usuario ya se encuentra bloqueado en los registros de Zafkiel.`)
      }

      // Aplicamos el baneo potente acoplado a tu base de datos original
      global.db.data.users[jidUsuario].banned = true
      global.db.data.users[jidUsuario].bannedReason = "Spam masivo de caracteres ('rw') / Saturación de RAM"

      await m.reply(`🛑 *¡Línea temporal cortada!* 🛑\n\nEl usuario *@${numeroABanear}* ha sido completamente vetado del sistema. A partir de este microsegundo, todos sus mensajes y comandos serán ignorados de forma absoluta. No gastará más RAM.`, null, { mentions: [jidUsuario] })

    } catch (e) {
      console.error(e)
      m.reply(`❌ Ocurrió un fallo en el sistema de contención: ${e.message}`)
    }
  }
}
