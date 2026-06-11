import fetch from 'node-fetch'
let WAMessageStubType = (await import('@whiskeysockets/baileys')).default
import chalk from 'chalk'

export default async (client, m) => {
  client.ev.on('group-participants.update', async (anu) => {
    try {
      const metadata = await client.groupMetadata(anu.id).catch(() => null)
      const groupAdmins = metadata?.participants.filter(p => (p.admin === 'admin' || p.admin === 'superadmin')) || []
      const chat = global?.db?.data?.chats?.[anu.id]
      const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
      const primaryBotId = chat?.primaryBot
      const memberCount = metadata.participants.length      
      const isSelf = global.db.data.settings[botId]?.self ?? false
      if (isSelf) return
      for (const p of anu.participants) {
        const jid = p.phoneNumber
        const phone = p.phoneNumber?.split('@')[0] || jid.split('@')[0]
        const pp = await client.profilePictureUrl(jid, 'image').catch(_ => 'https://files.catbox.moe/mphp00.jpg')       
        const mensajes = { add: chat.sWelcome ? `\n┊➤ ${chat.sWelcome.replace(/{usuario}/g, `@${phone}`).replace(/{grupo}/g, `*${metadata.subject}*`).replace(/{desc}/g, metadata?.desc || '✿ Sin Desc ✿')}` : '', remove: chat.sGoodbye ? `\n┊➤ ${chat.sGoodbye.replace(/{usuario}/g, `@${phone}`).replace(/{grupo}/g, `*${metadata.subject}*`).replace(/{desc}/g, metadata?.desc || '✿ Sin Desc ✿')}` : '', leave: chat.sGoodbye ? `\n┊➤ ${chat.sGoodbye.replace(/{usuario}/g, `@${phone}`).replace(/{grupo}/g, `*${metadata.subject}*`).replace(/{desc}/g, metadata?.desc || '✿ Sin Desc ✿')}` : '' }
        const fakeContext = {
          contextInfo: {
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: global.db.data.settings[botId].id,
              serverMessageId: '0',
              newsletterName: global.db.data.settings[botId].nameid
            },
            externalAdReply: {
              title: global.db.data.settings[botId].namebot,
              body: dev,
              mediaUrl: null,
              description: null,
              previewType: 'PHOTO',
              thumbnailUrl: global.db.data.settings[botId].icon,
              sourceUrl: global.db.data.settings[client.user.id.split(':')[0] + "@s.whatsapp.net"].link,
              mediaType: 1,
              renderLargerThumbnail: false
            },
            mentionedJid: [jid]
          }
        }
        if (anu.action === 'add' && chat?.welcome && (!primaryBotId || primaryBotId === botId)) {
          const caption = `╭─❍「 🩸 𝙆𝙪𝙧𝙪𝙢𝙞 𝙏𝙤𝙠𝙞𝙨𝙖𝙠𝙞 」❍─╮
┊
┊  |🜸 *bienvenida al grupo pta*. |🜸
┊  ︶︶︶︶︶︶︶︶︶︶︶
┊
┊  |🜸 *Invitad@ ›* @${phone}
┊  |🜸 *Grupo ›* ${metadata.subject}
┊  |🜸 *Miembro N°* ${memberCount}
┊
┊  |🜸 usa *menu* para ver los comandos disponibles. |🜸
┊  > canal|🜸 oficial https://whatsapp.com/channel/0029Vb88DAM0G0XiQes3K42c....${mensajes[anu.action]}
┊
╰─❍《✧》𝙕𝙖𝙛𝙆𝙞𝙚𝙡 𝙎𝙮𝙨𝙩𝙚𝙢 ❍─╯`
         await client.sendMessage(anu.id, { image: { url: pp }, caption, ...fakeContext })     
        }
        if ((anu.action === 'remove' || anu.action === 'leave') && chat?.goodbye && (!primaryBotId || primaryBotId === botId)) {
          const caption = `╭─❍「 🩸 𝙆𝙪𝙧𝙪𝙢𝙞 𝙏𝙤𝙠𝙞𝙨𝙖𝙠𝙞 」❍─╮
┊
┊  ✿ *Una sombra abandona el tiempo* ✿
┊  ︶︶︶︶︶︶︶︶︶︶︶
┊
┊  ❥ *Usuario ›* @${phone}
┊  ❥ *Grupo ›* ${metadata.subject}
┊  ❥ *Quedamos ›* ${memberCount} miembros
┊
┊  🥀 El tiempo se detiene para ti...
┊  💔 Esperaré tu regreso, mortal.${mensajes[anu.action]}
┊
╰─❍《✧》𝙕𝙖𝙛𝙆𝙞𝙚𝙡 𝙎𝙮𝙨𝙩𝙚𝙢 ❍─╯`
          await client.sendMessage(anu.id, { image: { url: pp }, caption, ...fakeContext })
        }
        if (anu.action === 'promote' && chat?.alerts && (!primaryBotId || primaryBotId === botId)) {
          const usuario = anu.author
          await client.sendMessage(anu.id, { text: `「✎」 *@${phone}* ha sido promovido a Administrador por *@${usuario.split('@')[0]}.*`, mentions: [jid, usuario, ...groupAdmins.map(v => v.id)] })
        }
        if (anu.action === 'demote' && chat?.alerts && (!primaryBotId || primaryBotId === botId)) {
          const usuario = anu.author
          await client.sendMessage(anu.id, { text: `「✎」 *@${phone}* ha sido degradado de Administrador por *@${usuario.split('@')[0]}.*`, mentions: [jid, usuario, ...groupAdmins.map(v => v.id)] })
        }
      }
    } catch (err) {
      console.log(chalk.gray(`[ BOT  ]  → ${err}`))
    }
  })

  client.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0]
    if (!m.messageStubType) return
    const id = m.key.remoteJid
    const chat = global.db.data.chats[id]
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const primaryBotId = chat?.primaryBot
    if (!chat?.alerts || (primaryBotId && primaryBotId !== botId)) return
    const isSelf = global.db.data.settings[botId]?.self ?? false
    if (isSelf) return
    const actor = m.key?.participant || m.participant || m.key?.remoteJid
    const phone = actor.split('@')[0]
    const groupMetadata = await client.groupMetadata(id).catch(() => null)
    const groupAdmins = groupMetadata?.participants.filter(p => (p.admin === 'admin' || p.admin === 'superadmin')) || []

    const KurumiCtx = (titulo) => ({
      externalAdReply: {
        title: titulo,
        body: '🩸 Kurumi Tokisaki • Registro',
        sourceUrl: 'https://kurumi-tokisha-65e2e9.netlify.app/',
      },
      forwardingScore: 999,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: '120363427643259597@newsletter',
        newsletterName: '\u300E ZafKiel Channel \u300F',
        serverMessageId: 1
      }
    })

    if (m.messageStubType == 21) {
      await client.sendMessage(id, { text: `╭─❍「 𝙆𝙪𝙧𝙪𝙢𝙞 • 𝙀𝙫𝙚𝙣𝙩𝙤𝙨 」❍─╮\n✎ @${phone} 🩸 cambió el nombre del grupo a *${m.messageStubParameters[0]}*\n╰─❍《✧》𝙕𝙖𝙛𝙆𝙞𝙚𝙡 𝙎𝙮𝙨𝙩𝙚𝙢 ❍─╯`, mentions: [actor, ...groupAdmins.map(v => v.id)], contextInfo: KurumiCtx('✎ Nombre del grupo') })
    }
    if (m.messageStubType == 22) {
      await client.sendMessage(id, { text: `╭─❍「 𝙆𝙪𝙧𝙪𝙢𝙞 • 𝙀𝙫𝙚𝙣𝙩𝙤𝙨 」❍─╮\n✎ @${phone} 🖼️ cambió el *icono* del grupo.\n╰─❍《✧》𝙕𝙖𝙛𝙆𝙞𝙚𝙡 𝙎𝙮𝙨𝙩𝙚𝙢 ❍─╯`, mentions: [actor, ...groupAdmins.map(v => v.id)], contextInfo: KurumiCtx('🖼️ Icono del grupo') })
    }
    if (m.messageStubType == 23) {
      await client.sendMessage(id, { text: `╭─❍「 𝙆𝙪𝙧𝙪𝙢𝙞 • 𝙀𝙫𝙚𝙣𝙩𝙤𝙨 」❍─╮\n✎ @${phone} 🔗 *restableció* el enlace del grupo.\n╰─❍《✧》𝙕𝙖𝙛𝙆𝙞𝙚𝙡 𝙎𝙮𝙨𝙩𝙚𝙢 ❍─╯`, mentions: [actor, ...groupAdmins.map(v => v.id)], contextInfo: KurumiCtx('🔗 Enlace restablecido') })
    }
    if (m.messageStubType == 24) {
      await client.sendMessage(id, { text: `╭─❍「 𝙆𝙪𝙧𝙪𝙢𝙞 • 𝙀𝙫𝙚𝙣𝙩𝙤𝙨 」❍─╮\n✎ @${phone} 📝 cambió la *descripción* del grupo.\n╰─❍《✧》𝙕𝙖𝙛𝙆𝙞𝙚𝙡 𝙎𝙮𝙨𝙩𝙚𝙢 ❍─╯`, mentions: [actor, ...groupAdmins.map(v => v.id)], contextInfo: KurumiCtx('📝 Descripción del grupo') })
    }
    if (m.messageStubType == 25) {
      await client.sendMessage(id, { text: `╭─❍「 𝙆𝙪𝙧𝙪𝙢𝙞 • 𝙀𝙫𝙚𝙣𝙩𝙤𝙨 」❍─╮\n✎ @${phone} ⚙️ ahora *${m.messageStubParameters[0] == 'on' ? 'solo admins' : 'todos'}* pueden configurar el grupo.\n╰─❍《✧》𝙕𝙖𝙛𝙆𝙞𝙚𝙡 𝙎𝙮𝙨𝙩𝙚𝙢 ❍─╯`, mentions: [actor, ...groupAdmins.map(v => v.id)], contextInfo: KurumiCtx('⚙️ Ajustes del grupo') })
    }
    if (m.messageStubType == 26) {
      await client.sendMessage(id, { text: `╭─❍「 𝙆𝙪𝙧𝙪𝙢𝙞 • 𝙀𝙫𝙚𝙣𝙩𝙤𝙨 」❍─╮\n✎ @${phone} ${m.messageStubParameters[0] === 'on' ? '🔒 *cerró* el grupo — solo admins pueden enviar mensajes.' : '🔓 *abrió* el grupo — todos pueden enviar mensajes.'}\n╰─❍《✧》𝙕𝙖𝙛𝙆𝙞𝙚𝙡 𝙎𝙮𝙨𝙩𝙚𝙢 ❍─╯`, mentions: [actor, ...groupAdmins.map(v => v.id)], contextInfo: KurumiCtx('🩸 Estado del grupo') })
    }
  })
}
