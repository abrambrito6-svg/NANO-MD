const allowedDomains = [
  'youtube.com',
  'youtu.be',
  'tiktok.com',
  'instagram.com',
  'spotify.com'
]

function containsLink(text = '') {
  return /(https?:\/\/|www\.)/gi.test(text)
}

function isAllowed(text = '') {
  return allowedDomains.some(d => text.includes(d))
}

export const all = async function (m) {
  if (!m.isGroup) return

  const chat = global.db.data.chats[m.chat]
  if (!chat?.antilink) return

  const text = m.text || m.body || ''
  if (!text) return

  if (!containsLink(text)) return
  if (isAllowed(text)) return

  const group = await this.groupMetadata(m.chat).catch(() => null)
  if (!group) return

  const participant = group.participants.find(p =>
    p.id === m.sender || p.jid === m.sender
  )

  if (!participant) return

  const isAdmin = participant.admin === 'admin' || participant.admin === 'superadmin'
  if (isAdmin) return

  await this.sendMessage(m.chat, {
    text: `🚫 *@${m.sender.split('@')[0]}* envió un link no permitido.`,
    mentions: [m.sender]
  })

  await this.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
}

export default {
  command: ['antilinks'],
  category: 'grupo',
  isAdmin: true,
  botAdmin: true,

  run: async (client, m, args, usedPrefix) => {
    const chat = global.db.data.chats[m.chat]

    if (!('antilink' in chat)) chat.antilink = false

    const arg = args[0]?.toLowerCase()

    if (!arg) {
      return m.reply(
`🔗 *ANTI-LINK*

Estado: ${chat.antilink ? '✅ Activado' : '❌ Desactivado'}

• ${usedPrefix}antilink on
• ${usedPrefix}antilink off

Links permitidos:
- YouTube
- TikTok
- Instagram
- Spotify`
      )
    }

    if (arg === 'on') {
      chat.antilink = true
      return m.reply('✅ Anti-Link activado.')
    }

    if (arg === 'off') {
      chat.antilink = false
      return m.reply('❌ Anti-Link desactivado.')
    }
  }
}
