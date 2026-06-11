import fetch from 'node-fetch'

export default {
  command: ['spotify', 'sp', 'spoti'],
  category: 'downloads',

  run: async (client, m, args, usedPrefix, command) => {
    const text = args.join(' ')

    if (!text) {
      return m.reply(`❄️ *Uso:*\n\n▸ Buscar: *${usedPrefix + command}* [nombre canción]\n▸ Descargar: *${usedPrefix + command}* [url spotify]\n\n*Ejemplo:*\n${usedPrefix + command} Bad Bunny Tití Me Preguntó`)
    }

    const isSpotifyUrl = /spotify\.com\/(track|album|playlist)\//.test(text)

    try {
      await m.react('🎵')

      if (isSpotifyUrl) {
        // DESCARGAR POR URL
        await m.reply('⏳ Descargando de Spotify...')
        const data = await getSpotifyDownload(text)

        if (!data) {
          await m.react('❌')
          return m.reply('❌ No se pudo descargar. Verifica el enlace.')
        }

        const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
        const settings = global.db.data.settings?.[botId] || {}

        const caption = `┏━━━━━✦❘༻🎵༺❘✦━━━━━┓
┃ —͟͞ ♱ *SPOTIFY DOWNLOAD* ♱ —͟͞
┗━━━━━✦❘༻🎵༺❘✦━━━━━┛

╭─━━━⊱ *INFO* ⊰━━━─╮
│ ♱ *Título:* ${data.title || 'N/A'}
│ ♱ *Artista:* ${data.artist || 'N/A'}
│ ♱ *Álbum:* ${data.album || 'N/A'}
│ ♱ *Duración:* ${data.duration || 'N/A'}
│ ♱ *Año:* ${data.year || 'N/A'}
╰─━━━⊱✧༻♱༺✧⊰━━━─╯

> ❄️ *Kurumi Protocol* - NanoVoid 💜`

        const contextInfo = {
          externalAdReply: {
            title: data.title || 'Spotify',
            body: data.artist || 'Kurumi Protocol',
            mediaType: 1,
            thumbnailUrl: data.thumbnail || settings?.icon || '',
            sourceUrl: text,
            renderLargerThumbnail: false
          }
        }

        if (data.audio) {
          await client.sendMessage(m.chat, {
            audio: { url: data.audio },
            mimetype: 'audio/mpeg',
            fileName: `${data.title || 'spotify'}.mp3`,
            contextInfo
          }, { quoted: m })

          // Enviar info como imagen con thumbnail
          if (data.thumbnail) {
            await client.sendMessage(m.chat, {
              image: { url: data.thumbnail },
              caption,
              contextInfo
            }, { quoted: m })
          } else {
            await m.reply(caption)
          }
        } else {
          await m.reply(caption)
        }

        await m.react('✅')

      } else {
        // BUSCAR
        await m.reply('🔍 Buscando en Spotify...')
        const results = await getSpotifySearch(text)

        if (!results || results.length === 0) {
          await m.react('❌')
          return m.reply(`❌ No se encontraron resultados para *${text}*`)
        }

        const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
        const settings = global.db.data.settings?.[botId] || {}

        // Guardar resultados temporales
        if (!global.tempSpotifyData) global.tempSpotifyData = {}
        global.tempSpotifyData[m.sender] = {
          results: results.slice(0, 5),
          timestamp: Date.now()
        }

        let lista = `┏━━━━━✦❘༻🎵༺❘✦━━━━━┓
┃ —͟͞ ♱ *SPOTIFY SEARCH* ♱ —͟͞
┗━━━━━✦❘༻🎵༺❘✦━━━━━┛

╭─━━━⊱ *RESULTADOS* ⊰━━━─╮\n`

        results.slice(0, 5).forEach((r, i) => {
          lista += `│\n│ *${i + 1}.* ${r.title}\n│ 🎤 ${r.artist || 'Desconocido'}\n│ ⏱️ ${r.duration || 'N/A'}\n`
        })

        lista += `│\n╰─━━━⊱✧༻♱༺✧⊰━━━─╯\n\n*Responde con el número* (1-${Math.min(results.length, 5)})\n⏳ Tienes 60 segundos\n\n> ❄️ *Kurumi Protocol* - NanoVoid 💜`

        const firstResult = results[0]
        if (firstResult?.thumbnail) {
          await client.sendMessage(m.chat, {
            image: { url: firstResult.thumbnail },
            caption: lista,
            contextInfo: {
              externalAdReply: {
                title: `🎵 Resultados: ${text}`,
                body: 'Kurumi Protocol 🩸',
                mediaType: 1,
                thumbnailUrl: firstResult.thumbnail,
                sourceUrl: 'https://spotify.com',
                renderLargerThumbnail: false
              }
            }
          }, { quoted: m })
        } else {
          await m.reply(lista)
        }

        await m.react('✅')
      }

    } catch (e) {
      await m.react('❌')
      console.error('Error spotify:', e)
      await m.reply(`> An unexpected error occurred while executing command *${usedPrefix + command}*.\n> [Error: *${e.message}*]`)
    }
  }
}

