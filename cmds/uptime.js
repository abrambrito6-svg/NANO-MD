// ========== CONFIGURACIÓN ==========
const BANNER_IMAGE = 'https://files.catbox.moe/5n3533.jpg';
const NEWSLETTER_JID = '120363427643259597@newsletter';
const NEWSLETTER_NAME = '『 𝙕𝙖𝙛𝙠𝙞𝙚𝙡 𝘾𝙝𝙖𝙣𝙣𝙚𝙡 』';

export default {
  command: ['uptime', 'runtime', 'activo', 'tiempo'],
  category: 'info',
  run: async (client, m, args, usedPrefix, command) => {
    const uptimeSeconds = process.uptime();
    const days = Math.floor(uptimeSeconds / 86400);
    const hours = Math.floor((uptimeSeconds % 86400) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeSeconds % 60);

    const uptimeText = `⏱️ *KURUMI EN LÍNEA*\n\n🕷️ *Días:* ${days}\n⏰ *Horas:* ${hours}\n📟 *Minutos:* ${minutes}\n⚡ *Segundos:* ${seconds}\n\n🕸️ *Bot activo y listo para usar.*`;

    await client.sendMessage(m.chat, {
      image: { url: BANNER_IMAGE },
      caption: uptimeText,
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
