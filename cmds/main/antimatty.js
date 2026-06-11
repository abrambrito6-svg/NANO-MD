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

// Número o nombre de Matty (puedes agregar más)
const MATTY_IDS = [
  '50558384318@s.whatsapp.net',   // Cambia si tiene otro número
  // Agrega más números si quieres
]

export const all = async function (m, { client }) {
  try {
    if (!m.isGroup || m.fromMe) return

    const chat = (global.db.data.chats ||= {})[m.chat] ||= {}
    if (!chat.antiMatty) return

    const sender = m.sender
    const isMatty = MATTY_IDS.includes(sender) || 
                   m.pushName?.toLowerCase().includes('matty') ||
                   m.pushName?.toLowerCase().includes('matt')

    if (!isMatty) return

    // Detectar spam de menciones
    const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || []
    const hasManyMentions = mentioned.length >= 3

    if (hasManyMentions || (m.text && m.text.toLowerCase().includes('@'))) {
      console.log(`[ANTI-MATTY] Detectado spam de Matty: ${sender}`)

      // Banear permanentemente
      await client.sendMessage(m.chat, {
        text: `🖤 *Rachel Gardner* ha decidido...\n\n` +
              `👺 @${sender.split('@')[0]} ya no es bienvenido aquí.\n` +
              `❏ Razón: Spam con menciones masivas.`,
        mentions: [sender],
        ...NL
      }, { quoted: m })

      // Banear
      await client.groupParticipantsUpdate(m.chat, [sender], 'remove')

      // Opcional: Mandar mensaje privado
      // client.sendMessage(sender, { text: "Ya no eres bienvenido en ese grupo." })
    }

  } catch (e) {
    console.error('[ANTI-MATTY ERROR]:', e)
  }
}

export default {
  command: ['antima', 'banma'],
  category: 'grupo',
  isAdmin: true,

  run: async (client, m, args) => {
    const chat = (global.db.data.chats ||= {})[m.chat] ||= {}
    const op = (args[0] || '').toLowerCase()

    if (op === 'on') {
      chat.antiMatty = true
      m.reply(`🖤 *Anti-Matty activado.*\n\nAhora Rachel lo observará...`)
    } else if (op === 'off') {
      chat.antiMatty = false
      m.reply(`🖤 Anti-Matty desactivado.`)
    } else {
      m.reply(`Estado: ${chat.anti ? '🟢 Activo' : '🔴 Desactivado'}\nUso: .antimatty on/off`)
    }
  }
}
