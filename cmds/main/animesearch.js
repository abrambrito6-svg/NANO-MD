export default {
  command: ['animesearch', 'animess', 'buscaranime'],
  category: 'search',
  run: async (client, m, args, usedPrefix, command, text) => {
    const query = args.join(' ');
    if (!query) return m.reply(`🕷️ *Uso:* ${usedPrefix}animesearch <nombre del anime>`);

    await m.reply(`⏱️ *Buscando:* ${query}...`);

    try {
      const fetch = (await import('node-fetch')).default;
      const url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=1`;
      const res = await fetch(url);
      const data = await res.json();

      if (!data.data || data.data.length === 0) {
        return m.reply(`❌ No se encontraron resultados para *${query}*.`);
      }

      const anime = data.data[0];
      const {
        title,
        title_japanese,
        synopsis,
        episodes,
        status,
        score,
        scored_by,
        year,
        genres,
        images
      } = anime;

      const poster = images?.jpg?.large_image_url || images?.jpg?.image_url;
      const genreList = genres?.map(g => g.name).join(', ') || 'Desconocido';

      const caption = `🎴 *${title}* (${title_japanese || 'N/A'})
⏱️ *Estado:* ${status || 'Desconocido'}
📺 *Episodios:* ${episodes || '??'}
⭐ *Puntuación:* ${score || 'N/A'} (${scored_by?.toLocaleString() || 0} votos)
📅 *Año:* ${year || 'N/A'}
🎭 *Géneros:* ${genreList}

📖 *Sinopsis:* ${synopsis?.substring(0, 350) || 'No disponible'}...`;

      await client.sendMessage(m.chat, {
        image: { url: poster },
        caption: caption,
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363427643259597@newsletter',
            newsletterName: "『 𝙕𝙖𝙛𝙠𝙞𝙚𝙡 𝘾𝙝𝙖𝙣𝙣𝙚𝙡 』",
            serverMessageId: 1
          }
        }
      }, { quoted: m });

    } catch (error) {
      console.error(error);
      m.reply('❌ Error al buscar el anime. Intenta de nuevo más tarde.');
    }
  }
};

