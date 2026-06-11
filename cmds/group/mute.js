// REEMPLAZA cmds/group/mute.js — Corregido para Baileys v7.0.0-rc13

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

// Eliminar mensaje compatible con Baileys v7
async function deleteMsg(client, m) {
  // Intentar con la key original primero (más confiable en v7)
  try {
    await client.sendMessage(m.chat, { delete: m.key })
    return true
  } catch (_) {}

  // Fallback: key construida manualmente con participant
  try {
    const participant = m.key?.participant || m.sender
    await client.sendMessage(m.chat, {
      delete: {
        remoteJid: m.chat,
        fromMe: false,
        id: m.key?.id || m.id,
        participant: participant
      }
    })
    return true
  } catch (_) {}

  return false
}

export const all = async function (m, { client }) {
  if (!m.isGroup) return
  if (m.fromMe || m.isBot) return

  const chat = global.db.data?.chats?.[m.chat]
  if (!Array.isArray(chat?.mutedUsers) || !chat.mutedUsers.length) return

  const botJid = this.user?.id?.replace(/:\d+/, '').split('@')[0] + '@s.whatsapp.net'
  const primaryBotId = chat.primaryBot
  const isPrimary = !primaryBotId || primaryBotId === botJid
  if (!isPrimary) return

  const senderNum = m.sender?.replace(/:\d+/, '').split('@')[0]
  const isMuted = chat.mutedUsers.some(j => {
    const jNum = String(j).replace(/:\d+/, '').split('@')[0]
    return jNum === senderNum
  })
  if (!isMuted) return

  await deleteMsg(this, m)
}

export default {
  command: ['mute', 'silenciar'],
  category: 'grupo',
  isAdmin: true,
  botAdmin: true,
  run: async (client, m, args, usedPrefix, command) => {
    const chat = global.db.data.chats[m.chat]
    if (!Array.isArray(chat.mutedUsers)) chat.mutedUsers = []

    const target = m.mentionedJid?.[0] || m.quoted?.sender
    if (!target) {
      return m.reply(
        `🔇 *MUTE*\n\n` +
        `> Menciona o responde al usuario que quieres silenciar.\n` +
        `> Sus mensajes serán eliminados automáticamente.\n\n` +
        `ꕤ *${usedPrefix}mute @usuario* — Silenciar\n` +
        `ꕤ *${usedPrefix}unmute @usuario* — Quitar silencio\n` +
        `ꕤ *${usedPrefix}mute list* — Ver lista de silenciados`
      )
    }

    if (args[0]?.toLowerCase() === 'list') {
      if (!chat.mutedUsers.length) return m.reply('《✧》 No hay usuarios silenciados.')
      const lista = chat.mutedUsers.map((j, i) => `  \`${i + 1}.\` @${j.split('@')[0]}`).join('\n')
      return client.sendMessage(m.chat, {
        text: `🔇 *Usuarios silenciados:*\n\n${lista}`,
        mentions: chat.mutedUsers,
        ...NL
      }, { quoted: m })
    }

    const targetNum = target.replace(/:\d+/, '').split('@')[0]
    const botNum = client.user.id.replace(/:\d+/, '').split('@')[0]
    if (targetNum === botNum) return m.reply('《✧》 No puedo silenciarme a mí mismo.')
    if (targetNum === m.sender.split('@')[0]) return m.reply('《✧》 No puedes silenciarte a ti mismo.')

    const alreadyMuted = chat.mutedUsers.some(j => j.replace(/:\d+/, '').split('@')[0] === targetNum)
    if (alreadyMuted) {
      return client.sendMessage(m.chat, {
        text: `《✧》 @${targetNum} ya está *silenciado*.`,
        mentions: [target],
        ...NL
      }, { quoted: m })
    }

    chat.mutedUsers.push(target)
    await client.sendMessage(m.chat, {
      text: `🔇 *@${targetNum} ha sido silenciado.*\n> Sus mensajes serán eliminados automáticamente.`,
      mentions: [target],
      ...NL
    }, { quoted: m })
  }
}
