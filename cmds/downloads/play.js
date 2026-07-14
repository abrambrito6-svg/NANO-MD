import fetch from 'node-fetch'
import { getBuffer } from '../../core/message.js'

const NL = {
  contextInfo: {
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: '120363427643259597@newsletter',
      newsletterName: '『𝗦𝗵𝗶𝗿𝗼𝗸𝗼 𝗖𝗵𝗮𝗻𝗻𝗲λ』☽',
      serverMessageId: 1
    }
  }
}

// Función auxiliar para convertir formato de tiempo "MM:SS" o "HH:MM:SS" a segundos
function parseDuration(durationStr) {
  if (!durationStr) return 0
  const parts = durationStr.split(':').map(Number)
  if (parts.some(isNaN)) return 0
  if (parts.length === 2) {
    return (parts[0] * 60) + parts[1] // MM:SS
  } else if (parts.length === 3) {
    return (parts[0] * 3600) + (parts[1] * 60) + parts[2] // HH:MM:SS
  }
  return parts[0] || 0
}

export default {
  command: ['play', 'ytplay', 'musica'],
  category: 'downloader',
  run: async (client, m, args, usedPrefix, command) => {
    // Unimos los argumentos para obtener la búsqueda de forma correcta
    const text = args.join(' ')

    if (!text) {
      return client.sendMessage(m.chat, {
        text: `✦ ─────────────── ✦\n  *REPRODUCTOR YOUTUBE*\n✦ ─────────────── ✦\n\n  › Uso › *${usedPrefix + command} <nombre o enlace>*\n  › Ejemplo › *${usedPrefix + command} Volveré aguracha*\n\n✦ ─────────────── ✦`,
        ...NL
      }, { quoted: m })
    }

    const searchMsg = await client.sendMessage(m.chat, {
      text: `✦ ─────────────── ✦\n  › Buscando: "${text}"...\n✦ ─────────────── ✦`,
      ...NL
    }, { quoted: m })

    try {
      // 1. Búsqueda de video usando la API de búsqueda
      const searchUrl = `https://api-gohan-v1.onrender.com/search/youtube?q=${encodeURIComponent(text)}`
      const searchRes = await fetch(searchUrl).then(r => r.json())
      
      if (!searchRes?.status || !searchRes?.result?.length) {
        await client.sendMessage(m.chat, {
          text: `✦ ─────────────── ✦\n  › No se encontraron resultados.\n✦ ─────────────── ✦`,
          edit: searchMsg.key,
          ...NL
        })
        return
      }

      const video = searchRes.result[0] // Tomar el primer resultado
      const durationSeconds = parseDuration(video.duration)

      // 2. Control de duración: Máximo 400 segundos (6 minutos y 40 segundos)
      if (durationSeconds > 400) {
        await client.sendMessage(m.chat, {
          text: `✦ ─────────────── ✦\n  › Duración excedida.\n  › El video dura *${video.duration}* (Límite: 400 segundos).\n✦ ─────────────── ✦`,
          edit: searchMsg.key,
          ...NL
        })
        return
      }

      await client.sendMessage(m.chat, {
        text: `✦ ─────────────── ✦\n  › Obteniendo audio de:\n  › *${video.title}*\n  › Duración: ${video.duration}\n✦ ─────────────── ✦`,
        edit: searchMsg.key,
        ...NL
      })

      // 3. Descarga del audio usando la API de descarga
      const downloadUrl = `https://api-gohan-v1.onrender.com/download/ytaudio?url=${encodeURIComponent(video.url)}`
      const dlRes = await fetch(downloadUrl).then(r => r.json())

      // Verificamos si la descarga es exitosa y contiene el link
      const audioLink = dlRes?.result?.download_url || dlRes?.result?.url
      if (!audioLink) {
        await client.sendMessage(m.chat, {
          text: `✦ ─────────────── ✦\n  › No se pudo extraer el enlace de descarga.\n✦ ─────────────── ✦`,
          edit: searchMsg.key,
          ...NL
        })
        return
      }

      // 4. Envío del archivo de música
      const buffer = await getBuffer(audioLink)
      
      await client.sendMessage(m.chat, {
        audio: buffer,
        mimetype: 'audio/mp4',
        fileName: `${video.title}.mp3`,
        ...NL
      }, { quoted: m })

      // Actualizamos a completado
      await client.sendMessage(m.chat, {
        text: `✦ ─────────────── ✦\n  › ¡Disfruta tu música!\n✦ ─────────────── ✦`,
        edit: searchMsg.key,
        ...NL
      })

    } catch (e) {
      console.error(e)
      await client.sendMessage(m.chat, {
        text: `✦ ─────────────── ✦\n  › Error en la descarga: ${e.message}\n✦ ─────────────── ✦`,
        edit: searchMsg.key,
        ...NL
      })
    }
  }
}
