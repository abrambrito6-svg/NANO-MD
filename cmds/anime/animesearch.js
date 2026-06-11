import axios from 'axios'

export default {
  name: 'animesearch',
  alias: ['animebuscar', 'anime'],
  category: 'anime',
  desc: 'Busca información de un anime',

  async run({ client, m, text }) {

    if (!text) {
      return m.reply('🩸 Escribe el nombre de un anime\n\nEjemplo:\n.animesearch kimetsu no yaiba')
    }

    try {

      await m.react('🔎')

      const res = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(text)}&limit=1`)

      const anime = res.data.data[0]

      if (!anime) {
        return m.reply('💀 No encontré ese anime')
      }

      let caption = `
🩸 *ANIME SEARCH*

🎴 *Título:* ${anime.title}
📚 *Episodios:* ${anime.episodes || 'Desconocido'}
⭐ *Score:* ${anime.score || 'Sin score'}
📅 *Año:* ${anime.year || 'Desconocido'}
🔥 *Estado:* ${anime.status}
🎭 *Géneros:* ${anime.genres.map(v => v.name).join(', ')}

📝 *Sinopsis:*
${anime.synopsis || 'Sin descripción'}

🔗 ${anime.url}
`

      await client.sendMessage(
        m.chat,
        {
          image: {
            url: anime.images.jpg.large_image_url
          },
          caption,
          contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: '120363427643259597@newsletter',
              newsletterName: '『 𝙕𝙖𝙛𝙠𝙞𝙚𝙡 𝘾𝙝𝙖𝙣𝙣𝙚𝙡 』',
              serverMessageId: 1
            }
          }
        },
        { quoted: m }
      )

      await m.react('✔️')

    } catch (e) {

      console.log(e)

      m.reply('💀 Error buscando el anime')

    }
  }
}
