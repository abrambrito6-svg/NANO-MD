
// ========== CONFIGURACIÓN ==========
const NEWSLETTER = {
  contextInfo: {
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: '120363427643259597@newsletter',
      newsletterName: '『 𝙕𝙖𝙛𝙠ι𝙚λ 𝘾𝙝𝙖𝙣𝗻𝙚𝙡 』',
      serverMessageId: 1
    }
  }
};

export default {
  command: ['links', 'enlaces', 'redes'],
  category: 'info',
  run: async (client, m, args, usedPrefix, command) => {
    try {
      const grupos = [
        {
          nombre: '🌟 𝐊𝐮𝐫𝐮𝐦𝐢 𝐓𝐨𝐤𝐢𝐬𝐚𝐤𝐢 🌟',
          enlace: 'https://chat.whatsapp.com/KS91YAXO4gc4zwkc18dAvK'
        },
        {
          nombre: '🎴 𝐄𝐥 𝐂𝐮𝐥𝐭𝐨 𝐝𝐞 𝐙𝐚𝐟𝐤𝐢𝐞𝐥 🎴',
          enlace: 'https://chat.whatsapp.com/FOCGzq1qbcZKRdBJwQobF3'
        }
      ];

      const canal = {
        nombre: '📢 𝐂𝐚𝐧𝐚𝐥 𝐎𝐟𝐢𝐜𝐢𝐚𝐥 📢',
        enlace: 'https://whatsapp.com/channel/0029Vb88DAM0G0XiQes3K42c'
      };

      // Banner de imagen - ¡Cámbialo por tu imagen favorita de las que me enviaste!
      const bannerImage = 'https://files.catbox.moe/5n3533.jpg';

      // Texto informativo
      const caption = `╭━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃     🕷️ 𝐋𝐈𝐍𝐊𝐒 𝐎𝐅𝐈𝐂𝐈𝐀𝐋𝐄𝐒 🕷️
┃   ⏱️ 𝐊𝐔𝐑𝐔𝐌𝐈 𝐓𝐎𝐊𝐈𝐒𝐀𝐊𝐈 ⏱️
┃━━━━━━━━━━━━━━━━━━━━━━━━━━
┃
┃ 👥 *𝐆𝐑𝐔𝐏𝐎𝐒 𝐃𝐄 𝐖𝐇𝐀𝐓𝐒𝐀𝐏𝐏*
┃
┃ ✦ *${grupos[0].nombre}*
┃   » ${grupos[0].enlace}
┃
┃ ✦ *${grupos[1].nombre}*
┃   » ${grupos[1].enlace}
┃
┃ 📢 *𝐂𝐀𝐍𝐀𝐋 𝐃𝐄 𝐖𝐇𝐀𝐓𝐒𝐀𝐏𝐏*
┃
┃ ✦ *${canal.nombre}*
┃   » ${canal.enlace}
┃
┃  *𝐒𝐎𝐏𝐎𝐑𝐓𝐄 𝐘 𝐀𝐘𝐔𝐃𝐀*
┃
┃ ✦ Si tienes problemas, contacta con el *${usedPrefix}owner*
┃
┃ ⏱️ *Zafkiel Channel* 🕷️
╰━━━━━━━━━━━━━━━━━━━━━━━━━╯`;

      // Enviar el mensaje con la imagen
      await client.sendMessage(m.chat, {
        image: { url: bannerImage },
        caption: caption,
        ...NEWSLETTER
      }, { quoted: m });

    } catch (error) {
      console.error('Error en comando links:', error);
      await m.reply('《✧》 Ocurrió un error al cargar los enlaces oficiales. Por favor, inténtalo de nuevo más tarde.');
    }
  }
};
