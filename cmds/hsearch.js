import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

export const cmdData = {
    name: 'hsearch',
    command: ['hsearch', 'hentaisearch', 'animesearchnsfw'],
    category: 'search',
    isAdmin: false,
    botAdmin: false,

    run: async (client, m, args, usedPrefix, command) => {
        const conn = client || sock;
        const query = args.join(" ");

        // Tu Newsletter blindada al 100% estilo Zafkiel Channel 🥀
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

        if (!query) {
            return conn.sendMessage(m.chat, { 
                text: `📌 *Buscador de Contenido Anime*\n\nIngresa el nombre del término o serie que deseas buscar.\n\n*Ejemplo:*\n${usedPrefix + command} miku` 
            }, { quoted: m, ...zafkielContext });
        }

        try {
            const searchUrl = `https://rule34.xxx/index.php?page=post&s=list&tags=${encodeURIComponent(query)}`;
            
            const response = await fetch(searchUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36'
                }
            });

            if (!response.ok) {
                return conn.sendMessage(m.chat, { text: '❌ No se pudo conectar con el servidor de búsqueda.' }, { quoted: m, ...zafkielContext });
            }

            const html = await response.text();
            const $ = cheerio.load(html);
            let results = [];

            $('span.thumb').each((i, el) => {
                if (i < 8) { 
                    // 🛠️ CORRECCIÓN CRITICA: Limpiamos el ID quitando la 's' y dejando solo números puros
                    const rawId = $(el).attr('id');
                    if (rawId) {
                        const idLimpio = rawId.replace(/[^0-9]/g, ''); 
                        const link = `https://rule34.xxx/index.php?page=post&s=view&id=${idLimpio}`;
                        const title = $(el).find('img').attr('title') || 'Post Anime';
                        
                        results.push({ id: idLimpio, title, link });
                    }
                }
            });

            if (results.length === 0) {
                return conn.sendMessage(m.chat, { text: '❌ No se encontraron resultados válidos. Intenta con otra palabra.' }, { quoted: m, ...zafkielContext });
            }

            let caption = `乂 ¡ANIME SEARCH! 乂\n\n`;

            results.forEach((v, i) => {
                const infoCorta = v.title.split(' ').slice(0, 4).join(', ');
                caption += `${i + 1}\n`;
                caption += `≡ ID : ${v.id}\n`;
                caption += `≡ Info : ${infoCorta}...\n`;
                caption += `≡ Link : ${v.link}\n\n`;
            });

            caption += `> » Usa los enlaces para ver el contenido directamente en tu navegador de forma segura.\n\n> 🎮 Powered by Kurumi-MD`;

            // Enviamos el mensaje con tu banner de Catbox
            await conn.sendMessage(m.chat, { 
                image: { url: 'https://files.catbox.moe/5n3533.jpg' }, 
                caption: caption 
            }, { quoted: m, ...zafkielContext });

        } catch (e) {
            console.error('Error en el hsearch modificado:', e);
            await conn.sendMessage(m.chat, { 
                text: `> Error de sincronización al procesar el catálogo externo.` 
            }, { quoted: m, ...zafkielContext });
        }
    }
};

export default cmdData;
