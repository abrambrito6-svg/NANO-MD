export default {
  command: ['1', '2', '3', '4', '5'],
  category: 'downloads',

  run: async (client, m, args, usedPrefix, command) => {

    if (!global.tempSpotifyData?.[m.sender]) return

    const data = global.tempSpotifyData[m.sender]

    if (Date.now() - data.timestamp > 60000) {
      delete global.tempSpotifyData[m.sender]
      return m.reply('⏱️ Tiempo agotado. Vuelve a usar el comando.')
    }

    const index = parseInt(command) - 1
    const selected = data.results[index]

    if (!selected) return

    delete global.tempSpotifyData[m.sender]

    if (!selected.url) {
      return m.reply('❌ No se encontró enlace de descarga para esta canción.')
    }

    try {
      await m.react('⏳')
      await m.reply('🎵 Descargando canción...')

      const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
      const settings = global.db.data.settings?.[botId] || {}

      // Reusar getSpotifyDownload
      const downloadData = await getSpotifyDownloadFromUrl(selected.url)

      if (!downloadData?.audio) {
        await m.react('❌')
        return m.reply('❌ No se pudo descargar esta canción.')
      }

      const caption = `┏━━━━━✦❘༻🎵༺❘✦━━━━━┓
┃ —͟͞ ♱ *SPOTIFY* ♱ —͟͞
┗━━━━━✦❘༻🎵༺❘✦━━━━━┛

╭─━━━⊱ *DESCARGADO* ⊰━━━─╮
│ ♱ *Título:* ${downloadData.title || selected.title || 'N/A'}
│ ♱ *Artista:* ${downloadData.artist || selected.artist || 'N/A'}
│ ♱ *Álbum:* ${downloadData.album || 'N/A'}
│ ♱ *Duración:* ${downloadData.duration || selected.duration || 'N/A'}
╰─━━━⊱✧༻♱༺✧⊰━━━─╯

> ❄️ *Kurumi Protocol* - NanoVoid 💜`

      const contextInfo = {
        externalAdReply: {
          title: downloadData.title || selected.title || 'Spotify',
          body: downloadData.artist || selected.artist || 'Kurumi Protocol',
          mediaType: 1,
          thumbnailUrl: downloadData.thumbnail || selected.thumbnail || settings?.icon || '',
          sourceUrl: selected.url,
          renderLargerThumbnail: false
        }
      }

      await client.sendMessage(m.chat, {
        audio: { url: downloadData.audio },
        mimetype: 'audio/mpeg',
        fileName: `${downloadData.title || selected.title || 'spotify'}.mp3`,
        contextInfo
      }, { quoted: m })

      if (downloadData.thumbnail || selected.thumbnail) {
        await client.sendMessage(m.chat, {
          image: { url: downloadData.thumbnail || selected.thumbnail },
          caption,
          contextInfo
        }, { quoted: m })
      }

      await m.react('✅')

    } catch (e) {
      await m.react('❌')
      await m.reply(`❌ Error: ${e.message}`)
    }
  }
}

async function getSpotifyDownloadFromUrl(url) {
  const apis = [
    {
      endpoint: `${global.APIs.stellar?.url}/dl/spotify?url=${encodeURIComponent(url)}&key=${global.APIs.stellar?.key}`,
      extractor: res => {
        if (!res.status || !res.data) return null
        return { title: res.data.title, artist: res.data.artist, album: res.data.album, duration: res.data.duration, thumbnail: res.data.thumbnail, audio: res.data.dl || res.data.audio }
      }
    },
    {
      endpoint: `${global.APIs.vreden?.url}/api/v1/download/spotify?url=${encodeURIComponent(url)}`,
      extractor: res => {
        if (!res.status || !res.result) return null
        return { title: res.result.title, artist: res.result.artist || res.result.artists?.[0]?.name, album: res.result.album, duration: res.result.duration, thumbnail: res.result.thumbnail || res.result.cover, audio: res.result.download_url || res.result.audio }
      }
    },
    {
      endpoint: `${global.APIs.delirius?.url}/download/spotify?url=${encodeURIComponent(url)}`,
      extractor: res => {
        if (!res.status || !res.data) return null
        return { title: res.data.title, artist: res.data.artist, album: res.data.album, duration: res.data.duration, thumbnail: res.data.thumbnail, audio: res.data.download || res.data.audio }
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
