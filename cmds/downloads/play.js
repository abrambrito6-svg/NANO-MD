import yts from "yt-search"
import fetch from "node-fetch"

const isYouTubeUrl = (url) => /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i.test(url)

const extractVideoId = (url) => {
  const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})(?:[?&/]|\b)/) || url.match(/youtu\.be\/([0-9A-Za-z_-]{11})/)
  return match?.[1] || null
}

const formatViews = (views) => {
  const n = Number(views)
  if (!n || Number.isNaN(n)) return "No disponible"
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`
  return n.toString()
}

export default {
  command: ['play', 'musica', 'song', 'mp3', 'audio', 'ytmp3'],
  category: 'descargas',
  run: async (client, m, args, usedPrefix) => {
    const text = args.join(' ')
    if (!text) return m.reply(`🎶 Ingresa el nombre o enlace.\n\nEjemplo: *${usedPrefix + m.command} bad bunny*`)

    await m.react("🕘")

    try {
      let url = text.trim()
      let title = "Desconocido"
      let authorName = "Desconocido"
      let durationTimestamp = "Desconocida"
      let views = 0
      let thumbnail = ""

      const isUrl = /^https?:\/\/\S+/i.test(url)

      if (isUrl) {
        if (!isYouTubeUrl(url)) return m.reply("🚫 El enlace no es válido de YouTube.")
        const videoId = extractVideoId(url)
        if (!videoId) return m.reply("🚫 No pude extraer el ID del video.")

        const res = await yts({ videoId })
        if (!res) return m.reply("🚫 No pude obtener información del video.")

        title = res.title || title
        authorName = res.author?.name || authorName
        durationTimestamp = res.timestamp || durationTimestamp
        views = res.views || views
        thumbnail = res.thumbnail || thumbnail
        url = res.url || url
      } else {
        const res = await yts(url)
        if (!res?.videos?.length) return m.reply("🚫 No encontré nada.")

        const video = res.videos[0]
        title = video.title || title
        authorName = video.author?.name || authorName
        durationTimestamp = video.timestamp || durationTimestamp
        views = video.views || views
        url = video.url || url
        thumbnail = video.thumbnail || thumbnail
      }

      const vistas = formatViews(views)
      const caption = `╭━━━〔 |🜸 𝘐𝘕𝘍𝘖 ⸸ 〕━━━╮\n┃ |🜸 𝘛𝘪𝘵𝘶𝘭𝘰: ${title}\n┃ |🜸 𝘊𝘢𝘯𝘢𝘭: ${authorName}\n┃ |🜸 𝘝𝘪𝘴𝘵𝘢𝘴: ${vistas}\n┃ |🜸 𝘋𝘶𝘳𝘢𝘤𝘪𝘰𝘯: ${durationTimestamp}\n┃\n┃ |🜸 𝘋𝘦𝘴𝘤𝘢𝘳𝘨𝘢𝘯𝘥𝘰...\n╰━━━━━━━━━━━━━━━━━━━━╯`

      if (thumbnail) {
        await client.sendMessage(m.chat, { image: { url: thumbnail }, caption }, { quoted: m })
      }

      // API DE GOHAN
      const apiUrl = `https://api-gohan-v1.onrender.com/download/ytaudio?url=${encodeURIComponent(url)}`
      const r = await fetch(apiUrl)

      if (!r.ok) throw new Error(`Error HTTP ${r.status}`)

      const data = await r.json()
      if (!data?.status ||!data?.result?.download_url) throw new Error("No se pudo obtener el audio")

      await client.sendMessage(
        m.chat,
        {
          audio: { url: data.result.download_url },
          mimetype: "audio/mpeg",
          fileName: `${title}.mp3`
        },
        { quoted: m }
      )

      await m.react("✅")
    } catch (e) {
      console.error(e)
      await m.reply("❌ Error: " + e.message)
      await m.react("⚠️")
    }
  }
}