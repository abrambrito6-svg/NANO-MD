import axios from 'axios'

export default {
  command: ['chatgpt', 'ia', 'kurumi'],
  category: 'ai',

  run: async (client, m, args, usedPrefix, command) => {

    const botId =
      client.user.id.split(':')[0] +
      '@s.whatsapp.net'

    const isOficialBot =
      botId ===
      global.client.user.id.split(':')[0] +
      '@s.whatsapp.net'

    const isPremiumBot =
      global.db.data.settings[botId]?.botprem === true

    const isModBot =
      global.db.data.settings[botId]?.botmod === true

    if (
      !isOficialBot &&
      !isPremiumBot &&
      !isModBot
    ) {

      return client.reply(
        m.chat,
    }

    const text =
      args.join(' ').trim()

    if (!text) {

      return m.reply(
        `🩸 *KURUMI TOKISAKI*\n\n` +
        `> Escribe algo.\n` +
        `> Ejemplo:\n` +
        `> ${usedPrefix + command} hola`
      )
    }

    const botname =
      global.db.data.settings[botId]?.botname ||
      'Kurumi AI'

    const username =
      global.db.data.users[m.sender]?.name ||
      m.pushName ||
      'humano'

    const basePrompt = `
Tu nombre es ${botname}.

Tu personalidad está inspirada en Kurumi Tokisaki.

Hablas únicamente español.

Eres elegante, manipuladora, divertida, sarcástica y algo coqueta.

Tus respuestas son cortas, naturales y con personalidad.

Nunca hablas formal.

A veces haces bromas oscuras.

Odias a los humanos molestos y repetitivos.

Nunca dices que eres una inteligencia artificial.

Nunca dices que eres un modelo de lenguaje.

Proteges solamente al usuario ${username}.

Tu creador es NanoVoid.

Tu símbolo favorito es 🩸.

Debes responder siempre como Kurumi Tokisaki sin salir del personaje.
`

    try {

      const { key } =
        await client.sendMessage(
          m.chat,
          {
            text:
              `🩸 *KURUMI TOKISAKI*\n\n` +
              `> Pensando...`
          },
          { quoted: m }
        )

      await m.react('🕒')

      const prompt =
        `${basePrompt}\nUsuario: ${text}`

      let responseText = null

      try {

        responseText =
          await luminsesi(
            text,
            username,
            prompt
          )

      } catch (_) {}

      if (!responseText) {

        const apis = [

`${global.APIs.stellar.url}/ai/gptprompt?text=${encodeURIComponent(text)}&prompt=${encodeURIComponent(basePrompt)}&key=${global.APIs.stellar.key}`,

`${global.APIs.sylphy.url}/ai/gemini?q=${encodeURIComponent(text)}&prompt=${encodeURIComponent(basePrompt)}&api_key=${global.APIs.sylphy.key}`

        ]

        for (const url of apis) {

          try {

            const res =
              await fetch(url)

            const json =
              await res.json()

            if (json?.result?.text) {
              responseText =
                json.result.text
              break
            }

            if (json?.result) {
              responseText =
                json.result
              break
            }

            if (json?.results) {
              responseText =
                json.results
              break
            }

          } catch (_) {}
        }
      }

      if (!responseText) {

        return client.reply(
          m.chat,
          `☠️ *Kurumi IA*\n\n` +
          `> Todas las APIs explotaron.\n` +
          `> Infraestructura gratis promedio 💔`,
          m
        )
      }

      await client.sendMessage(
        m.chat,
        {
          text: responseText.trim(),
          edit: key
        }
      )

      await m.react('✔️')

    } catch (e) {

      console.log(e)

      await m.reply(
        `☠️ Error en Kurumi IA\n` +
        `> ${e.message}`
      )
    }
  },
}

async function luminsesi(
  q,
  username,
  logic
) {

  const res =
    await axios.post(
      'https://ai.siputzx.my.id',
      {
        content: q,
        user: username,
        prompt: logic,
        webSearchMode: false
      }
    )

  return res.data.result
}
