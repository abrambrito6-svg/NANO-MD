import fetch from 'node-fetch'

const cooldownWaifu = new Map()
const TIEMPO = 2 * 60 * 1000

export default {
  command: ['waifu'],
  category: 'anime',

  run: async (client, m) => {

    const user = m.sender

    const lastUse =
      cooldownWaifu.get(user) || 0

    const remaining =
      TIEMPO - (Date.now() - lastUse)

    if (remaining > 0) {

      const segundos =
        Math.ceil(remaining / 1000)

      return m.reply(
        `☠ Ya usaste *.waifu*, maldito adicto.\n\n` +
        `> Espera *${segundos} segundos* antes de volver a pedir waifus.`
      )
    }

    cooldownWaifu.set(user, Date.now())

    try {

      await m.react('🕒')

      const apis = [
        'https://api.waifu.pics/sfw/waifu',
        'https://nekos.best/api/v2/waifu'
      ]

      let image = null

      for (const api of apis) {

        try {

          const controller =
            new AbortController()

          const timeout =
            setTimeout(() => {
              controller.abort()
            }, 10000)

          const res = await fetch(api, {
            signal: controller.signal
          })

          clearTimeout(timeout)

          const json = await res.json()

          image =
            json?.url ||
            json?.results?.[0]?.url

          if (image) break

        } catch (_) {}
      }

      if (!image) {

        cooldownWaifu.delete(user)

        return m.reply(
          `☠️ *Kurumi AI*\n` +
          `> Las APIs explotaron otra vez.\n` +
          `> Qué sorpresa, internet haciendo basura como siempre.`
        )
      }

      await client.sendMessage(
        m.chat,
        {
          image: { url: image },
          caption:
            `🩸 *WAIFU RANDOM*\n\n` +
            `> Kurumi aprobó esta existencia.`
        },
        { quoted: m }
      )

      await m.react('✔️')

    } catch (e) {

      cooldownWaifu.delete(user)

      console.log(e)

      m.reply(
        `☠️ Error al ejecutar *.waifu*\n` +
        `> ${e.message}\n\n` +
        `> Ni las APIs quieren trabajar hoy.`
      )
    }
  }
}
