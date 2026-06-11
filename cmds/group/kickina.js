import { delay } from '@whiskeysockets/baileys';

// 🕰️ Tu Newsletter oficial 『 𝙕𝙖𝙛𝙠ι𝙚λ 𝘾𝙝𝙖𝙣𝙣𝙚λ 』 🥀
const NL = {
  contextInfo: {
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: '120363427643259597@newsletter',
      newsletterName: '『 𝙕𝙖𝙛𝙠ι𝙚𝙡 𝘾𝙝𝙖𝙣𝗻𝙚𝗹 』',
      serverMessageId: 1
    }
  }
};

export default {
  command: ['kickinactive', 'purga', 'limpiar'],
  category: 'grupo',
  run: async (client, m, { args, usedPrefix, command }) => {
    try {
      if (!m.isGroup) return client.reply(m.chat, '《✧》 ¡Ara ara~! Este comando solo puede ser utilizado dentro de un grupo.', m);
      
      // 🕵️‍♂️ Obtener metadatos en tiempo real para verificar permisos sin depender del handler
      const groupMetadata = await client.groupMetadata(m.chat).catch(() => null);
      if (!groupMetadata) return client.reply(m.chat, '《✧》 Error al cargar la información del grupo.', m);
      
      const participants = groupMetadata.participants || [];
      const userParticipant = participants.find(p => p.id.split('@')[0] === m.sender.split('@')[0]) || {};
      const botParticipant = participants.find(p => p.id.split('@')[0] === client.user.id.split(':')[0]) || {};
      
      const userIsAdmin = userParticipant.admin === 'admin' || userParticipant.admin === 'superadmin';
      const botIsAdmin = botParticipant.admin === 'admin' || botParticipant.admin === 'superadmin';

      if (!userIsAdmin) return client.reply(m.chat, '*「⏳」 Acceso Denegado*\n\nSolo los administradores que controlan el tiempo en este grupo pueden ejecutar una purga.', m);
      if (!botIsAdmin) return client.reply(m.chat, '《✧》 Necesito ser administradora del grupo para poder devorar a los inactivos con mis sombras.', m);

      // Verificar la base de datos de mensajes del chat actual
      if (!global.db.data) global.db.data = {};
      if (!global.db.data.users) global.db.data.users = {};

      const usersData = global.db.data.users;
      let inactiveParticipants = [];

      // Filtrar quiénes están en el grupo pero no tienen registros o mensajes en la base de datos
      for (let participant of participants) {
        const jid = participant.id;
        const num = jid.split('@')[0];
        
        // Evitar meter en la lista de expulsión a los admins, al creador del grupo y al propio bot
        const isAdmin = participant.admin === 'admin' || participant.admin === 'superadmin';
        const isOwner = groupMetadata.owner?.replace(/:\d+/, '').split('@')[0] === num;
        const isBot = client.user.id.split(':')[0] === num;

        if (!isAdmin && !isOwner && !isBot) {
          // Si el usuario no existe en la DB o su contador de mensajes está en 0 o vacío
          if (!usersData[jid] || !usersData[jid].chatCount || usersData[jid].chatCount === 0) {
            inactiveParticipants.push(jid);
          }
        }
      }

      // Si no hay fantasmas en el chat
      if (inactiveParticipants.length === 0) {
        return client.reply(m.chat, '╭─「 🕰️ 𝗭𝗔𝗙𝗞𝗜𝗘𝗟 」─╮\n│\n│ 💋 *Dimensión Limpia.*\n│ No encontré ningún espectro inactivo.\n│ Todos los miembros han consumido\n│ su tiempo correctamente aquí. ♥️\n│\n╰──────────────────╯', m);
      }

      // Ejecutar la purga con estética de Kurumi
      await client.sendMessage(m.chat, {
        text: `╭─「 🕰️ 𝗜𝗡𝗜𝗖𝗜𝗔𝗡𝗗𝗢 𝗣𝗨𝗥𝗚𝗔 」─╮\n│\n│ 🔮 *Zafkiel: Séptima Bala!*\n│\n│ 🩸 He detectado a *${inactiveParticipants.length}* fantasmas\n│ que no aportan nada a este espacio.\n│\n│ ⏳ Ara ara~ El reloj se detuvo para ellos.\n│ Procediendo a devorarlos en las sombras...\n│\n╰─────────────────────────╯`,
        ...NL
      }, { quoted: m });

      // Delay artificial para que no sature la API de WhatsApp al sacar mucha gente junta
      await delay(2000);

      let expuldadosCount = 0;
      for (let jid of inactiveParticipants) {
        try {
          await client.groupParticipantsUpdate(m.chat, [jid], 'remove');
          expuldadosCount++;
          await delay(800); // Pausa de casi 1 segundo entre cada expulsión para evitar baneos de WhatsApp
        } catch (err) {
          console.error(`Error al purgar a ${jid}:`, err);
        }
      }

      // Mensaje de fin de la purga
      return client.sendMessage(m.chat, {
        text: `╭─「 🕰️ 𝗣𝗨𝗥𝗚𝗔 𝗖𝗢𝗡𝗖𝗟𝗨𝗜𝗗𝗔 」─╮\n│\n│ 🔮 *Exterminio completado.*\n│\n│ 💋 Se han eliminado *${expuldadosCount}* espectros\n│ inactivos de esta línea temporal.\n│\n│ 🩸 Ahora el chat está limpio y listo\n│ para los verdaderos invitados. Ara ara~\n│\n╰─「 ⏳ *Dimensión Restaurada* 」─╯`,
        ...NL
      });

    } catch (e) {
      return m.reply(`> [Error en KickInactive]: ${e.message}`);
    }
  }
};
