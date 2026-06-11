import fetch from 'node-fetch'

export default {
  command: ['pinterestimg', 'pinimg', 'pinphoto'],
  category: 'downloads',

  run: async (client, m, args, usedPrefix, command) => {
    const url = args[0]

    if (!url) {
      return m.reply(`🔮 *Uso:* ${usedPrefix + command} [enlace]\n\n*Ejemplo:*\n${usedPrefix + command} https://pin.it/2R3VxAXYM\n${usedPrefix + command} https://pinterest.com/pin/123456`)
    }

    if (!/pinterest|pin\.it/i.test(url)) {
      return m.reply('🧿 Ingresa un enlace válido de Pinterest.')
    }

    try {
      await m.react('🔮')

      const data = await getPinterestImage(url)

      if (!data || !data.url) {
        await m.react('❌')
        return m.reply('🦖 No se pudo obtener la imagen. Verifica el enlace.')
      }

      const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
      const settings = global.db.data.settings?.[botId] || {}

      const caption = `🪢 *PINTEREST IMG*

╭─━━━⊱ *INFO* ⊰━━━─╮
│ ${data.title ? `🔮 *Título:* ${data.title}\n│ ` : ''}${data.author ? `🚬 *Autor:* ${data.author}\n│ ` : ''}${data.description ? `🧿 *Desc:* ${data.description.substring(0, 80)}${data.description.length > 80 ? '...' : ''}\n│ ` : ''}🦖 *Enlace:* ${url}
╰─━━━⊱✧༻♱༺✧⊰━━━─╯

> ❄️ *Kurumi Protocol* - NanoVoid 💜`

      await client.sendMessage(m.chat, {
        image: { url: data.url },
        caption,
        contextInfo: {
          externalAdReply: {
            title: data.title || 'Pinterest Image',
            body: 'Kurumi Protocol 🩸',
            mediaType: 1,
            thumbnailUrl: data.url,
            sourceUrl: url,
            renderLargerThumbnail: false
          }
        }
      }, { quoted: m })

      await m.react('✅')

    } catch (e) {
      await m.react('❌')
      console.error('Error pinterestimg:', e)
      await m.reply(`> Error en *${usedPrefix + command}*\n> [${e.message}]`)
    }
  }
}

async function getPinterestImage(url) {
  const apis = [
    {
      endpoint: `${global.APIs.stellar?.url}/dl/pinterest?url=${encodeURIComponent(url)}&key=${global.APIs.stellar?.key}`,
      extractor: res => {
        if (!res.status || !res.data) return null
        const imgUrl = res.data.dl || res.data.thumbnail || null
        if (!imgUrl) return null
        return {
          url: imgUrl,
          title: res.data.title || null,
          author: res.data.author || null,
          description: res.data.description || null
        }
      }
    },
    {
      endpoint: `${global.APIs.vreden?.url}/api/v1/download/pinterest?url=${encodeURIComponent(url)}`,
      extractor: res => {
        if (!res.status || !res.result) return null
        const media = res.result.media_urls?.find(m => m.type === 'image' || m.type === 'jpg') || res.result.media_urls?.[0]
        if (!media?.url) return null
        return {
          url: media.url,
          title: res.result.title || null,
          author: res.result.uploader?.full_name || null,
          description: res.result.description || null
        }
      }
    },
    {
      endpoint: `${global.APIs.delirius?.url}/download/pinterestdl?url=${encodeURIComponent(url)}`,
      extractor: res => {
        if (!res.status || !res.data) return null
        const imgUrl = res.data.download?.url || res.data.thumbnail || null
        if (!imgUrl) return null
        return {
          url: imgUrl,
          title: res.data.title || null,
          author: res.data.author_name || null,
          description: res.data.description || null
        }
      }
    },
    {
      endpoint: `${global.APIs.nekolabs?.url}/downloader/pinterest?url=${encodeURIComponent(url)}`,
      extractor: res => {
        if (!res.success || !res.result) return null
        const media = res.result.medias?.find(m => m.extension === 'jpg' || m.extension === 'png') || res.result.medias?.[0]
        if (!media?.url) return null
        return {
          url: media.url,
          title: res.result.title || null,
          author: null,
          description: null
        }
      }
    },
    {
      endpoint: `${global.APIs.ootaizumi?.url}/downloader/pinterest?url=${encodeURIComponent(url)}`,
      extractor: res => {
        if (!res.status || !res.result) return null
        const imgUrl = res.result.download || res.result.thumb || null
        if (!imgUrl || imgUrl.includes('.mp4')) return null
        return {
          url: imgUrl,
          title: res.result.title || null,
          author: res.result.author?.name || null,
          description: null
        }
      }
    }
  ]

  for (const { endpoint, extractor } of apis) {
    try {
      const res = await fetch(endpoint).then(r => r.json())
      const result = extractor(res)
      if (result?.url) return result
    } catch {}
    await new Promise(r => setTimeout(r, 400))
  }

  return null
}
