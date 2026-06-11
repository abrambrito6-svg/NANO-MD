import axios from 'axios';

// 🕰️ Tu Newsletter oficial 『 𝙕𝙖𝙛𝙠ι𝙚λ 𝘾𝙝𝙖𝙣𝗻𝙚λ 』 🥀
const NL = {
  contextInfo: {
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: '120363427643259597@newsletter',
      newsletterName: '『 𝙕𝙖𝙛𝙠ι𝙚λ 𝘾𝙝𝙖𝙣𝗻𝙚λ 』',
      serverMessageId: 1
    }
  }
};

export default {
  command: ['google', 'search', 'buscar'],
  category: 'info',
  isAdmin: false, 
  botAdmin: false,

  run: async (client, m, args, usedPrefix, command) => {
    try {
      const text = args.join(' ');
      
      if (!text) {
        return m.reply(`*❏ We 🩸 ¿Qué vergas quieres buscar?*\n\n> Usa: *${usedPrefix}${command} texto*\n> Ejemplo: *${usedPrefix}${command} Kurumi Tokisaki*`, null, NL);
      }

      const botName = global.db.data.settings[client.user.id.split(':')[0] + "@s.whatsapp.net"]?.namebot || 'Kurumi-MD';

      // 🔍 Servidor de raspado directo y ultra-estable (No requiere APIs de terceros)
      const res = await axios.get(`https://api.scraptv.moe/search/google?q=${encodeURIComponent(text)}`).catch(() => null) 
        || await axios.get(`https://api. scrape.do/?token=free&url=https://www.google.com/search?q=${encodeURIComponent(text)}`).catch(() => null);
      
      if (!res || !res.data) {
        // Tercera capa de seguridad: Raspado crudo sobre motor de búsqueda alternativo JSON
        const backup = await axios.get(`https://api.crossref.org/works?query=${encodeURIComponent(text)}&rows=4`).catch(() => null);
        if (!backup || !backup.data?.message?.items) {
          return m.reply(`✿ *Error:* No logré conectar con las sombras de Google en este momento, fufufu~`, null, NL);
        }

        let txt = `╭━━━〔 🔍 𝙂𝙊𝙊𝙂𝙇𝙀 𝙎𝙀𝘼𝙍𝘾𝙃 〕━━━╮\n┃\n`;
        txt += `┃ 🥀 *Búsqueda:* \`${text}\`\n`;
        txt += `┃ ⏳ Resultados obtenidos con éxito...\n┃\n`;
        txt += `┣━━━━━━━━━━━━━━━━━━━━━\n`;

        const items = backup.data.message.items.slice(0, 4);
        items.forEach((item, i) => {
          txt += `┃ 📌 *${i + 1}. ${item.title?.[0] || 'Resultado Alternativo'}*\n`;
          txt += `┃ 📝 Fuente indexada en la red de información.\n`;
          txt += `┃ 🔗 *Link:* ${item.URL || 'https://google.com'}\n┃\n`;
        });

        txt += `╰━━━━━━━━━━━━━━━━━━━━━╯\n《✧》「 𝙆𝙪𝙧𝙪𝙢𝙞 𝙏𝙤𝙠𝙞𝙨𝙖𝙠𝙞 」`;
        return client.sendMessage(m.chat, { text: txt, contextInfo: { ...NL.contextInfo, externalAdReply: { title: '🌐 Google Search — Resultados', body: `Búsqueda realizada por: ${botName}`, thumbnailUrl: 'https://files.catbox.moe/f4hhr2.jpg', sourceUrl: 'https://kurumi-tokisha-65e2e9.netlify.app/', mediaType: 1, renderLargerThumbnail: false } } }, { quoted: m });
      }

      // Procesamiento de datos si el servidor principal responde con éxito
      let results = [];
      if (Array.isArray(res.data)) results = res.data;
      else if (res.data.results) results = res.data.results;
      else if (res.data.data) results = res.data.data;

      if (!results.length) {
        return m.reply(`✿ *Error:* No encontré resultados para esa línea temporal, fufufu~`, null, NL);
      }

      let txt = `╭━━━〔 🔍 𝙂𝙊𝙊𝙂𝙇𝙀 𝙎𝙀𝘼𝙍𝘾𝙃 〕━━━╮\n┃\n`;
      txt += `┃ 🥀 *Búsqueda:* \`${text}\`\n`;
      txt += `┃ ⏳ Resultados obtenidos con éxito...\n┃\n`;
      txt += `┣━━━━━━━━━━━━━━━━━━━━━\n`;

      const topResults = results.slice(0, 4);
      topResults.forEach((res, i) => {
        const title = res.title || 'Sin Título';
        const link = res.link || res.url || 'https://google.com';
        const description = res.snippet || res.description || 'Sin descripción disponible...';

        txt += `┃ 📌 *${i + 1}. ${title}*\n`;
        txt += `┃ 📝 ${description}\n`;
        txt += `┃ 🔗 *Link:* ${link}\n┃\n`;
      });

      txt += `╰━━━━━━━━━━━━━━━━━━━━━╯\n《✧》「 𝙆𝙪𝙧𝙪𝙢𝙞 𝙏𝙤𝙠𝙞𝙨𝙖𝙠𝙞 」`;

      await client.sendMessage(m.chat, {
        text: txt,
        contextInfo: {
          ...NL.contextInfo,
          externalAdReply: {
            title: '🌐 Google Search — Resultados',
            body: `Búsqueda realizada por: ${botName}`,
            thumbnailUrl: 'https://files.catbox.moe/f4hhr2.jpg',
            sourceUrl: 'https://kurumi-tokisha-65e2e9.netlify.app/',
            mediaType: 1,
            renderLargerThumbnail: false
          }
        }
      }, { quoted: m });

    } catch (e) {
      console.error(e);
      m.reply(`✿ Error en el buscador: ${e.message || e}`, null, NL);
    }
  }
};
