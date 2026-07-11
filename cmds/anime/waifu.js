import fetch from 'node-fetch'

export default {
  command: ['waifu', 'neko'],
  category: 'anime',
  description: 'Obtener una imagen de waifu aleatoria.',
  run: async (client, m, args, usedPrefix, command) => {
    try {
      await m.react('🕒')

      const chat = global.db.data.chats[m.chat]
      let mode = chat?.nsfw ? 'nsfw' : 'sfw'
      let url = `https://nekos.best/api/v2/${command}${mode === 'nsfw' ? '?type=nsfw' : ''}`

      let res = await fetch(url, {
        headers: { 'User-Agent': 'Kurumi-MD/1.0 (https://kurumi-tokisha-65e2e9.netlify.app/)' }
      })
      if (!res.ok) throw new Error(`La API respondió con estado ${res.status}`)

      let json = await res.json()
      if (!json.results?.[0]?.url) throw new Error('La API no devolvió ninguna imagen.')

      let imgRes = await fetch(json.results[0].url, {
        headers: { 'User-Agent': 'Kurumi-MD/1.0 (https://kurumi-tokisha-65e2e9.netlify.app/)' }
      })
      let img = Buffer.from(await imgRes.arrayBuffer())

     await client.sendMessage(m.chat, {
        image: img,
        caption: `𖥸 ¡Aquí tienes tu *${command.toUpperCase()}*!`,
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363427643259597@newsletter',
            newsletterName: '『 𝙕𝙖𝙛𝙠𝙞𝙚𝙡 𝘾𝙝𝙖𝙣𝙣𝙚𝙡 』',
            serverMessageId: 1
          }
        }
      }, { quoted: m })

      await m.react('✔️')
    } catch (e) {
      await m.react('✖️')
      await m.reply(`> Ocurrió un error inesperado al ejecutar el comando *${usedPrefix + command}*.\n> [Error: *${e.message}*]`)
    }
  },
}