import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

export default {
  command: ['pinvideo'],
  category: 'download',
  run: async (client, m, args, usedPrefix, command) => {
    try {
      if (!args[0]) {
        return client.reply(m.chat, `🉐 Ingresa un enlace de Pinterest.\n> Ejemplo: *${usedPrefix + command} https://pin.it/XXXXXX*`, m);
      }

      const initialUrl = args[0];
      if (!/pinterest\.com|pin\.it/i.test(initialUrl)) {
        return client.reply(m.chat, `🪢 El enlace proporcionado no es válido para Pinterest.`, m);
      }

      await m.react('🕒');
      await client.reply(m.chat, `🦖 Descargando...`, m);

      // 1. Resolver enlaces acortados (pin.it)
      let targetUrl = initialUrl;
      if (initialUrl.includes('pin.it')) {
        const response = await fetch(initialUrl, { 
          redirect: 'follow',
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
        });
        targetUrl = response.url;
      }

      // Consola: URL Objetivo
      console.log('--- TARGET URL ---');
      console.log(targetUrl);

      // 2. Obtener el HTML
      const pageResponse = await fetch(targetUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
      });

      if (!pageResponse.ok) {
        await m.react('✖️');
        return client.reply(m.chat, `🪢 No se pudo acceder a la página de Pinterest.`, m);
      }

      const html = await pageResponse.text();
      
      // Consola: Primeros 2000 caracteres del HTML
      console.log('--- HTML SLICE (0-2000) ---');
      console.log(html.slice(0, 2000));

      const $ = cheerio.load(html);
      let videoUrl = null;

      // === PASO A: Buscar en Etiquetas de Metadatos Estándar ===
      videoUrl = $('meta[property="og:video"]').attr('content') || 
                 $('meta[property="og:video:url"]').attr('content') ||
                 $('meta[property="og:video:secure_url"]').attr('content') ||
                 $('meta[name="twitter:player:stream"]').attr('content');

      // === PASO B: Extracción desde Bloques JSON Internos de Pinterest ===
      if (!videoUrl) {
        // Buscar en todas las etiquetas script buscando estructuras JSON de Pinterest
        $('script').each((index, element) => {
          const scriptContent = $(element).html();
          if (scriptContent && (scriptContent.includes('__PWS_DATA__') || scriptContent.includes('pins'))) {
            try {
              // Buscar patrones de URLs de video .mp4 en cualquier formato de almacenamiento interno
              const mp4Matches = scriptContent.match(/"url"\s*:\s*"(https:\\\/\\\/[^"]+\.mp4)"/gi) || 
                                 scriptContent.match(/"url"\s*:\s*"(https:\/\/[^"]+\.mp4)"/gi);
              
              if (mp4Matches) {
                // Filtrar la opción con mayor resolución (evitando miniaturas u optimizaciones bajas si existen)
                for (let matchStr of mp4Matches) {
                  const cleanUrlMatch = matchStr.match(/"url"\s*:\s*"([^"]+)"/);
                  if (cleanUrlMatch && cleanUrlMatch[1]) {
                    let potentialUrl = cleanUrlMatch[1].replace(/\\u002F|\\\//g, '/');
                    if (potentialUrl.includes('/v720p/') || potentialUrl.includes('/h264/')) {
                      videoUrl = potentialUrl;
                      break;
                    }
                    videoUrl = potentialUrl; // Fallback al primer .mp4 encontrado
                  }
                }
              }
            } catch (jsonErr) {
              // Error silencioso en el parseo individual de scripts
            }
          }
        });
      }

      // === PASO C: Fallback mediante Expresión Regular sobre todo el documento ===
      if (!videoUrl) {
        const globalMatch = html.match(/"url"\s*:\s*"(https?:\\?\/\\?\/[^"\s]+\.mp4)"/i);
        if (globalMatch && globalMatch[1]) {
          videoUrl = globalMatch[1].replace(/\\u002F|\\\//g, '/');
        }
      }

      // Consola: URL del Video Resultante
      console.log('--- VIDEO URL ---');
      console.log(videoUrl);

      // 3. Validación y envío
      if (!videoUrl) {
        await m.react('✖️');
        return client.reply(m.chat, `🪢 No encontré ningún video en este enlace. Asegúrate de que sea un Pin de video público.`, m);
      }

      await m.react('✔️');
      await client.sendMessage(m.chat, { 
        video: { url: videoUrl }, 
        caption: `🉐 Video encontrado.`,
        mentions: [m.sender] 
      }, { quoted: m });

    } catch (error) {
      await m.react('✖️');
      await client.reply(m.chat, `🪢 Ocurrió un error inesperado al procesar el comando: ${error.message}`, m);
    }
  }
};
