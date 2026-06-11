// ========== CONFIGURACIÓN ==========
const BANNER_IMAGE = 'https://files.catbox.moe/5n3533.jpg';
const NEWSLETTER_JID = '120363427643259597@newsletter';
const NEWSLETTER_NAME = '『 𝙕𝙖𝙛𝙠𝙞𝙚𝙡 𝘾𝙝𝙖𝙣𝙣𝙚𝙡 』';

export default {
  command: ['privacy', 'politicas', 'privacidad', 'datos'],
  category: 'info',
  run: async (client, m, args, usedPrefix, command) => {
    const privacyText = `🕷️ *POLÍTICAS DE PRIVACIDAD* 🕷️

⏱️ *Kurumi Tokisaki Bot* respeta tu privacidad.

🔒 *Datos que NO almacenamos:*
- Mensajes personales
- Números de teléfono (excepto el propio)
- Contenido multimedia

📊 *Datos que SÍ almacenamos (solo para funcionamiento):*
- Tu registro: nombre, edad (si decides registrarte)
- Nivel, experiencia, yenes, inventario de waifus
- Configuración de grupos (antinsfw, bienvenidas, etc.)

🗑️ *Puedes solicitar la eliminación de tus datos* escribiendo a @NanoVoid.

🔗 *Más info en nuestro canal:* https://whatsapp.com/channel/0029Vb88DAM0G0XiQes3K42c

🕸️ *Al usar este bot aceptas estas políticas.*`;

    await client.sendMessage(m.chat, {
      image: { url: BANNER_IMAGE },
      caption: privacyText,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: NEWSLETTER_JID,
          newsletterName: NEWSLETTER_NAME,
          serverMessageId: 1
        }
      }
    }, { quoted: m });
  }
};
