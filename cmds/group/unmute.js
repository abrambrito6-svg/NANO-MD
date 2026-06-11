// REEMPLAZA cmds/group/unmute.js — Corregido para Baileys v7.0.0-rc13

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

export default {
  command: ['unmute', 'desmute', 'desmutear', 'desilenciar'],
  category: 'grupo',
  isAdmin: true,
  run: async (client, m, args, usedPrefix, command) => {
    const chat = global.db.data.chats[m.chat]
    if (!Array.isArray(chat.mutedUsers)) chat.mutedUsers = []

    const target = m.mentionedJid?.[0] || m.quoted?.sender
    if (!target) {
      return m.reply(
        ` Menciona o responde al usuario que quieres *desmutear*.\n` +
        `> Ej: *${usedPrefix}unmute @usuario*`
      )
    }

    const targetNum = target.replace(/:\d+/, '').split('@')[0]
    const idx = chat.mutedUsers.findIndex(j => j.replace(/:\d+/, '').split('@')[0] === targetNum)
    if (idx === -1) {
      return client.sendMessage(m.chat, {
        text: `《✧》 @${targetNum} *no está silenciado*.`,
        mentions: [target],
        ...NL
      }, { quoted: m })
    }

    chat.mutedUsers.splice(idx, 1)
    await client.sendMessage(m.chat, {
      text: ` *@${targetNum} ya puede escribir* en el grupo nuevamente xd.`,
      mentions: [target],
      ...NL
    }, { quoted: m })
  }
}
