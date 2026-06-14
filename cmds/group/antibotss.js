/ cmds/group/antibots.js
// Detección y expulsión de bots intrusos en grupos

import fs from 'fs'

// ══════════════════════════════════════════════════════════════
//  CONFIGURACIÓN — Newsletter protegido (el tuyo)
// ══════════════════════════════════════════════════════════════
const MY_NEWSLETTER = '120363427643259597@newsletter'
const MY_NEWSLETTER_NAME = '『 𝙕𝙖𝙛𝙠ι𝙚λ 𝘾𝙝𝙖𝗻𝗻𝙚𝙡 』'

// Patrones de texto que suelen usar bots intrusos
const BOT_TEXT_PATTERNS = [
  /apareció un personaje/i,
  /reclamar.*!claim/i,
  /!claim/i,
  /rareza:.*⭐/i,
  /valor:.*¥/i,
  /serie:/i,
  /expira en \d+ minuto/i,
  /escribe.*para reclamar/i,
  /fue reclamado/i,
  /no fue reclamado/i,
  /personaje.*aparece/i,
  /tienes.*monedas/i,
  /tu inventario/i,
  /gacha.*bot/i,
  /reencaminh/i,         // "Reencaminhada" = forwarded (portugués)
  /arcadiacorp/i,
  /pragmata/i,
]

// Palabras en el nombre del newsletter que indican bot externo
const SUSPICIOUS_NEWSLETTER_WORDS = [
  'bot', 'corp', 'channel', 'canal', 'oficial', 'group',
  'gaming', 'gacha', 'anime', 'arcadia', 'pragmata',
  'bachhi', 'claim', 'collectibles', 'characters'
]

// Guarda listeners activos por grupo para poder desactivarlos
const activeListeners = new Map()

// ══════════════════════════════════════════════════════════════
//  FUNCIÓN: detecta si un mensaje es de bot
//  Devuelve { isBot: bool, score: number, reasons: [] }
// ══════════════════════════════════════════════════════════════
function detectBotMessage(msg) {
  const reasons = []
  let score = 0

  const ctx = msg?.message?.extendedTextMessage?.contextInfo
            || msg?.message?.imageMessage?.contextInfo
            || msg?.message?.videoMessage?.contextInfo
            || msg?.message?.stickerMessage?.contextInfo
            || null

  const text = (
    msg?.message?.conversation ||
    msg?.message?.extendedTextMessage?.text ||
    msg?.message?.imageMessage?.caption ||
    msg?.message?.videoMessage?.caption ||
    ''
  ).toLowerCase()

  // ── 1. Tiene newsletter promocionada que NO es la nuestra ──
  if (ctx?.forwardedNewsletterMessageInfo) {
    const nl = ctx.forwardedNewsletterMessageInfo
    if (nl.newsletterJid && nl.newsletterJid !== MY_NEWSLETTER) {
      score += 5
      reasons.push(`📡 Promociona newsletter externo: ${nl.newsletterName || nl.newsletterJid}`)
    }
  }

  // ── 2. forwardingScore muy alto (bots hacen forward masivo) ──
  if (ctx?.forwardingScore >= 100) {
    score += 3
    reasons.push(`📤 forwardingScore altísimo: ${ctx.forwardingScore}`)
  } else if (ctx?.forwardingScore >= 20) {
    score += 1
    reasons.push(`📤 forwardingScore sospechoso: ${ctx.forwardingScore}`)
  }

  // ── 3. Mensaje reenviado (isForwarded) ──
  if (ctx?.isForwarded) {
    score += 1
    reasons.push('↪️ Mensaje reenviado')
  }

  // ── 4. Patrones de texto de bot gacha/RPG ──
  for (const pattern of BOT_TEXT_PATTERNS) {
    if (pattern.test(text)) {
      score += 3
      reasons.push(`🤖 Patrón de bot detectado: "${text.slice(0, 40)}..."`)
      break
    }
  }

  // ── 5. Mensaje muy estructurado con muchos emojis (bots típicos) ──
  const emojiCount = (text.match(/[\p{Emoji}]/gu) || []).length
  const lineCount  = text.split('\n').length
  if (emojiCount >= 5 && lineCount >= 5) {
    score += 1
    reasons.push(`🎭 Mensaje muy estructurado (${emojiCount} emojis, ${lineCount} líneas)`)
  }

  // ── 6. Responde a su propio mensaje (eco de bot) ──
  const quotedParticipant = ctx?.participant || ctx?.remoteJid || ''
  if (quotedParticipant && quotedParticipant === msg?.key?.participant) {
    score += 2
    reasons.push('🔁 Se responde a sí mismo (eco de bot)')
  }

  return {
    isBot:   score >= 4,
    score,
    reasons,
  }
}

