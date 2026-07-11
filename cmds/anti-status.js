export default async (client, m) => {
if (!m.isGroup) return
const groupMetadata = await client.groupMetadata(m.chat).catch(() => null)
if (!groupMetadata) return
const participants = groupMetadata.participants || []
const groupAdmins = participants.filter(p => p.admin).map(p => p.phoneNumber || p.jid || p.id || p.lid)
const isAdmin = groupAdmins.includes(m.sender)
const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
const isBotAdmin = groupAdmins.includes(botId)
const isSelf = global.db.data.settings[botId]?.self ?? false
if (isSelf) return
const chat = global?.db?.data?.chats?.[m.chat]
const primaryBotId = chat?.primaryBot
const isPrimary = !primaryBotId || primaryBotId === botId

const isEstado = m.quoted?.groupStatusMentionMessage
  || m.quoted?.type === 'groupStatusMentionMessage'
  || m.message?.groupStatusMentionMessage
  || m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.groupStatusMentionMessage

if (!isEstado || !chat?.antistatus || isAdmin || !isBotAdmin || !isPrimary) return

try {
  let deleteObj = null

  if (m.quoted && (m.quoted.groupStatusMentionMessage || m.quoted.type === 'groupStatusMentionMessage')) {
    const quotedKey = m.quoted.key
    const participantToUse = quotedKey.participantAlt || (quotedKey.participant ? quotedKey.participant.split(':')[0] + '@s.whatsapp.net' : m.sender)
    deleteObj = { remoteJid: m.chat, fromMe: false, id: quotedKey.id, participant: participantToUse }
  } else if (m.message?.groupStatusMentionMessage) {
    const participantToUse = m.key.participantAlt || (m.key.participant ? m.key.participant.split(':')[0] + '@s.whatsapp.net' : m.sender)
    deleteObj = { remoteJid: m.chat, fromMe: false, id: m.key.id, participant: participantToUse }
  } else if (m.message?.extendedTextMessage?.contextInfo) {
    const contextInfo = m.message.extendedTextMessage.contextInfo
    if (contextInfo.quotedMessage?.groupStatusMentionMessage || contextInfo.stanzaId) {
      const participantToUse = (contextInfo.participant ? contextInfo.participant.split(':')[0] + '@s.whatsapp.net' : null) || m.sender
      deleteObj = { remoteJid: m.chat, fromMe: false, id: contextInfo.stanzaId, participant: participantToUse }
    }
  }

  if (deleteObj) {
    await client.sendMessage(m.chat, { delete: deleteObj }).catch(err => console.error('Error al borrar status:', err))
    const currentParticipant = m.key.participantAlt || (m.key.participant ? m.key.participant.split(':')[0] + '@s.whatsapp.net' : m.sender)
    const currentDeleteObj = { remoteJid: m.chat, fromMe: false, id: m.key.id, participant: currentParticipant }
    if (currentDeleteObj.id !== deleteObj.id) {
      await client.sendMessage(m.chat, { delete: currentDeleteObj }).catch(err => console.error('Error al borrar comando actual:', err))
    }
  }

  const targetId = m.sender
  global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {}
  global.db.data.chats[m.chat].users = global.db.data.chats[m.chat].users || {}
  global.db.data.chats[m.chat].users[targetId] = global.db.data.chats[m.chat].users[targetId] || {}
  const user = global.db.data.chats[m.chat].users[targetId]

  let warnings = Array.isArray(user.warnings) ? user.warnings : []
  const now = new Date()
  const timestamp = now.toLocaleString('es-CO', { timeZone: 'America/Bogota', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  warnings.unshift({ reason: 'Anti-Status detectado', timestamp, by: botId })
  user.warnings = warnings

  const total = warnings.length
  const warnLimit = chat.warnLimit || 3
  const expulsar = chat.expulsar === true

  const warningList = warnings.map((w, i) => {
    const index = total - i
    return `\`#${index}\` » ${w.reason}\n> » Fecha: ${w.timestamp}`
  }).join('\n')

  let message = `✐ Se ha añadido una advertencia automática a @${targetId.split('@')[0]} por *Anti-Status*.\n✿ Advertencias totales \`(${total})\`:\n\n${warningList}`

  if (total >= warnLimit && expulsar) {
    try {
      await client.groupParticipantsUpdate(m.chat, [targetId], 'remove')
      user.warnings = []
      message += `\n\n> ❖ El usuario alcanzó el límite de advertencias y fue expulsado del grupo.`
    } catch {
      message += `\n\n> ❖ El usuario alcanzó el límite, pero no se pudo expulsar automáticamente.`
    }
  } else if (total >= warnLimit && !expulsar) {
    message += `\n\n> ❖ El usuario ha alcanzado el límite de advertencias.`
  }

  await client.reply(m.chat, message, m, { mentions: [targetId] })
} catch (error) {
  console.error('Error general en Anti-Estado:', error)
}
}