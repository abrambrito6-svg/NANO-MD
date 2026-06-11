import fetch from 'node-fetch'

const NL = {
  contextInfo: {
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: '120363427643259597@newsletter',
      newsletterName: '『 𝙕𝙖𝙛𝙠𝙞𝙚𝙡 𝘾𝙝𝙖𝙣𝙣𝙚𝙡 』',
      serverMessageId: 1
    }
  }
}

const allowedCharacters = [
  'kurumi',
  'kurumi tokisaki',
  'miku',
  'hatsune miku',
  'teto',
  'kasane teto'
]

export default {
  command: ['pkurumi', 'animepin'],
  category: 'search',

  run: async (client, m, args, usedPrefix, command) => {
    try {
      const text = args.join(' ').toLowerCase()

      if (!text) {
        return m.reply(
          `🩸 *PKURUMI SEARCH*\n\n` +
          `Ejemplos:\n` +
          `> ${usedPrefix + command} kurumi\n` +
          `> ${usedPrefix + command} miku\n` +
          `> ${usedPrefix + command} teto`
        )
      }

      const valid = allowedCharacters.some(v => text.includes(v))

      if (!valid) {
        return m.reply(
          `❌ Solo permitido:\n\n` +
          `🩸 Kurumi Tokisaki\n` +
          `🎤 Hatsune Miku\n` +
          `🎶 Kasane Teto`
        )
      }

      const query = encodeURIComponent(text + ' anime')

      const apis = [
        `${global.APIs.stellar.url}/search/pinterest?query=${query}&key=${global.APIs.stellar.key}`,
        `${global.APIs.stellar.url}/search/pinterestv2?query=${query}&key=${global.APIs.stellar.key}`,
        `${global.APIs.delirius.url}/search/pinterest?text=${query}`,
        `${global.APIs.delirius.url}/search/pinterestv2?text=${query}`,
        `${global.APIs.vreden.url}/api/v1/search/pinterest?query=${query}`,
        `${global.APIs.siputzx.url}/api/s/pinterest?query=${query}&type=image`
      ]

      let results = []

      for (const api of apis) {
        try {
          const res = await fetch(api).then(r => r.json())

          if (res?.data?.length) {
            results = res.data.map(v => v.hd || v.image).filter(Boolean)
            break
          }

          if (res?.results?.length) {
            results = res.results.filter(Boolean)
            break
          }

          if (res?.result?.search_data?.length) {
            results = res.result.search_data.filter(Boolean)
            break
          }

        } catch {}
      }

      if (!results.length) {
        return m.reply('❌ No encontré imágenes.')
      }

      const shuffled = results.sort(() => Math.random() - 0.5)

      const medias = shuffled.slice(0, 8).map(img => ({
        type: 'image',
        data: { url: img },
        caption:
`ㅤ۟∩　ׅ　★　ׅ　🅟𝖪𝖴𝖱𝖴𝖬𝖨 🅢earch　ׄᰙ　

🩸 Búsqueda › ${text}

✦ Pinterest Anime Engine
✦ Powered by Kurumi Protocol`,
        ...NL
      }))

      await client.sendAlbumMessage(
        m.chat,
        medias,
        { quoted: m }
      )

    } catch (e) {
      console.log(e)

      m.reply(
        `❌ Error en PKURUMI\n\n` +
        `> ${e.message}`
      )
    }
  }
}
