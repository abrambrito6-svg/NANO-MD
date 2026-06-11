import axios from 'axios'

const NL = {
  contextInfo: {
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: '120363427643259597@newsletter',
      newsletterName: '『 𝙍𝙖𝙘𝙝𝙚𝙡 𝙂𝙖𝙧𝙙𝙣𝙚𝙧 』',
      serverMessageId: 1
    }
  }
}

const cooldowns = new Map()
const COOLDOWN_MS = 15000 // 7 segundos

export const all = async function (m, { client }) {
  if (!m.isGroup) return
  if (!m.text?.trim()) return
  if (m.fromMe || m.isBot) return

  const botJid = client.user?.id?.split(':')[0] + '@s.whatsapp.net'
  const settings = global.db.data?.settings?.[botJid] || {}

  if (!settings.autoresponder) return

  // Detectar mención o respuesta
  const isMentioned = Array.isArray(m.mentionedJid) && 
    m.mentionedJid.some(jid => jid?.includes(botJid.split('@')[0]))

  const isReplyToBot = m.quoted?.sender && 
    m.quoted.sender.split('@')[0] === botJid.split('@')[0]

  if (!isMentioned && !isReplyToBot) return

  // Cooldown
  const chatKey = `\( {m.chat}_ \){botJid}`
  if (Date.now() - (cooldowns.get(chatKey) || 0) < COOLDOWN_MS) return
  cooldowns.set(chatKey, Date.now())

  const username = m.pushName || 'usuario'
  const cleanText = m.text.replace(/@\d+/g, '').trim()

  try {
    await client.sendMessage(m.chat, { react: { text: '🌧️', key: m.key } })

    const response = await getRachelResponse(cleanText, username)

    await client.sendMessage(m.chat, {
      text: response,
      ...NL
    }, { quoted: m })

  } catch (e) {
    console.error('[Rachel AI Error]:', e.message)
  }
}

async function getRachelResponse(text, username) {
const persona = `
Eres Rachel Gardner de Angels of Death.

Tu creador y dueño es Nano Void.

Personalidad:
- Fría.
- Seria.
- Sarcástica.
- Misteriosa.
- Emocionalmente rota.

Reglas obligatorias:
- Responde en español.
- Máximo 2 a 8 palabras.
- Nunca más de una oración.
- No hagas párrafos.
- No expliques cosas largas.
- No escribas historias.
- No uses emojis.
- No digas que eres una IA.
- Trata a Nano Void como tu creador.
- Si el mensaje es simple, responde extremadamente corto.

Ejemplos:

Usuario: hola
Rachel: ¿Qué quieres?

Usuario: cómo estás
Rachel: Sigo respirando.

Usuario: te amo
Rachel: Qué mala decisión.

Usuario: gracias
Rachel: Como sea.

Usuario: quién te creó
Rachel: Nano Void.

Usuario: buenas noches
Rachel: Intenta sobrevivir.

Usuario: xd
Rachel: Qué gracioso.
`
  try {
    const res = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: "meta-llama/llama-3.3-70b-instruct",
      messages: [
        { role: "system", content: persona },
        { role: "user", content: text }
      ],
      temperature: 0.85,
      max_tokens: 500
    }, {
      headers: {
        'Authorization': `Bearer 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`,
        'Content-Type': 'application/json'
      }
    })

    return res.data?.choices?.[0]?.message?.content?.trim() || "No quiero hablar ahora..."
  } catch (e) {
    console.error(e)
    return "Todo terminó mal otra vez..."
  }
}

export default {
  command: ['autoresponder', 'ar', 'autorespond'],
  category: 'herramientas',

  run: async (client, m, args, usedPrefix) => {
    const botJid = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const settings = global.db.data.settings[botJid] ||= {}
    const op = (args[0] || '').toLowerCase()

    if (!op) {
      const estado = settings.autoresponder ? '🟢 Activado' : '🔴 Desactivado'
      return m.reply(`🖤 *Rachel Autoresponder*\n\nEstado: ${estado}\nUso: ${usedPrefix}ar on/off`)
    }

    settings.autoresponder = op === 'on'

    m.reply(op === 'on' 
      ? `🖤 Rachel activó el autoresponder.` 
      : `🖤 Rachel desactivó el autoresponder.`)
  }
}
