import fetch from 'node-fetch'

export default {
  command: ['hentaisearcht', 'hsearcht'],
  category: 'nsfw',
  description: 'Buscar enlaces en Rule34.',
  run: async (client, m, args, usedPrefix, command) => {
    try {
      if (!global.db.data.chats[m.chat]?.nsfw) 
        return m.reply(`ꕥ El contenido *NSFW* está desactivado en este grupo.\n\nUn *administrador* puede activarlo con:\n» *${usedPrefix}nsfw on*`)
      
      if (!args[0]) 
        return client.reply(m.chat, `《✧》 Debes especificar tags para buscar\n> Ejemplo » *${usedPrefix + command} neko*`, m)      

      await m.react('🕒')
      const tag = args.join('_')
      let links = []
      const url = `https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&json=1&tags=${tag}&limit=20&api_key=a4e807dd6d4c9e55768772996946e4074030ec02c49049d291e5edb8808a97b004190660b4b36c3d21699144c823ad93491d066e73682a632a38f9b6c3cf951b&user_id=5753302`
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' } })
      const type = res.headers.get('content-type') || ''
      
      if (res.ok && type.includes('json')) {
        const json = await res.json()
        const data = Array.isArray(json) ? json : json?.post || json?.data || []
        links = data.map(i => i?.file_url || i?.sample_url || i?.preview_url).filter(u => typeof u === 'string')
      }

      if (!links.length) 
        return client.reply(m.chat, `《✧》 No se encontraron resultados para ${tag}`, m)

      // Tomamos hasta 10 enlaces
      const textLinks = links.slice(0, 10).map((u, i) => `🔗 Resultado ${i + 1}: ${u}`).join('\n')

      await client.sendMessage(m.chat, { text: `ꕥ Enlaces encontrados para » ${tag}\n\n${textLinks}` }, { quoted: m })
      await m.react('✔️')
    } catch (e) {
      await m.react('✖️')
      await m.reply(`> Error al ejecutar *${usedPrefix + command}*.\n> [${e.message}]`)
    }
  }
}