// ══════════════════════════════════════════════════════════════
//  FUNCIÓN: analiza a un participante y devuelve su score
// ══════════════════════════════════════════════════════════════
function detectBotParticipant(jid, recentMessages) {
  const reasons = []
  let score = 0

  // Analiza sus últimos mensajes en el grupo
  const ownMessages = recentMessages.filter(
    msg => (msg?.key?.participant || msg?.key?.remoteJid) === jid
  )

  for (const msg of ownMessages) {
    const result = detectBotMessage(msg)
    if (result.score > 0) {
      score += result.score
      reasons.push(...result.reasons)
      if (score >= 4) break // suficiente evidencia
    }
  }

  // Deduplica razones
  const uniqueReasons = [...new Set(reasons)]

  return {
    jid,
    isBot:   score >= 4,
    score,
    reasons: uniqueReasons,
  }
}

// ══════════════════════════════════════════════════════════════
//  LISTENER EN TIEMPO REAL — se activa con !antibots on
// ══════════════════════════════════════════════════════════════
function startRealtimeProtection(client, groupJid) {
  if (activeListeners.has(groupJid)) return // ya activo

  const handler = async ({ messages, type }) => {
    if (type !== 'notify') return

    const settings = global.db?.data?.chats?.[groupJid]
    if (!settings?.antibots) return

    for (const raw of messages) {
      if (!raw?.message) continue
      if (raw.key?.remoteJid !== groupJid) continue
      if (raw.key?.fromMe) continue

      const senderJid = raw.key?.participant || raw.key?.remoteJid
      if (!senderJid) continue

      // Nunca tocar al owner del bot
      const ownerJid = global.client?.user?.id?.split(':')[0] + '@s.whatsapp.net'
      if (senderJid === ownerJid) continue
      if (global.my?.owner?.some?.(o => senderJid.startsWith(o))) continue

      const result = detectBotMessage(raw)
      if (result.isBot) {
        try {
          // Avisa antes de expulsar
          const preview = result.reasons[0] || 'Bot detectado'
          await client.sendMessage(groupJid, {
            text: `🛡️ *AntiBot* — Bot detectado y expulsado\n\n` +
                  `👤 JID: @${senderJid.split('@')[0]}\n` +
                  `📊 Score: ${result.score}/10\n` +
                  `🔍 ${preview}`,
            mentions: [senderJid],
            ...newsletterCtx()
          })
          await client.groupParticipantsUpdate(groupJid, [senderJid], 'remove')
          console.log(`[AntiBot] Expulsado: ${senderJid} (score ${result.score})`)
        } catch (e) {
          console.log('[AntiBot] No se pudo expulsar:', e.message)
        }
      }
    }
  }

  client.ev.on('messages.upsert', handler)
  activeListeners.set(groupJid, handler)
}

function stopRealtimeProtection(client, groupJid) {
  const handler = activeListeners.get(groupJid)
  if (handler) {
    client.ev.off('messages.upsert', handler)
    activeListeners.delete(groupJid)
  }
}

