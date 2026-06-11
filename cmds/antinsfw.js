export default {
  command: ['antinsfw', 'antigore', 'actfiltro'],
  category: 'groups',
  run: async (client, m, args, usedPrefix, command) => {
    if (!m.isGroup) return m.reply('❌ Solo en grupos.');

    const groupId = m.chat;
    const groupMetadata = await client.groupMetadata(groupId).catch(() => null);
    if (!groupMetadata) return m.reply('❌ No se pudo obtener la información del grupo.');

    const participants = groupMetadata.participants || [];
    // Extraer IDs de administradores exactamente como en tu antilink
    const groupAdmins = participants.filter(p => p.admin).map(p => p.phoneNumber || p.jid || p.id || p.lid);
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net';
    const isBotAdmin = groupAdmins.includes(botId);
    const isSenderAdmin = groupAdmins.includes(m.sender);

    if (!isSenderAdmin) return m.reply('👑 Solo administradores pueden configurar esto.');
    if (!isBotAdmin) return m.reply('⚠️ El bot debe ser administrador para eliminar stickers.');

    const option = args[0]?.toLowerCase();
    const chatData = global.db.data.chats[groupId] || {};
    if (option === 'on') {
      chatData.antinsfw = true;
      global.db.data.chats[groupId] = chatData;
      return m.reply('🕷️ *Filtro Anti-NSFW ACTIVADO* 🕷️\n\nEliminaré stickers +18 automáticamente.');
    } else if (option === 'off') {
      chatData.antinsfw = false;
      global.db.data.chats[groupId] = chatData;
      return m.reply('🕷️ *Filtro Anti-NSFW DESACTIVADO* 🕷️');
    } else {
      const estado = chatData.antinsfw ? 'ACTIVADO' : 'DESACTIVADO';
      return m.reply(`🕷️ *ESTADO DEL FILTRO* 🕷️\n\nFiltro: ${estado}\n\n*${usedPrefix}antinsfw on* para activar\n*${usedPrefix}antinsfw off* para desactivar`);
    }
  }
};

