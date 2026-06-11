import fetch from 'node-fetch'
import { getBuffer } from '../../core/message.js'

async function searchSpotify(query) {
  const apis = [
    {
      url: `${global.APIs.siputzx.url}/api/s/spotify?q=${encodeURIComponent(query)}`,
      extract: r => Array.isArray(r?.data) ? r.data[0] : null
    },
    {
      url: `${global.APIs.stellar.url}/search/spotify?q=${encodeURIComponent(query)}&key=${global.APIs.stellar.key}`,
      extract: r => r?.result?.[0] || null
    }
  ]
  for (const { url, extract } of apis) {
    try {
      const res = await fetch(url, { timeout: 10000 }).then(r => r.json())
      const data = extract(res)
      if (data) return data
    } catch (_) {}
  }
  return null
}

async function downloadSpotify(spotifyUrl) {
  const apis = [
    {
      url: `${global.APIs.siputzx.url}/api/d/spotify?url=${encodeURIComponent(spotifyUrl)}`,
      extract: r => r?.data?.url || r?.data?.download || null
    },
    {
      url: `${global.APIs.stellar.url}/dl/spotify?url=${encodeURIComponent(spotifyUrl)}&key=${global.APIs.stellar.key}`,
      extract: r => r?.result?.download || r?.result?.url || null
    },
    {
      url: `${global.APIs.vreden.url}/api/v1/download/spotify?url=${encodeURIComponent(spotifyUrl)}`,
      extract: r => r?.result?.download?.url || r?.result?.url || null
    },
    {
      url: `${global.APIs.ootaizumi.url}/downloader/spotify?url=${encodeURIComponent(spotifyUrl)}`,
      extract: r => r?.result?.download || null
    }
  ]
  for (const { url, extract } of apis) {
    try {
      const res = await fetch(url, { timeout: 15000 }).then(r => r.json())
      const link = extract(res)
      if (link) return link
    } catch (_) {}
  }
  return null
}

export default {
  command: ['spotify', 'spty', 'spoty'],
  category: 'downloader',
  run: async (client, m, args, usedPrefix, command) => {
    const query = args.join(' ').trim()
    if (!query) {
      return m.reply(
        `《✧》 Escribe el nombre de la canción que quieres descargar.\n` +
        `> Ejemplo: *${usedPrefix}spotify Bad Bunny Tití Me Preguntó*`
      )
    }

    const searching = await client.sendMessage(m.chat, {
      text: `🎵 Buscando *${query}* en Spotify...`
    }, { quoted: m })

    try {
      const track = await searchSpotify(query)
      if (!track) {
        await client.sendMessage(m.chat, { text: '《✧》 No encontré resultados para esa búsqueda en Spotify.', edit: searching.key })
        return
      }

      const title = track.title || track.name || 'Desconocido'
      const artist = track.artists || track.artist || track.author || 'Desconocido'
      const duration = track.duration || track.durasi || ''
      const spotifyUrl = track.url || track.link || track.spotifyUrl || ''
      const thumb = track.thumbnail || track.image || track.cover || ''

      if (!spotifyUrl) {
        await client.sendMessage(m.chat, { text: '《✧》 No se pudo obtener el enlace de Spotify para esa canción.', edit: searching.key })
        return
      }

      await client.sendMessage(m.chat, {
        text: `🎵 Descargando › *${title}*\n> ❖ Artista › *${artist}*\n> ⴵ Duración › *${duration}*`,
        edit: searching.key
      })

      const downloadUrl = await downloadSpotify(spotifyUrl)
      if (!downloadUrl) {
        await client.sendMessage(m.chat, {
          text: `《✧》 No se pudo descargar *${title}*. Intenta más tarde.`,
          edit: searching.key
        })
        return
      }

      let thumbBuffer = null
      if (thumb) {
        try { thumbBuffer = await getBuffer(thumb) } catch (_) {}
      }

      const audioBuffer = await getBuffer(downloadUrl)
      if (!audioBuffer) {
        return m.reply('《✧》 Error al obtener el archivo de audio.')
      }

      if (thumbBuffer) {
        await client.sendMessage(m.chat, {
          image: thumbBuffer,
          caption: `🎵 *${title}*\n> ❖ Artista › *${artist}*\n> ⴵ Duración › *${duration}*`
        }, { quoted: m })
      }

      await client.sendMessage(m.chat, {
        audio: audioBuffer,
        fileName: `${title} - ${artist}.mp3`,
        mimetype: 'audio/mpeg'
      }, { quoted: m })

    } catch (e) {
      await m.reply(
        `> An unexpected error occurred while executing command *${usedPrefix + command}*.\n` +
        `> [Error: *${e.message}*]`
      )
    }
  }
}
