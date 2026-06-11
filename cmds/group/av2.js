import chalk from 'chalk'

const OWNER_NUMBER = '50231882808'

// Cache del spam
const spamCache = new Map()

export default {
  command: ['anv2'],
  category: 'group',
  description: 'Activa o desactiva el sistema antispam',
  
  async run(client, m, args) {
    try {
      if (!m.isGroup) {
        return m.reply('❌ Este comando solo funciona en grupos.')
      }

      if (!m.isAdmin) {
        return m.reply('❌ Solo admins pueden usar este comando.')
      }

      if (!m.isBotAdmin) {
        return m.reply('❌ Necesito admin para sacar gente.')
      }

      const chat = global.db.data.chats[m.chat] || {}

      const option = args[0]?.toLowerCase()

      if (!option) {
        return m.reply(`╭━〔 🩸 ANTISPAM 〕━⬣
┃
┃ Estado: ${chat.antispam ? '✅ ACTIVADO' : '❌ DESACTIVADO'}
┃
┃ Uso:
┃ .antispam on
┃ .antispam off
┃
┃ Funciones:
┃ • Detecta mensajes repetidos
┃ • Detecta stickers repetidos
┃ • Advertencia automática
┃ • Kick instantáneo
┃
╰━━━━━━━━━━━━⬣`)
      }

      if (option === 'on') {
        chat.antispam = true

        global.db.data.chats[m.chat] = chat

        return m.reply(`╭━〔 🩸 ANTISPAM 〕━⬣
┃
┃ ✅ Sistema activado
┃
┃ Ahora eliminaré:
┃ • Spam de texto
┃ • Spam de stickers
┃ • Flood masivo
┃
┃ ⚡ Protección máxima activa
┃
╰━━━━━━━━━━━━⬣`)
      }

      if (option === 'off') {
        chat.antispam = false

        global.db.data.chats[m.chat] = chat

        spamCache.delete(m.chat)

        return m.reply(`╭━〔 🩸 ANTISPAM 〕━⬣
┃
┃ ❌ Sistema desactivado
┃
┃ El grupo quedó sin protección.
┃
╰━━━━━━━━━━━━⬣`)
      }

    } catch (err) {
      console.log(chalk.red(`[ ANTISPAM CMD ERROR ] → ${err}`))
    }
  }
}

// HANDLER AUTOMÁTICO
export async function antispamHandler(client, m) {
  try {
    if (!m.isGroup) return

    const chat = global.db.data.chats[m.chat]
    if (!chat?.antispam) return

    const sender = m.sender
    const botNumber = client.user.id.split(':')[0]
    const ownerJid = OWNER_NUMBER + '@s.whatsapp.net'

    // Inmunidades
    if (sender === ownerJid) return
    if (sender.includes(botNumber)) return
    if (m.isAdmin) return

    const now = Date.now()

    let msgText = ''

    // Detecta texto
    if (m.text) {
      msgText = m.text.trim()
    }

    // Detecta sticker
    if (m.message?.stickerMessage) {
      msgText = 'STICKER_SPAM'
    }

    if (!msgText) return

    // Cache grupo
    if (!spamCache.has(m.chat)) {
      spamCache.set(m.chat, new Map())
    }

    const groupCache = spamCache.get(m.chat)

    if (!groupCache.has(sender)) {
      groupCache.set(sender, {
        lastMsg: '',
        count: 0,
        warned: false,
        lastTime: 0
      })
    }

    const user = groupCache.get(sender)

    // Reset si cambia mensaje
    if (msgText !== user.lastMsg) {
      user.lastMsg = msgText
      user.count = 1
      user.lastTime = now
      return
    }

    // Detecta spam rápido
    if (now - user.lastTime <= 4000) {
      user.count++
      user.lastTime = now

      // 3 mensajes = acción
      if (user.count >= 3) {

        // Primera advertencia
        if (!user.warned) {
          user.warned = true
          user.count = 0

          await client.sendMessage(m.chat, {
            text: `⚠️ @${sender.split('@')[0]}

Spam detectado.

Deja de repetir mensajes o serás eliminado automáticamente.`,
            mentions: [sender],
            contextInfo: {
              forwardingScore: 999,
              isForwarded: true,
              forwardedNewsletterMessageInfo: {
                newsletterJid: '120363427643259597@newsletter',
                newsletterName: '『 𝙕𝙖𝙛𝙠𝙞𝙚𝙡 𝘾𝙝𝙖𝙣𝙣𝙚𝙡 』',
                serverMessageId: 1
              }
            }
          })

          return
        }

        // Segunda vez = KICK
        await client.sendMessage(m.chat, {
          text: `@${sender.split('@')[0]} eliminado automáticamente por spam.`,
          mentions: [sender],
          contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: '120363427643259597@newsletter',
              newsletterName: '『 𝙕𝙖𝙛𝙠𝙞𝙚𝙡 𝘾𝙝𝙖𝙣𝙣𝙚𝙡 』',
              serverMessageId: 1
            }
          }
        })

        await client.groupParticipantsUpdate(
          m.chat,
          [sender],
          'remove'
        )

        groupCache.delete(sender)
      }

    } else {
      // Reinicia si ya pasó tiempo
      user.count = 1
      user.lastTime = now
    }

  } catch (err) {
    console.log(chalk.red(`[ ANTISPAM ERROR ] → ${err}`))
  }
}
