import fs from 'fs'
import path from 'path'

function findSessionDir(number) {
  const cleanNum = number.replace(/[^0-9]/g, '')
  const baseDir = path.resolve('./Sessions/Subs')

  if (!fs.existsSync(baseDir)) return null

  const dirs = fs.readdirSync(baseDir)
  // Exact match primero
  if (dirs.includes(cleanNum)) return path.join(baseDir, cleanNum)
  // Match parcial (con o sin código de país)
  const partial = dirs.find(d => {
    const dClean = d.replace(/[^0-9]/g, '')
    return dClean.endsWith(cleanNum) || cleanNum.endsWith(dClean)
  })
  return partial ? path.join(baseDir, partial) : null
}

export default {
  command: ['delsubbot', 'eliminarsubbot', 'borrarsubbot', 'removesubbot'],
  category: 'owner',
  isOwner: true,
  run: async (client, m, args, usedPrefix, command) => {
    const botJid = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const ownerJids = [...(global.owner || []).map(n => n + '@s.whatsapp.net'), botJid]
    const isOwner = ownerJids.some(o => o.split('@')[0] === m.sender.split('@')[0])
    if (!isOwner) return m.reply('《✧》 Solo el *propietario* del bot puede usar este comando.')

    // Obtener número objetivo
    let targetNumber = ''
    if (m.mentionedJid?.[0]) {
      targetNumber = m.mentionedJid[0].split('@')[0]
    } else if (m.quoted?.sender) {
      targetNumber = m.quoted.sender.split('@')[0]
    } else if (args[0]) {
      targetNumber = args[0].replace(/[^0-9]/g, '')
    }

    if (!targetNumber) {
      const baseDir = path.resolve('./Sessions/Subs')
      let lista = '_No hay sub-bots registrados_'
      if (fs.existsSync(baseDir)) {
        const dirs = fs.readdirSync(baseDir).filter(d => {
          try { return fs.statSync(path.join(baseDir, d)).isDirectory() } catch { return false }
        })
        if (dirs.length > 0) {
          lista = dirs.map((d, i) => `  \`${i + 1}.\` +${d}`).join('\n')
        }
      }
      return m.reply(
        `🗑️ *ELIMINAR SUB-BOT*\n\n` +
        `*Sub-bots activos:*\n${lista}\n\n` +
        `> Uso: *${usedPrefix}delsubbot <número>*\n` +
        `> Ejemplo: *${usedPrefix}delsubbot 50231882808*\n` +
        `> También puedes mencionar al usuario: *${usedPrefix}delsubbot @usuario*`
      )
    }

    const sessionPath = findSessionDir(targetNumber)
    if (!sessionPath) {
      return m.reply(
        `《✧》 No encontré sesión para el número *+${targetNumber}*.\n` +
        `> Usa *${usedPrefix}delsubbot* sin argumentos para ver la lista.`
      )
    }

    const folderName = path.basename(sessionPath)
    const confirmMsg = await client.sendMessage(m.chat, {
      text:
        `⚠️ *CONFIRMAR ELIMINACIÓN*\n\n` +
        `> Vas a eliminar el sub-bot: *+${folderName}*\n` +
        `> Esta acción es *irreversible*.\n\n` +
        `> Responde con *SI* en los próximos 30 segundos para confirmar.`
    }, { quoted: m })

    // Esperar confirmación
    const confirmed = await new Promise(resolve => {
      const timeout = setTimeout(() => {
        client.ev?.off?.('messages.upsert', handler)
        resolve(false)
      }, 30_000)

      const handler = ({ messages }) => {
        const msg = messages?.[0]
        if (!msg) return
        const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text || ''
        const from = msg.key?.remoteJid
        const senderCheck = msg.key?.participant || msg.key?.remoteJid
        if (from === m.chat && senderCheck?.split('@')[0] === m.sender.split('@')[0]) {
          if (/^si$/i.test(body.trim())) {
            clearTimeout(timeout)
            client.ev?.off?.('messages.upsert', handler)
            resolve(true)
          } else if (/^no$/i.test(body.trim())) {
            clearTimeout(timeout)
            client.ev?.off?.('messages.upsert', handler)
            resolve(false)
          }
        }
      }
      client.ev?.on?.('messages.upsert', ({ messages }) => handler({ messages }))
    })

    if (!confirmed) {
      return client.sendMessage(m.chat, {
        text: `《✧》 Eliminación *cancelada*.`
      }, { quoted: m })
    }

    // Desconectar si está activo en global.conns
    if (Array.isArray(global.conns)) {
      const idx = global.conns.findIndex(conn => {
        const connNum = conn?.user?.id?.split('@')[0]?.replace(/:\d+/, '').replace(/[^0-9]/g, '') || ''
        return connNum.endsWith(targetNumber) || targetNumber.endsWith(connNum)
      })
      if (idx !== -1) {
        try { await global.conns[idx].logout() } catch (_) {}
        try { global.conns[idx].ev?.removeAllListeners?.() } catch (_) {}
        global.conns.splice(idx, 1)
      }
    }

    // Eliminar carpeta de sesión
    try {
      fs.rmSync(sessionPath, { recursive: true, force: true })
      await client.sendMessage(m.chat, {
        text:
          `✅ *Sub-bot eliminado correctamente.*\n\n` +
          `> 📱 Número › *+${folderName}*\n` +
          `> 🗑️ Sesión eliminada permanentemente.\n` +
          `> ⚡ El sub-bot dejará de funcionar inmediatamente.`
      }, { quoted: m })
    } catch (e) {
      await m.reply(`《✧》 Error al eliminar la sesión: *${e.message}*`)
    }
  }
}
