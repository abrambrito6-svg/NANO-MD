import fetch from 'node-fetch'

export default {
  command: ['wallpaper', 'wall', 'fondo'],
  category: 'downloads',

  run: async (client, m, args, usedPrefix, command) => {
    const text = args.join(' ')

    if (!text) {
      return m.reply(`❄️ *Uso:* ${usedPrefix + command} [tema]\n\n*Ejemplos:*\n${usedPrefix + command} anime\n${usedPrefix + command} naturaleza 4k\n${usedPrefix + command} Kurumi Tokisaki\n${usedPrefix + command} dark aesthetic`)
    }

    try {
      await m.react('🔍')

      const results = await getWallpapers(text)

      if (!results || results.length === 0) {
        await m.react('❌')
        return m.reply(`❌ No se encontraron wallpapers para *${text}*`)
      }

      const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
      const settings = global.db.data.settings?.[botId] || {}

      // Filtrar válidos
      const validResults = results.filter(r => r.image && typeof r.image === 'string').slice(0, 10)

      if (validResults.length === 0) {
        await m.react('❌')
        return m.reply('❌ No se encontraron imágenes válidas.')
      }

      // Header
      await client.sendMessage(m.chat, {
        text: `🖼️ *Wallpapers de:* ${text}\n❄️ *Kurumi Protocol - HD Walls* ❄️`,
        contextInfo: {
          externalAdReply: {
            title: `🖼️ ${text} - Wallpapers HD`,
            body: 'Kurumi Protocol 🩸',
            mediaType: 1,
            thumbnailUrl: validResults[0].image,
            sourceUrl: 'https://wallhaven.cc',
            renderLargerThumbnail: false
          }
        }
      }, { quoted: m })

      // Álbum deslizable
      const medias = validResults.map((r, i) => ({
        type: 'image',
        data: { url: r.image },
        caption: i === 0
          ? `🖼️ *Wallpaper - ${i + 1}*\nKurumi Protocol 🩸`
          : `🖼️ *Wallpaper - ${i + 1}*\nKurumi Protocol 🩸`
      }))

      await client.sendAlbumMessage(m.chat, medias, { quoted: m })
      await m.react('✅')

    } catch (e) {
      await m.react('❌')
      console.error('Error wallpaper:', e)
      await m.reply(`> Error en *${usedPrefix + command}*\n> [${e.message}]`)
    }
  }
}

async function getWallpapers(query) {
  const apis = [
    // Wallhaven
    {
      endpoint: `https://wallhaven.cc/api/v1/search?q=${encodeURIComponent(query)}&categories=111&purity=100&sorting=relevance&order=desc&atleast=1080x1920`,
      extractor: res => {
        if (!res.data?.length) return null
        return res.data.map(d => ({
          image: d.thumbs?.large || d.path || null,
          full: d.path || null,
          resolution: d.resolution || null
        }))
      }
    },
    // Wallhaven sin filtros
    {
      endpoint: `https://wallhaven.cc/api/v1/search?q=${encodeURIComponent(query)}&sorting=relevance`,
      extractor: res => {
        if (!res.data?.length) return null
        return res.data.map(d => ({
          image: d.thumbs?.large || d.path || null,
          full: d.path || null
        }))
      }
    },
    // Unsplash via API pública
    {
      endpoint: `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=10&orientation=portrait&client_id=_gEEFJMBSgST3BaEnOaNX_fGSBjsumVhUPUXNXBqzCA`,
      extractor: res => {
        if (!res.results?.length) return null
        return res.results.map(d => ({
          image: d.urls?.regular || d.urls?.full || null,
          full: d.urls?.full || null
        }))
      }
    },
    // Pinterest search (reutilizando APIs del bot)
    {
      endpoint: `${global.APIs.stellar?.url}/search/pinterest?query=${encodeURIComponent(query + ' wallpaper 4k')}&key=${global.APIs.stellar?.key}`,
      extractor: res => {
        if (!res.data?.length) return null
        return res.data.map(d => ({
          image: d.hd || d.image || null
        }))
      }
    },
    {
      endpoint: `${global.APIs.delirius?.url}/search/pinterestv2?text=${encodeURIComponent(query + ' wallpaper phone')}`,
      extractor: res => {
        if (!res.data?.length) return null
        return res.data.map(d => ({
          image: d.hd || d.image || null
        }))
      }
    },
    {
      endpoint: `${global.APIs.vreden?.url}/api/v1/search/pinterest?query=${encodeURIComponent(query + ' wallpaper 4k mobile')}`,
      extractor: res => {
        if (!res.result?.length && !res.response?.pins?.length) return null
        const data = res.result || res.response?.pins || []
        return data.map(d => ({
          image: d.image || d.media?.images?.orig?.url || null
        }))
      }
    }
  ]

  for (const { endpoint, extractor } of apis) {
    try {
      const res = await fetch(endpoint, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      }).then(r => r.json())

      const result = extractor(res)
      if (result) {
        const clean = result.filter(r => r.image && typeof r.image === 'string')
        if (clean.length > 0) return clean
      }
    } catch {}
    await new Promise(r => setTimeout(r, 300))
  }

  return []
}
