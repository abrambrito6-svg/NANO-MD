import axios from 'axios'

export default {
  command: ['bot'],
  category: 'grupo',
  isAdmin: true,
  run: async (client, m, args) => {
    const chat = global.db.data.chats[m.chat]
    const estado = chat.isBanned ?? false
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const nameBot = global.db.data.settings[botId]?.namebot || 'Bot'

    // Configuración del Banner Mini Shadow
    const bannerUrl = 'https://i.ibb.co/9kS2htSP/IMG-20260706-WA0296.jpg'
    const { data } = await axios.get(bannerUrl, { responseType: 'arraybuffer' })
    const thumb = Buffer.from(data)
    const sourceUrl = 'https://github.com/abrambrito6-svg/the-nano-BOT'

    // Función interna para despachar con relayMessage + shadow preview + newsletter
    const enviarConBanner = async (textoFormateado) => {
      await client.relayMessage(m.chat, {
        extendedTextMessage: {
          text: `${sourceUrl}\n\n${textoFormateado}`,
          matchedText: sourceUrl,
          canonicalUrl: sourceUrl,
          title: `☾『 ${nameBot} 』`,
          description: 'Bot Status Settings ⚙️',
          previewType: 'shadow',
          jpegThumbnail: thumb,
          contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: '120363427643259597@newsletter',
              serverMessageId: 1,
              newsletterName: '『 𝙕𝙖𝙛𝙠𝙞𝙚𝙡 𝘾𝙝𝙖𝙣𝙣𝙚𝙡 』'
            }
          }
        }
      }, { quoted: m })
    }

    if (args[0] === 'off') {
      if (estado) return await enviarConBanner('𖥸 El *Bot* ya estaba *desactivado* en este grupo.')
      chat.isBanned = true
      return await enviarConBanner(`𖥸 Has *Desactivado* a *${nameBot}* en este grupo.`)
    }

    if (args[0] === 'on') {
      if (!estado) return await enviarConBanner(`𖥸 *${nameBot}* ya estaba *activado* en este grupo.`)
      chat.isBanned = false
      return await enviarConBanner(`𖥸 Has *Activado* a *${nameBot}* en este grupo.`)
    }

    // Respuesta por defecto cuando solo ponen el comando principal
    return await enviarConBanner(`*𖥸 Estado de ${nameBot} (⁠ ⁠◜⁠‿⁠◝⁠ ⁠)⁠♡*\n𖥸 *Actual ›* ${estado ? '✗ Desactivado' : '✓ Activado'}\n\n𖥸 Puedes cambiarlo con:\n> ● _Activar ›_ *bot on*\n> ● _Desactivar ›_ *bot off*`)
  },
}
