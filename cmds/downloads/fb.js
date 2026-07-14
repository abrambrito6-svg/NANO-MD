 › 

import fetch from 'node-fetch'

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

export default {
  command: ['fb', 'facebook', 'fbdl'],
  category: 'downloader',
  run: async (client, m, args, usedPrefix, command) => {
    const text = args[0]

    // Validar que se haya ingresado un enlace
    if (!text) {
      return client.sendMessage(m.chat, {
        text: `✦ ─────────────── ✦\n  *DESCARGADOR FACEBOOK*\n✦ ─────────────── ✦\n\n  › Uso › *${usedPrefix + command} <enlace de Facebook>*\n  › Ejemplo › *${usedPrefix + command} https://www.facebook.com/...*\n\n✦ ─────────────── ✦`,
        ...NL
      }, { quoted: m })
    }

    // Validar que sea un enlace de Facebook básico
    if (!text.includes('facebook.com') && !text.includes('fb.watch') && !text.includes('fb.gg')) {
      return client.sendMessage(m.chat, {
        text: `✦ ─────────────── ✦\n  › Enlace inválido.\n  › Por favor ingresa un link de Facebook real.\n✦ ─────────────── ✦`,
        ...NL
      }, { quoted: m })
    }

    const downloadMsg = await client.sendMessage(m.chat, {
      text: `✦ ─────────────── ✦\n  › Descargando video de Facebook...\n✦ ─────────────── ✦`,
      ...NL
    }, { quoted: m })

    try {
      // 1. Llamada a la API de Gohan
      const apiUrl = `https://api-gohan-v1.onrender.com/download/facebook?url=${encodeURIComponent(text)}`
      const res = await fetch(apiUrl).then(r => r.json())

      if (!res?.status || !res?.result) {
        await client.sendMessage(m.chat, {
          text: `✦ ─────────────── ✦\n  › Error al procesar el enlace.\n  › Intenta con otro video.\n✦ ─────────────── ✦`,
          edit: downloadMsg.key,
          ...NL
        })
        return
      }

      const data = res.result
      // Priorizar calidad HD y usar SD como alternativa (fallback)
      const videoUrl = data.hd || data.sd

      if (!videoUrl) {
        await client.sendMessage(m.chat, {
          text: `✦ ─────────────── ✦\n  › No se encontró un enlace de descarga válido.\n✦ ─────────────── ✦`,
          edit: downloadMsg.key,
          ...NL
        })
        return
      }

      await client.sendMessage(m.chat, {
        text: `✦ ─────────────── ✦\n  › Enviando video...\n  › Título: ${data.title || 'Video de Facebook'}\n  › Duración: ${data.duration || 'Desconocida'}\n✦ ─────────────── ✦`,
        edit: downloadMsg.key,
        ...NL
      })

      // 2. Enviar el video directamente desde la URL de descarga
      await client.sendMessage(m.chat, {
        video: { url: videoUrl },
        caption: `✦ ─────────────── ✦\n  › *Título:* ${data.title || 'Video de Facebook'}\n✦ ─────────────── ✦`,
        ...NL
      }, { quoted: m })

      // Borrar o actualizar el mensaje de estado de descarga
      await client.sendMessage(m.chat, {
        text: `✦ ─────────────── ✦\n  › ¡Video enviado con éxito!\n✦ ─────────────── ✦`,
        edit: downloadMsg.key,
        ...NL
      })

    } catch (e) {
      console.error(e)
      await client.sendMessage(m.chat, {
        text: `✦ ─────────────── ✦\n  › Error en la descarga: ${e.message}\n✦ ─────────────── ✦`,
        edit: downloadMsg.key,
        ...NL
      })
    }
  }
}
