import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import yts from 'yt-search';

export default {
  command: ['play', 'playaudio', 'ytmp3', 'music'],
  category: 'downloads',
  run: async (client, m, args, usedPrefix, command, text) => {
    const query = args.join(' ');
    if (!query) return m.reply(`🕷|🜸*ingresa el name lo quieres descargar, uso:* ${usedPrefix}play <nombre o enlace>`);

    await m.reply(`|🜸*Buscando:* ${query}...`);

    let url = query;
    let video = null;
    const isUrl = query.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/);

    if (!isUrl) {
      try {
        const searchResults = await yts(query);
        const videos = searchResults.videos;
        if (!videos || videos.length === 0) throw new Error('No se encontraron resultados');
        video = videos[0];
        url = video.url;

        // Generar información y thumbnail
        const thumbnail = video.thumbnail || 'https://i.ibb.co/Y4sq8PFF/a04d7ee6716888f11af513ca263d9b8e.jpg';
        const caption = `🎵 *${video.title}*
⏱️ Duración: ${video.duration.timestamp}
👁️ Vistas: ${video.views.toLocaleString()}
 ⛧⃝𓄃⸸ Descargando audio...`;

        await client.sendMessage(m.chat, {
          image: { url: thumbnail },
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
      } catch (err) {
        console.error(err);
        return m.reply('❌ No se encontró el video.');
      }
    } else {
      await m.reply(` |🜸 *Descargando audio de la URL...*`);
    }

    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    const outputFile = path.join(tmpDir, `${Date.now()}.mp3`);

    const ytCommand = `yt-dlp -f bestaudio --extract-audio --audio-format mp3 --audio-quality 5 -o "${outputFile}" "${url}"`;

    exec(ytCommand, { maxBuffer: 1024 * 1024 * 100 }, async (error, stdout, stderr) => {
      if (error) {
        console.error('yt-dlp error:', stderr || error.message);
        return m.reply('❌ Error al descargar el audio.');
      }

      if (fs.existsSync(outputFile)) {
        await client.sendMessage(m.chat, {
          audio: fs.readFileSync(outputFile),
          mimetype: 'audio/mpeg',
          fileName: `audio_${Date.now()}.mp3`,
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
        fs.unlinkSync(outputFile);
      } else {
        m.reply('❌ El archivo no se generó correctamente.');
      }
    });
  }
};
