export default {
    command: ["robowner", "robarowner", "asaltarowner"],
    category: "rpg",
    run: async (sock, m, { usedPrefix, command }) => {
        try {
            // Aseguramos que existan las carpetas en la base de datos para el usuario actual
            if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
            if (!global.db.data.chats[m.chat].users) global.db.data.chats[m.chat].users = {}
            if (!global.db.data.chats[m.chat].users[m.sender]) global.db.data.chats[m.chat].users[m.sender] = {}

            const chatUsers = global.db.data.chats[m.chat].users[m.sender]
            const monedasActuales = chatUsers.coins || 0

            // Definimos la recompensa (8 Millones) y la multa si pierde (100 Mil)
            const recompensa = 8000000
            const multa = 100000

            // El usuario debe tener al menos el dinero de la multa para poder arriesgarse
            if (monedasActuales < multa) {
                return m.reply(`🏮 *OPERACIÓN CANCELADA*\n\n❌ No tienes suficiente presupuesto para planear este asalto.\n💰 Necesitas al menos *100K* monedas para arriesgarte.\n🪙 Tu saldo actual: *${monedasActuales.toLocaleString()}* monedas.`);
            }

            await m.reply("🥷🏼 *Planificando el asalto al Santuario del Owner...*\n🕵️‍♂️ Evadiendo la seguridad de Yae Miko...");
            
            // Esperamos 2 segundos para darle emoción al juego
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Probabilidad del 15% de éxito (puedes cambiar el 0.15 si quieres que sea más fácil o difícil)
            const exito = Math.random() < 0.15

            if (exito) {
                // GANA: Se le suman los 8,000,000
                chatUsers.coins = monedasActuales + recompensa
                
                return m.reply(
                    `🎉 *¡ASALTO EXITOSO!* 🎉\n\n` +
                    `🥷🏼 Lograste burlar la seguridad del Owner sin que se diera cuenta.\n` +
                    `💰 *Premio:* +8,000,000 monedas 🪙\n` +
                    `🪙 *Tu nuevo saldo:* ${(chatUsers.coins).toLocaleString()} monedas.`
                )
            } else {
                // PIERDE: Se le restan los 100,000
                chatUsers.coins = monedasActuales - multa
                
                return m.reply(
                    `🚨 *¡TE ATRAPARON!* 🚨\n\n` +
                    `🦅 El Owner te descubrió intentando hackear sus fondos privados.\n` +
                    `💸 *Multa de escape:* -100,000 monedas 🪙\n` +
                    `🪙 *Tu nuevo saldo:* ${(chatUsers.coins).toLocaleString()} monedas.`
                )
            }

        } catch (e) {
            console.error(e)
            m.reply(`❌ Error en el sistema de asaltos: ${e.message}`)
        }
    }
}
