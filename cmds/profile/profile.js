import moment from 'moment-timezone';
import { resolveLidToRealJid } from "../../core/utils.js"

const growth = Math.pow(Math.PI / Math.E, 1.618) * Math.E * 0.75
function xpRange(level, multiplier = global.multiplier || 2) {
  if (level < 0) throw new TypeError('level cannot be negative value')
  level = Math.floor(level)
  const min = level === 0 ? 0 : Math.round(Math.pow(level, growth) * multiplier) + 1
  const max = Math.round(Math.pow(level + 1, growth) * multiplier)
  return { min, max, xp: max - min }
}

export default {
  command: ['profile', 'perfil'],
  category: 'rpg',
  run: async (client, m, args, usedPrefix, command) => {
    const texto = m.mentionedJid
    const who2 = texto.length > 0 ? texto[0] : m.quoted ? m.quoted.sender : m.sender
    const userId = await resolveLidToRealJid(who2, client, m.chat);
    
    const globalUsers = global.db.data.users || {}
    const user2 = globalUsers[userId] || {}
    
    if (!user2.name) {
      return m.reply('✎ El usuario *mencionado* no está *registrado* en el bot')
    }

    const chat = global.db.data.chats[m.chat] || {}
    const chatUsers = chat.users || {}
    const user = chatUsers[userId] || {}
    const idBot = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const settings = global.db.data.settings[idBot] || {}
    const currency = settings.currency || 'Yenes'

    // --- DATOS DEL PERFIL ---
    const name = user2.name || 'Sin nombre'
    const role = user2.role || 'NUEVO' // Extraemos el Rango
    const totalMsgs = user2.msgs || 0 // Extraemos Mensajes Totales
    const birth = user2.birth || 'Sin especificar'
    const genero = user2.genre || 'Oculto'
    const comandos = user2.usedcommands || 0
    const pareja = user2.marry ? `${globalUsers[user2.marry]?.name || 'Alguien'}` : 'Nadie'
    const estadoCivil = genero === 'Mujer' ? 'Casada con' : genero === 'Hombre' ? 'Casado con' : 'Casadx con'
    const desc = user2.description ? `\n${user2.description}` : ''
    const pasatiempo = user2.pasatiempo ? `${user2.pasatiempo}` : 'No definido'
    const exp = user2.exp || 0
    const nivel = user2.level || 0
    const chocolates = user.coins || 0
    const banco = user.bank || 0
    const totalCoins = chocolates + banco

    // --- CÁLCULO DE ICONO SEGÚN RANGO ---
    const icons = { 'NUEVO': '👤', 'MIEMBRO': '🌱', 'ELITE': '🔥', 'VETERANO': '⚔️', 'MODERADOR': '🌸', 'ADMIN': '🛡️', 'CO-OWNER': '⚡', 'OWNER': '👑' };
    const rIcon = icons[role] || '👤';

    const perfil = await client.profilePictureUrl(userId, 'image').catch((_) => 'https://cdn.yuki-wabot.my.id/files/2PVh.jpeg')
    const usersList = Object.entries(globalUsers).map(([key, value]) => ({ ...value, jid: key }))
    const sortedLevel = usersList.sort((a, b) => (b.level || 0) - (a.level || 0))

    try {
      const rank = sortedLevel.findIndex((u) => u.jid === userId) + 1
      const { min, xp } = xpRange(nivel, global.multiplier)
      const progreso = exp - min
      const porcentaje = xp > 0 ? Math.floor((progreso / xp) * 100) : 0
      
      const profileText = `「${rIcon}」 *Perfil* ◢ ${name} ◤${desc}

🌸 *Rango:* 「 ${role} 」
✉️ *Mensajes:* ${totalMsgs.toLocaleString()}

♛ Cumpleaños › *${birth}*
⸙ Pasatiempo › *${pasatiempo}*
⚥ Género › *${genero}*
♡ ${estadoCivil} › *${pareja}*

✿ Nivel › *${nivel}*
❀ Experiencia › *${exp.toLocaleString()}*
➨ Progreso › *${progreso} => ${xp}* _(${porcentaje}%)_
☆ Puesto › *#${rank}*

⛁ Coins totales › *¥${totalCoins.toLocaleString()} ${currency}*
❒ Comandos usados › *${comandos.toLocaleString()}*`

      await client.sendMessage(m.chat, { image: { url: perfil }, caption: profileText }, { quoted: m })
    } catch (e) {
      console.error(e)
      return m.reply(`> Error al cargar el perfil de la Gran Sacerdotisa.`)
    }
  }
}
