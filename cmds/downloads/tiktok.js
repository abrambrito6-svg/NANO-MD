import fetch from 'node-fetch';

export const cmdData = {
    name: 'tiktok',
    command: ['tiktok', 'tt', 'tiktoksearch', 'ttsearch', 'tts'],
    category: 'downloader',
    isAdmin: false,
    botAdmin: false,

    run: async (client, m, args, usedPrefix, command) => {
        const conn = client || sock;
        const text = args.join(" ");

        // Tu Newsletter obligatoria blindada en cada mensaje enviado
        const zafkielContext = {
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363427643259597@newsletter',
                    newsletterName: '『 𝙕𝙖𝙛𝙠ι𝙚𝙡 𝘾𝙝𝙖𝙣𝙣𝙚𝙡 』',
                    serverMessageId: 1
                }
            }
        };

        if (!text) {
            return conn.sendMessage(m.chat, { 
                text: `|🜸 ingresá un término de búsqueda o un enlace de vídeo de TikTok.` 
            }, { quoted: m, ...zafkielContext });
        }

        // 📥 Mandamos el aviso de espera en caliente justo al iniciar el proceso
        await conn.sendMessage(m.chat, { 
            text: ' *|🜸 descargando el video, espere un momento.*' 
        }, { quoted: m, ...zafkielContext });

        // Detectar si el texto ingresado es un enlace válido de TikTok
        const isUrl = /(?:https?:\/\/)?(?:www\.|vm|vt|t)?\.?tiktok\.com\/([^\s&]+)/gi.test(text);

        try {
            if (isUrl) {
                // MODO DESCARGA DIRECTA POR ENLACE
                const apiRes = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(text)}&hd=1`);
                const json = await apiRes.json();

                if (!json || json.code !== 0 || !json.data) {
                    return conn.sendMessage(m.chat, { 
                        text: '《✧》 No se pudo procesar la descarga. Verifica que el enlace sea público y no tenga restricciones.' 
                    }, { quoted: m, ...zafkielContext });
                }

                const data = json.data;
                const title = data.title || 'Sin título';
                const author = data.author?.nickname || data.author?.unique_id || 'Desconocido';
                const duration = data.duration ? `${data.duration}s` : 'N/A';
                const likes = data.digg_count || 0;
                const comments = data.comment_count || 0;
                const views = data.play_count || 0;
                const shares = data.share_count || 0;

                const caption = `ㅤ۟∩　ׅ　★ ໌　ׅ　🅣𝗂<b>𝗄🅣𝗈κ</b> 🅓<b>ownload</b>　ׄᰙ\n\n` +
                                `𖣣ֶㅤ֯⌗ ✎  ׄ ⬭ Título: ${title}\n` +
                                `𖣣ֶㅤ֯⌗ ꕥ  ׄ ⬭ Autor: ${author}\n` +
                                `𖣣ֶㅤ֯⌗ ⴵ  ׄ ⬭ Duración: ${duration}\n` +
                                `𖣣ֶㅤ֯⌗ ❖  ׄ ⬭ Likes: ${likes.toLocaleString()}\n` +
                                `𖣣ֶㅤ֯⌗ ❀  ׄ ⬭ Comentarios: ${comments.toLocaleString()}\n` +
                                `𖣣ֶㅤ֯⌗ ✿  ׄ ⬭ Vistas: ${views.toLocaleString()}\n` +
                                `𖣣ֶㅤ֯⌗ ☆  ׄ ⬭ Compartidos: ${shares.toLocaleString()}\n\n` +
                                `> 🎮 Powered by Kurumi-MD`;

                // CASO A: Es un carrusel de imágenes (Fotos de TikTok)
                if (data.images && data.images.length > 0) {
                    const medias = data.images.map(url => ({ 
                        type: 'image', 
                        data: { url }, 
                        caption 
                    }));
                    
                    await conn.sendAlbumMessage(m.chat, medias, { quoted: m, ...zafkielContext });

                    // Enviamos también el audio de fondo por separado
                    if (data.music) {
                        await conn.sendMessage(m.chat, { 
                            audio: { url: data.music }, 
                            mimetype: 'audio/mp4', 
                            fileName: 'tiktok_audio.mp4' 
                        }, { quoted: m, ...zafkielContext });
                    }
                } else {
                    // CASO B: Es un vídeo normal
                    const videoUrl = data.hdplay || data.play;
                    if (!videoUrl) throw new Error('No video download link found');

                    await conn.sendMessage(m.chat, { 
                        video: { url: videoUrl }, 
                        caption 
                    }, { quoted: m, ...zafkielContext });
                }

            } else {
                // MODO BÚSQUEDA POR TEXTO
                const searchRes = await fetch(`https://www.tikwm.com/api/feed/search?keywords=${encodeURIComponent(text)}`);
                const json = await searchRes.json();

                if (!json || json.code !== 0 || !json.data || json.data.videos.length === 0) {
                    return conn.sendMessage(m.chat, { 
                        text: '《✧》 No se encontraron videos que coincidan con tu búsqueda.' 
                    }, { quoted: m, ...zafkielContext });
                }

                const validVideos = json.data.videos.slice(0, 3);

                for (let v of validVideos) {
                    const videoTitle = v.title || 'Sin título';
                    const videoAuthor = v.author?.nickname || 'Desconocido';
                    const videoLikes = v.digg_count || 0;
                    const videoViews = v.play_count || 0;
                    const downloadLink = `https://www.tikwm.com${v.play}`;

                    const searchCaption = `ㅤ۟∩　ׅ　★ ໌　ׅ　🅣𝗂<b><b><b><b>κ🅣𝗈κ</b></b></b></b> 🅢<b>earch</b>　ׄᰙ\n\n` +
                                          `𖣣ֶㅤ֯⌗ ✎  ׄ ⬭ Título: ${videoTitle}\n` +
                                          `𖣣ֶㅤ֯⌗ ꕥ  ׄ ⬭ Autor: ${videoAuthor}\n` +
                                          `𖣣ֶㅤ֯⌗ ❖  ׄ ⬭ Likes: ${videoLikes.toLocaleString()}\n` +
                                          `𖣣ֶㅤ֯⌗ ✿  ׄ ⬭ Vistas: ${videoViews.toLocaleString()}\n\n` +
                                          `> 🎮 Powered by Kurumi-MD`;

                    await conn.sendMessage(m.chat, { 
                        video: { url: downloadLink }, 
                        caption: searchCaption 
                    }, { quoted: m, ...zafkielContext });
                }
            }

        } catch (e) {
            console.error('Error en comando tiktok:', e);
            await conn.sendMessage(m.chat, { 
                text: `> An unexpected error occurred while executing command ${usedPrefix + command}.\n\n> *[Error Interno]:* El backend de descarga falló o el archivo superó los límites permitidos.` 
            }, { quoted: m, ...zafkielContext });
        }
    }
};

export default cmdData;