// ══════════════════════════════════════════════════════════════
//  HELPER: contextInfo con tu newsletter (protección de marca)
// ══════════════════════════════════════════════════════════════
function newsletterCtx() {
  return {
    contextInfo: {
      forwardingScore: 999,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid:     MY_NEWSLETTER,
        newsletterName:    MY_NEWSLETTER_NAME,
        serverMessageId:   1,
      },
    },
  }
}

// ══════════════════════════════════════════════════════════════
//  COMANDO PRINCIPAL
// ══════════════════════════════════════════════════════════════
export default {
  command: ['antibots', 'antibot', 'ab'],
  category: 'group',
  desc: 'Detecta y expulsa bots intrusos del grupo',

  run: async (client, m, args, usedPrefix, command) => {
    // Solo en grupos
    if (!m.isGroup) {
      return m.reply('❌ Este comando solo funciona en grupos.')
    }

    // Solo admins del grupo o el owner del bot
    const groupMeta = await client.groupMetadata(m.chat).catch(() => null)
    const admins    = groupMeta?.participants?.filter(p => p.admin).map(p => p.id) || []
    const ownerJid  = global.client?.user?.id?.split(':')[0] + '@s.whatsapp.net'
    const isAdmin   = admins.includes(m.sender) || m.sender === ownerJid
    if (!isAdmin) {
      return m.reply('❌ Solo los admins pueden usar AntiBot.')
    }

    const subCmd = (args[0] || '').toLowerCase()
    const chatData = global.db?.data?.chats?.[m.chat] || {}

    // ── AYUDA ────────────────────────────────────────────────
    if (!subCmd || subCmd === 'help' || subCmd === 'ayuda') {
      return client.sendMessage(m.chat, {
        text: `🛡️ *AntiBot — Kurumi Protocol*\n\n` +
              `*Comandos:*\n` +
              `▸ \`${usedPrefix}antibots on\` — Activar protección en tiempo real\n` +
              `▸ \`${usedPrefix}antibots off\` — Desactivar protección\n` +
              `▸ \`${usedPrefix}antibots scan\` — Escanear y listar bots detectados\n` +
              `▸ \`${usedPrefix}antibots kick\` — Escanear y expulsar bots\n` +
              `▸ \`${usedPrefix}antibots status\` — Ver estado actual\n\n` +
              `*¿Cómo detecta bots?*\n` +
              `▸ 📡 Newsletter ajeno en mensajes\n` +
              `▸ 📤 forwardingScore muy alto (spam)\n` +
              `▸ 🤖 Patrones de texto de bot gacha/RPG\n` +
              `▸ 🎭 Mensajes ultra-estructurados\n` +
              `▸ 🔁 Eco (bot se responde a sí mismo)\n` +
              `▸ ↪️ Mensajes masivamente reenviados\n\n` +
              `🔒 *Tu newsletter está protegido y nunca se tocará.*`,
        ...newsletterCtx()
      }, { quoted: m })
    }

    // ── STATUS ───────────────────────────────────────────────
    if (subCmd === 'status') {
      const estado = chatData.antibots ? '🟢 ACTIVO' : '🔴 INACTIVO'
      return client.sendMessage(m.chat, {
        text: `🛡️ *AntiBot Status*\n\n` +
              `Estado: *${estado}*\n` +
              `Grupo: ${groupMeta?.subject || m.chat}\n` +
              `Newsletter protegido: ${MY_NEWSLETTER_NAME}`,
        ...newsletterCtx()
      }, { quoted: m })
    }

    // ── ON ────────────────────────────────────────────────────
    if (subCmd === 'on' || subCmd === 'activar') {
      if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
      global.db.data.chats[m.chat].antibots = true
      startRealtimeProtection(client, m.chat)
      return client.sendMessage(m.chat, {
        text: `🛡️ *AntiBot ACTIVADO*\n\n` +
              `Monitoreo en tiempo real activado para este grupo.\n` +
              `Cualquier bot intruso será expulsado automáticamente.\n\n` +
              `_Tu newsletter está protegido_ ✅`,
        ...newsletterCtx()
      }, { quoted: m })
    }

    // ── OFF ───────────────────────────────────────────────────
    if (subCmd === 'off' || subCmd === 'desactivar') {
      if (global.db.data.chats[m.chat]) {
        global.db.data.chats[m.chat].antibots = false
      }
      stopRealtimeProtection(client, m.chat)
      return client.sendMessage(m.chat, {
        text: `🛡️ *AntiBot DESACTIVADO*\n\nProtección en tiempo real apagada.`,
        ...newsletterCtx()
      }, { quoted: m })
    }

    // ── SCAN / KICK ───────────────────────────────────────────
    if (subCmd === 'scan' || subCmd === 'kick' || subCmd === 'expulsar') {
      const doKick = subCmd === 'kick' || subCmd === 'expulsar'

      // Verifica que el bot sea admin si va a expulsar
      const botJid   = client.user?.id?.split(':')[0] + '@s.whatsapp.net'
      const botAdmin = admins.includes(botJid)
      if (doKick && !botAdmin) {
        return m.reply('❌ Necesito ser admin del grupo para expulsar.')
      }

      await client.sendMessage(m.chat, {
        text: `🔍 *AntiBot Scan iniciado…*\n\nAnalizando ${groupMeta?.participants?.length || 0} participantes. Espera.`,
        ...newsletterCtx()
      }, { quoted: m })

      // Obtiene los últimos mensajes del store si están disponibles
      let recentMsgs = []
      try {
        // Intenta obtener mensajes cacheados
        const store = global.store || null
        if (store?.messages?.[m.chat]) {
          recentMsgs = [...store.messages[m.chat].array || []]
        }
      } catch {}

      const participants = groupMeta?.participants || []
      const detected     = []

      for (const p of participants) {
        const jid = p.id

        // Nunca tocar admins, owner del bot, o tu newsletter
        if (admins.includes(jid)) continue
        if (jid === ownerJid) continue
        if (global.my?.owner?.some?.(o => jid.startsWith(o))) continue

        const result = detectBotParticipant(jid, recentMsgs)
        if (result.isBot) {
          detected.push(result)
        }
      }

      if (detected.length === 0) {
        return client.sendMessage(m.chat, {
          text: `✅ *AntiBot Scan completo*\n\nNo se detectaron bots en este grupo. 🎉`,
          ...newsletterCtx()
        }, { quoted: m })
      }

      // Construye el reporte
      let report = `🛡️ *AntiBot Scan — ${detected.length} bot(s) detectado(s)*\n\n`
      const mentions = []

      for (const bot of detected) {
        const num = bot.jid.split('@')[0]
        mentions.push(bot.jid)
        report += `👾 @${num} *(score: ${bot.score})*\n`
        for (const reason of bot.reasons.slice(0, 3)) {
          report += `  • ${reason}\n`
        }
        report += '\n'
      }

      if (doKick) {
        report += `⚡ *Expulsando ${detected.length} bot(s)…*`
      } else {
        report += `_Usa \`${usedPrefix}antibots kick\` para expulsarlos._`
      }

      await client.sendMessage(m.chat, {
        text: report,
        mentions,
        ...newsletterCtx()
      }, { quoted: m })

      // Expulsa si se pidió
      if (doKick) {
        let expulsados = 0
        for (const bot of detected) {
          try {
            await client.groupParticipantsUpdate(m.chat, [bot.jid], 'remove')
            expulsados++
            await new Promise(r => setTimeout(r, 800)) // espera entre expulsiones
          } catch (e) {
            console.log('[AntiBot] Error expulsando', bot.jid, e.message)
          }
        }
        await client.sendMessage(m.chat, {
          text: `✅ *AntiBot — ${expulsados}/${detected.length} bot(s) expulsado(s)*\n\nGrupo limpio 🧹`,
          ...newsletterCtx()
        }, { quoted: m })
      }
      return
    }

    // Subcomando no reconocido
    m.reply(`❓ Subcomando no reconocido. Usa \`${usedPrefix}antibots\` para ver la ayuda.`)
  }
}
