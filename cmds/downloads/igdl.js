import fetch from 'node-fetch'
import { getBuffer } from '../../core/message.js'

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

const isIgUrl = url => /instagram\.com\/(p|reel|tv|stories)\/[a-zA-Z0-9_-]+/.test(url)

async function downloadInstagram(url) {
  const apis = [
    {
      name: 'Siputzx',
      url: `${global.APIs.siputzx?.url}/api/d/instagram?url=${encodeURIComponent(url)}`,
      extract: r => {
        const d = r?.data
        if (!d) return null
        const items = Array.isArray(d) ? d : [d]
        return items.map(i => ({ url: i?.url || i?.video_url || i?.image_url, type: i?.type || (i?.video_url ? 'video' : 'image') })).filter(i => i.url)
      }
    },
    {
      name: 'Stellar',
      url: `${global.APIs.stellar?.url}/dl/instagram?url=${encodeURIComponent(url)}&key=${global.APIs.stellar?.key}`,
      extract: r => {
        const d = r?.result
        if (!d) return null
        const items = Array.isArray(d) ? d : [d]
        return items.map(i => ({ url: i?.url || i?.download, type: i?.type || 'video' })).filter(i => i.url)
      }
    },
    {
      name: 'Vreden',
      url: `${global.APIs.vreden?.url}/api/v1/download/instagram?url=${encodeURIComponent(url)}`,
      extract: r => {
        const d = r?.result
        if (!d) return null
        return [{ url: d?.download?.url || d?.url, type: d?.type || 'video' }].filter(i => i.url)
      }
    },
    {
      name: 'Ootaizumi',
      url: `${global.APIs.ootaizumi?.url}/downloader/instagram?url=${encodeURIComponent(url)}`,
      extract: r => {
        const d = r?.result
        if (!d) return null
        const items = Array.isArray(d) ? d : [d]
        return items.map(i => ({ url: i?.url || i?.download, type: i?.type || 'video' })).filter(i => i.url)
      }
    },
    {
      name: 'Nekolabs',
      url: `${global.APIs.nekolabs?.url}/downloader/instagram?url=${encodeURIComponent(url)}`,
      extract: r => {
        const d = r?.result
        if (!d) return null
        return [{ url: d?.downloadUrl || d?.url, type: 'video' }].filter(i => i.url)
      }
    }
  ]

  for (const { name, url: apiUrl, extract } of apis) {
    try {
      const res = await fetch(apiUrl, { timeout: 15000 }).then(r => r.json())
      const items = extract(res)
      if (items?.length) return { items, api: name }
    } catch (_) {}
    await new Promise(r => setTimeout(r, 300))
  }
  return null
}

export default {
  command: ['igdl', 'ig', 'instagram', 'insta', 'instadl'],
  category: 'downloader',
  run: async (client, m, args, usedPrefix, command) => {
    const url = args.find(a => isIgUrl(a)) || args[0]

    if (!url || !isIgUrl(url)) {
      return client.sendMessage(m.chat, {
        text:
          `📸 *DESCARGAR INSTAGRAM*\n\n` +
          `> Descarga fotos, videos, reels y carruseles de Instagram.\n\n` +
          `ꕤ Uso: *${usedPrefix}igdl <url>*\n` +
          `ꕤ Ejemplo:\n` +
          `  *${usedPrefix}igdl https://www.instagram.com/reel/ABC123/*\n\n` +
          `> Funciona con: Posts, Reels, IGTV, Stories`,
        ...NL
      }, { quoted: m })
    }

    const dlMsg = await client.sendMessage(m.chat, {
      text: `📸 Descargando de Instagram...`,
      ...NL
    }, { quoted: m })

    try {
      const result = await downloadInstagram(url)
      if (!result?.items?.length) {
        await client.sendMessage(m.chat, {
          text: `《✧》 No pude descargar ese contenido de Instagram.\n> El post puede ser privado o el link puede ser inválido.`,
          edit: dlMsg.key,
          ...NL
        })
        return
      }

      await client.sendMessage(m.chat, {
        text: `📸 Descargando *${result.items.length}* elemento${result.items.length !== 1 ? 's' : ''}...`,
        edit: dlMsg.key,
        ...NL
      })

      for (let i = 0; i < result.items.length; i++) {
        const item = result.items[i]
        try {
          const buffer = await getBuffer(item.url)
          const isVideo = item.type === 'video' || item.url.includes('.mp4')
          if (isVideo) {
            await client.sendMessage(m.chat, {
              video: buffer,
              caption: i === 0 ? `📸 *Instagram* | Descargado por *${m.pushName}*` : '',
              ...NL
            }, { quoted: m })
          } else {
            await client.sendMessage(m.chat, {
              image: buffer,
              caption: i === 0 ? `📸 *Instagram* | Descargado por *${m.pushName}*` : '',
              ...NL
            }, { quoted: m })
          }
          await new Promise(r => setTimeout(r, 800))
        } catch (_) {}
      }
    } catch (e) {
      await m.reply(`> Error al descargar: *${e.message}*`)
    }
  }
}
