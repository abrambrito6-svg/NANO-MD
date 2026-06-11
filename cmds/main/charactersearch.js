export default {
  command: ['charactersearch', 'character', 'personaje', 'buscarpersonaje'],
  category: 'search',
  run: async (client, m, args, usedPrefix, command, text) => {
    const query = args.join(' ');
    if (!query) return m.reply(`🕷️ *Uso:* ${usedPrefix}charactersearch <nombre del personaje>`);

    await m.reply(`⏱️ *Buscando personaje:* ${query}...`);

    try {
      const fetch = (await import('node-fetch')).default;
      const url = `https://api.jikan.moe/v4/characters?q=${encodeURIComponent(query)}&limit=1&order_by=favorites&sort=desc`;
      const res = await fetch(url);
      const data = await res.json();

      if (!data.data || data.data.length === 0) {
        return m.reply(`❌ No se encontró el personaje *${query}*.`);
      }

      const char = data.data[0];
      const {
        name,
        name_kanji,
        about,
        images,
        nicknames,
        animeography,
        favorites
      } = char;

      const imageUrl = images?.jpg?.image_url || images?.webp?.image_url;
      const nicknameList = nicknames?.length ? nicknames.join(', ') : 'Sin apodos';
      const primerAnime = animeography?.[0]?.anime?.title || 'Desconocido';

      const caption = `🎭 *${name}* ${name_kanji ? `(${name_kanji})` : ''}
🌟 *Favoritos:* ${favorites?.toLocaleString() || 0}
🎭 *Apodos:* ${nicknameList}
📺 *Aparece en:* ${primerAnime}

📖 *Sobre el personaje:* ${about?.substring(0, 400) || 'No disponible'}...`;

      await client.sendMessage(m.chat, {
        image: { url: imageUrl },
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
      m.reply('❌ Error al buscar el personaje. Intenta de nuevo más tarde.');
    }
  }
};

