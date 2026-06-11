import fetch from 'node-fetch'

export default {
  command: ['animeinfo', 'animeinf', 'ainfo'],
  category: 'anime',

  run: async (client, m, args, usedPrefix, command) => {
    const text = args.join(' ')

    if (!text) {
      return m.reply(`❄️ *Uso:* ${usedPrefix + command} [nombre del anime]\n\n*Ejemplo:*\n${usedPrefix + command} Bocchi the Rock\n${usedPrefix + command} Sword Art Online`)
    }

    try {
      await m.react('🔍')

      const data = await getAnimeInfo(text)

      if (!data) {
        await m.react('❌')
        return m.reply(`❌ No se encontró información para *${text}*`)
      }

      const banner = global.getBocchiBanner?.() || 'https://files.catbox.moe/2t7iyj.jpg'

      const score = data.score
        ? `${'⭐'.repeat(Math.round(data.score / 2))} ${data.score}/10`
        : 'N/A'

      const status = {
        'Finished Airing': '✅ Finalizado',
        'Currently Airing': '📡 En emisión',
        'Not yet aired': '⏳ Próximamente'
      }[data.status] || data.status || 'N/A'

      const caption = `┏━━━━━✦❘༻🎴༺❘✦━━━━━┓
┃ —͟͞ ♱ *ANIME INFO* ♱ —͟͞
┗━━━━━✦❘༻🎴༺❘✦━━━━━┛

╭─━━━⊱ *INFORMACIÓN* ⊰━━━─╮
│
│ 🎌 *Nombre:* ${data.title || 'N/A'}
│ 🈷️ *Japonés:* ${data.titleJapanese || 'N/A'}
│ 🎬 *Episodios:* ${data.episodes || 'N/A'}
│ 📡 *Estado:* ${status}
│ 🎭 *Géneros:* ${data.genres || 'N/A'}
│ 🏢 *Estudio:* ${data.studio || 'N/A'}
│ 📅 *Año:* ${data.year || 'N/A'}
│ ⭐ *Score:* ${score}
│ 🔢 *Tipo:* ${data.type || 'N/A'}
│ ⏱️ *Duración:* ${data.duration || 'N/A'}
│ 🏆 *Ranking:* ${data.rank ? '#' + data.rank : 'N/A'}
│ ❤️ *Popularidad:* ${data.popularity ? '#' + data.popularity : 'N/A'}
│
╰─━━━⊱✧༻♱༺✧⊰━━━─╯

╭─━━━⊱ *SINOPSIS* ⊰━━━─╮
│
${data.synopsis
  ? data.synopsis.length > 300
    ? data.synopsis.substring(0, 300) + '...'
    : data.synopsis
  : 'Sin sinopsis disponible'}
│
╰─━━━⊱✧༻♱༺✧⊰━━━─╯

▰▰▰▰▰
—͟͞ ♱ *MAL:* ${data.url || 'N/A'}
▰▰▰▰▰

> ❄️ *Kurumi Protocol* - NanoVoid 💜`

      const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
      const settings = global.db.data.settings?.[botId] || {}

      await client.sendMessage(m.chat, {
        image: { url: data.image || banner },
        caption,
        contextInfo: {
          externalAdReply: {
            title: data.title || 'Anime Info',
            body: `⭐ ${data.score || 'N/A'} | 🎬 ${data.episodes || '?'} eps`,
            mediaType: 1,
            thumbnailUrl: data.image || banner,
            sourceUrl: data.url || 'https://myanimelist.net',
            renderLargerThumbnail: false
          }
        }
      }, { quoted: m })

      await m.react('✅')

    } catch (e) {
      await m.react('❌')
      console.error('Error animeinfo:', e)
      await m.reply(`> Error en *${usedPrefix + command}*\n> [${e.message}]`)
    }
  }
}

async function getAnimeInfo(query) {
  const apis = [
    // Jikan API (MyAnimeList oficial)
    {
      endpoint: `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=1`,
      extractor: res => {
        const d = res.data?.[0]
        if (!d) return null
        return {
          title: d.title_english || d.title || null,
          titleJapanese: d.title_japanese || null,
          episodes: d.episodes || null,
          status: d.status || null,
          genres: d.genres?.map(g => g.name).join(', ') || null,
          studio: d.studios?.[0]?.name || null,
          year: d.year || d.aired?.prop?.from?.year || null,
          score: d.score || null,
          synopsis: d.synopsis?.replace(/\[Written by MAL Rewrite\]/g, '').trim() || null,
          image: d.images?.jpg?.large_image_url || d.images?.jpg?.image_url || null,
          type: d.type || null,
          duration: d.duration || null,
          rank: d.rank || null,
          popularity: d.popularity || null,
          url: d.url || null
        }
      }
    },
    // Jikan v4 búsqueda directa
    {
      endpoint: `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&sfw=true&limit=1`,
      extractor: res => {
        const d = res.data?.[0]
        if (!d) return null
        return {
          title: d.title_english || d.title || null,
          titleJapanese: d.title_japanese || null,
          episodes: d.episodes || null,
          status: d.status || null,
          genres: d.genres?.map(g => g.name).join(', ') || null,
          studio: d.studios?.[0]?.name || null,
          year: d.year || null,
          score: d.score || null,
          synopsis: d.synopsis?.replace(/\[Written by MAL Rewrite\]/g, '').trim() || null,
          image: d.images?.jpg?.large_image_url || null,
          type: d.type || null,
          duration: d.duration || null,
          rank: d.rank || null,
          popularity: d.popularity || null,
          url: d.url || null
        }
      }
    },
    // AniList GraphQL
    {
      endpoint: 'https://graphql.anilist.co',
      method: 'POST',
      body: JSON.stringify({
        query: `
          query($search: String) {
            Media(search: $search, type: ANIME) {
              title { romaji english native }
              episodes status genres
              studios(isMain: true) { nodes { name } }
              startDate { year }
              averageScore popularity rankings { rank type }
              description(asHtml: false)
              coverImage { extraLarge large }
              siteUrl duration
            }
          }
        `,
        variables: { search: query }
      }),
      extractor: res => {
        const d = res.data?.Media
        if (!d) return null
        return {
          title: d.title?.english || d.title?.romaji || null,
          titleJapanese: d.title?.native || null,
          episodes: d.episodes || null,
          status: {
            'FINISHED': 'Finished Airing',
            'RELEASING': 'Currently Airing',
            'NOT_YET_RELEASED': 'Not yet aired'
          }[d.status] || d.status || null,
          genres: d.genres?.join(', ') || null,
          studio: d.studios?.nodes?.[0]?.name || null,
          year: d.startDate?.year || null,
          score: d.averageScore ? (d.averageScore / 10).toFixed(1) : null,
          synopsis: d.description?.replace(/<[^>]*>/g, '').trim() || null,
          image: d.coverImage?.extraLarge || d.coverImage?.large || null,
          type: 'TV',
          duration: d.duration ? `${d.duration} min` : null,
          rank: d.rankings?.[0]?.rank || null,
          popularity: d.popularity || null,
          url: d.siteUrl || null
        }
      }
    }
  ]

  for (const api of apis) {
    try {
      const options = {
        method: api.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0'
        }
      }
      if (api.body) options.body = api.body

      const res = await fetch(api.endpoint, options).then(r => r.json())
      const result = api.extractor(res)
      if (result?.title) return result
    } catch {}
    await new Promise(r => setTimeout(r, 500))
  }

  return null
}
