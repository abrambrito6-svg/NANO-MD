import fetch from 'node-fetch'

export default {
  command: ['r34', 'rule34', 'rule'],
  category: 'nsfw',

  run: async (client, m, args, usedPrefix, command) => {
    try {
      if (!global.db.data.chats[m.chat]?.nsfw) 
        return m.reply(`ꕥ El contenido *NSFW* está desactivado en este grupo.\nUsa *${usedPrefix}nsfw on*`)

      if (!args[0]) 
        return m.reply(`《✧》 Debes especificar tags\nEjemplo: *${usedPrefix + command} neko*`)

      await m.react('🕒')

      const tag = args.join(' ').replace(/\s+/g, '_')
      let mediaList = []

      const url = `https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&json=1&tags=${tag}&api_key=a4e807dd6d4c9e55768772996946e4074030ec02c49049d291e5edb8808a97b004190660b4b36c3d21699144c823ad93491d066e73682a632a38f9b6c3cf951b&user_id=5753302`

      const res = await fetch(url, { 
        headers: { 
          'User-Agent': 'Mozilla/5.0', 
          'Accept': 'application/json' 
        } 
      })

      if (res.ok) {
        const json = await res.json()
        const data = Array.isArray(json) ? json : json?.post || json?.data || []

        const valid = data
          .map(i => i?.file_url || i?.sample_url || i?.preview_url)
          .filter(u => typeof u === 'string' && /\.(jpe?g|png|gif)$/i.test(u))

        if (valid.length) {
          mediaList = [...new Set(valid)].sort(() => Math.random() - 0.5)
        }
      }

      if (!mediaList.length) 
        return m.reply(`《✧》 No se encontraron resultados para *${tag}*.\nPrueba con otro tag.`)

      // Carrusel con 5-8 imágenes
      const medias = mediaList.slice(0, 8).map((url, i) => ({
        type: 'image',
        data: { url: url },
        caption: `🖤 \( {tag} ( \){i+1}/${Math.min(8, mediaList.length)})`
      }))

      await client.sendAlbumMessage(m.chat, medias, {
        quoted: m,
        caption: `ꕥ Rule34 • \( {tag}\n \){medias.length} imágenes encontradas.`
      })

      await m.react('✔️')

    } catch (e) {
      console.error(e)
      await m.reply('《✧》 Error al buscar en Rule34.')
      await m.react('✖️')
    }
  }
}
