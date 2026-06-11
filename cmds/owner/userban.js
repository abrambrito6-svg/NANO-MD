export default {
  command: ['userban'],
  category: 'owner',
  isOwner: true,

  run: async (client, m, args) => {

    global.db.data.userBans ||= {}

    if (!args[0]) {
      return m.reply(
`╭━━━〔 🩸 𝙍𝙖𝙘𝙝𝙚𝙡 𝘽𝙖𝙣 𝙎𝙮𝙨𝙩𝙚𝙢 〕━━━╮
┃ ✘ Falta el número.
┃ ❏ Ejemplo:
┃ ➥ #userban +51994773621
╰━━━━━━━━━━━━━━━━━━━━━━━╯`
      )
    }

    let number = args[0].replace(/[^0-9]/g, '')

    if (!number) {
      return m.reply('☠️ Número inválido.')
    }

    let jid = number + '@s.whatsapp.net'

    global.db.data.userBans[jid] = {
      banned: true,
      reason: 'Rachel no quiere verte aquí.',
      date: Date.now()
    }

    await client.sendMessage(m.chat, {
      text:
`╭━━━〔 ☠️ 𝙍𝙖𝙘𝙝𝙚𝙡 𝙂𝙖𝙧𝙙𝙣𝙚𝙧 〕━━━╮
┃ 🩸 Usuario destruido.
┃ ❏ Objetivo:
┃ ➥ @${number}
┃
┃ ✎ Estado:
┃ ➥ BLOQUEADO DEL BOT
╰━━━━━━━━━━━━━━━━━━━━━━━╯

> _"No volveré a escucharte..."_ 🌧️`,
      mentions: [jid],

      contextInfo: {
        externalAdReply: {
          title: '🩸 Rachel Ban System',
          body: '🌧️ Usuario rechazado.',
          thumbnailUrl: 'https://files.catbox.moe/gj8kzx.jpg',
          sourceUrl: 'https://kurumi-tokisha-65e2e9.netlify.app/',
          mediaType: 1,
          renderLargerThumbnail: false,
          showAdAttribution: false
        }
      }

    }, { quoted: m })
  }
}
