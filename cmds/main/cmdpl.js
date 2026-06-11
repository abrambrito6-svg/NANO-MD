import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

export const cmdData = {
    name: 'mcpedldl',
    command: ['mcpedldl', 'downloadmod', 'descargarmod', 'getaddon'],
    isAdmin: false,
    botAdmin: false,

    run: async (client, m, args, usedPrefix, command, text) => {
        const conn = client || sock;
        
        // Configuración de tu Newsletter obligatoria en cada respuesta
        const zafkielContext = {
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363427643259597@newsletter',
                    newsletterName: '『 𝙕𝙖𝙛𝙠𝙞𝙚𝙡 𝘾𝙝𝙖𝙣𝙣𝙚𝙡 』',
                    serverMessageId: 1
                }
            }
        };

        // Validar que el usuario envíe el enlace de MCPEDL
        if (!text || !text.includes('mcpedl.org')) {
            return conn.sendMessage(m.chat, { 
                text: `📦 *Descargador de Addons de MCPEDL*\n\nUsa el comando seguido del enlace que te dio el buscador.\n\n*Ejemplo:*\n${usedPrefix + command} https://mcpedl.org/kitchen-furniture-mod-minecraft-pe/` 
            }, { quoted: m, ...zafkielContext });
        }

        // Aviso de que el bot está procesando la descarga pesada
        await conn.sendMessage(m.chat, { 
            text: '⏳ *Descargando archivo desde los servidores de MCPEDL... Esto puede demorar unos segundos dependiendo del peso del mod.*' 
        }, { quoted: m, ...zafkielContext });

        try {
            // 1. Entramos a la página del artículo para buscar los botones de descarga
            const resPage = await fetch(text.trim());
            const htmlPage = await resPage.text();
            const $ = cheerio.load(htmlPage);

            let downloadUrl = '';

            // Raspamos los enlaces de descarga comunes dentro de los posts de MCPEDL
            $('a').each((i, el) => {
                const href = $(el).attr('href');
                if (href && (href.includes('/download/') || href.includes('.mcaddon') || href.includes('.mcpack') || href.includes('.zip'))) {
                    downloadUrl = href;
                    return false; // Rompe el ciclo al encontrar el primer enlace válido
                }
            });

            // Si el enlace es interno de la web, resolvemos la redirección automática
            if (downloadUrl && downloadUrl.startsWith('/')) {
                downloadUrl = `https://mcpedl.org${downloadUrl}`;
            }

            // 2. Si no se encontró un enlace directo, probamos con el selector de las tablas de descarga
            if (!downloadUrl) {
                downloadUrl = $('.download-button a').attr('href') || $('.wp-block-button__link').attr('href');
            }

            if (!downloadUrl) {
                return conn.sendMessage(m.chat, { 
                    text: '❌ No se pudo extraer un enlace de descarga directa para este addon. Es posible que requiera saltar a una web externa del creador (como MediaFire o Linkvertise).' 
                }, { quoted: m, ...zafkielContext });
            }

            // 3. Descargamos el archivo binario del mod/addon
            const fileRes = await fetch(downloadUrl);
            const buffer = await fileRes.buffer();

            // Extraemos el nombre original del archivo o creamos uno dinámico
            let fileName = downloadUrl.split('/').pop().split('?')[0];
            if (!fileName || (!fileName.endsWith('.mcpack') && !fileName.endsWith('.mcaddon') && !fileName.endsWith('.zip'))) {
                fileName = 'Addon_Minecraft_Bedrock.mcaddon';
            }

            // Determinamos el tipo de contenido para el documento de WhatsApp
            let mimeType = 'application/zip';
            if (fileName.endsWith('.mcpack')) mimeType = 'application/octet-stream';
            if (fileName.endsWith('.mcaddon')) mimeType = 'application/octet-stream';

            // 4. Enviamos el archivo final al usuario con tu Newsletter inyectada
            await conn.sendMessage(m.chat, {
                document: buffer,
                mimetype: mimeType,
                fileName: fileName,
                caption: `✅ *¡Aquí tienes tu Addon listo para jugar!*\n\n📦 *Archivo:* ${fileName}\n🎮 Abre el archivo directamente en tu celular para que se importe solo en Minecraft.\n\n> 🕹️ Powered by Kurumi-MD`
            }, { quoted: m, ...zafkielContext });

        } catch (err) {
            console.error('Error en el descargador MCPEDL:', err);
            return conn.sendMessage(m.chat, { 
                text: '🥀 Hubo un fallo interno al intentar descargar el archivo. Inténtalo de nuevo con otro enlace.' 
            }, { quoted: m, ...zafkielContext });
        }
    }
};

export default cmdData;
