export default {
  command: ['delprimary', 'deleteprimary', 'unsetprimary'],
  category: 'owner',
  run: async (client, m) => {
    if (!m.chat.endsWith('@g.us')) return m.reply('❌ Solo en grupos we')

    // CHECA OWNER MANUAL POR SI TU LOADER ESTÁ ROTO
    const senderNum = m.sender.split('@')[0]
    const isOwner = global.owner.includes(senderNum)

    if (!isOwner) return m.reply('👑 Solo el owner puede hacer esto we 🩸')

    const chat = global.db.data.chats[m.chat] ||= {}
    
    if (!chat.primaryBot) {
      return m.reply('❌ No hay ningún bot primario asignado en este grupo.')
    }

    const oldPrimary = chat.primaryBot.split('@')[0]
    delete chat.primaryBot
    
    return m.reply(`╭━⌬━『 🩸 𝗣𝗥𝗜𝗠𝗔𝗥𝗬 𝗗𝗘𝗟𝗘𝗧𝗘 』━⌬━╮
┊
┊ ✅ *PRIMARY ELIMINADO A LA FUERZA*
┊
┊ 🔥 Bot anterior: +${oldPrimary}
┊ ⚡ Ya puedes usar setprimary de nuevo
┊
┊ 🩸 Zafkiel recuperó el control
┊
╰━⌬━⌬━⌬━⌬━⌬━⌬━⌬━⌬━╯`)
  }
}