async function getSpotifyDownload(url) {
  const apis = [
    {
      endpoint: `${global.APIs.stellar?.url}/dl/spotify?url=${encodeURIComponent(url)}&key=${global.APIs.stellar?.key}`,
      extractor: res => {
        if (!res.status || !res.data) return null
        return {
          title: res.data.title || null,
          artist: res.data.artist || null,
          album: res.data.album || null,
          duration: res.data.duration || null,
          year: res.data.year || null,
          thumbnail: res.data.thumbnail || null,
          audio: res.data.dl || res.data.audio || null
        }
      }
    },
    {
      endpoint: `${global.APIs.vreden?.url}/api/v1/download/spotify?url=${encodeURIComponent(url)}`,
      extractor: res => {
        if (!res.status || !res.result) return null
        return {
          title: res.result.title || null,
          artist: res.result.artist || res.result.artists?.[0]?.name || null,
          album: res.result.album || null,
          duration: res.result.duration || null,
          year: res.result.release_date?.split('-')[0] || null,
          thumbnail: res.result.thumbnail || res.result.cover || null,
          audio: res.result.download_url || res.result.audio || null
        }
      }
    },
    {
      endpoint: `${global.APIs.delirius?.url}/download/spotify?url=${encodeURIComponent(url)}`,
      extractor: res => {
        if (!res.status || !res.data) return null
        return {
          title: res.data.title || null,
          artist: res.data.artist || null,
          album: res.data.album || null,
          duration: res.data.duration || null,
          year: res.data.year || null,
          thumbnail: res.data.thumbnail || null,
          audio: res.data.download || res.data.audio || null
        }
      }
    },
    {
      endpoint: `${global.APIs.nekolabs?.url}/downloader/spotify?url=${encodeURIComponent(url)}`,
      extractor: res => {
        if (!res.success || !res.result) return null
        return {
          title: res.result.title || null,
          artist: res.result.artist || null,
          album: res.result.album || null,
          duration: res.result.duration || null,
          thumbnail: res.result.thumbnail || null,
          audio: res.result.download || null
        }
      }
    }
  ]

  for (const { endpoint, extractor } of apis) {
    try {
      const res = await fetch(endpoint).then(r => r.json())
      const result = extractor(res)
      if (result?.audio) return result
    } catch {}
    await new Promise(r => setTimeout(r, 500))
  }
  return null
}

async function getSpotifySearch(query) {
  const apis = [
    {
      endpoint: `${global.APIs.stellar?.url}/search/spotify?query=${encodeURIComponent(query)}&key=${global.APIs.stellar?.key}`,
      extractor: res => {
        if (!res.status || !res.data?.length) return null
        return res.data.map(d => ({
          title: d.title || d.name || null,
          artist: d.artist || d.artists?.[0]?.name || null,
          duration: d.duration || null,
          thumbnail: d.thumbnail || d.image || null,
          url: d.url || d.link || null
        }))
      }
    },
    {
      endpoint: `${global.APIs.vreden?.url}/api/v1/search/spotify?query=${encodeURIComponent(query)}`,
      extractor: res => {
        if (!res.status || !res.result?.length) return null
        return res.result.map(d => ({
          title: d.title || d.name || null,
          artist: d.artist || d.artists?.[0]?.name || null,
          duration: d.duration || null,
          thumbnail: d.thumbnail || d.cover || null,
          url: d.url || d.link || null
        }))
      }
    },
    {
      endpoint: `${global.APIs.delirius?.url}/search/spotify?text=${encodeURIComponent(query)}`,
      extractor: res => {
        if (!res.status || !res.data?.length) return null
        return res.data.map(d => ({
          title: d.title || d.name || null,
          artist: d.artist || null,
          duration: d.duration || null,
          thumbnail: d.thumbnail || d.image || null,
          url: d.url || d.link || null
        }))
      }
    }
  ]

  for (const { endpoint, extractor } of apis) {
    try {
      const res = await fetch(endpoint).then(r => r.json())
      const result = extractor(res)
      if (result?.length) return result
    } catch {}
  }
  return []
}
