const pureNumber = (jid) => jid?.split('@')[0] || '';

export default {
  all: async (client, m) => {
    if (!m.message?.stickerMessage) return;
    const chatId = m.chat;
    if (!chatId.endsWith('@g.us')) return;

    const chatData = global.db.data.chats[chatId];
    if (!chatData?.antinsfw) return;

    const groupMeta = await client.groupMetadata(chatId).catch(() => null);
    if (!groupMeta) return;
    const botJid = client.user.id.split(':')[0] + '@s.whatsapp.net';
    const botNumber = pureNumber(botJid);
    const isBotAdmin = groupMeta.participants.some(p => pureNumber(p.id) === botNumber && (p.admin === 'admin' || p.admin === 'superadmin'));
    if (!isBotAdmin) return;

    try {
      const media = await client.downloadMediaMessage(m);
      if (!media) return;
      const formData = new FormData();
      formData.append('image', Buffer.from(media), 'sticker.png');
      const response = await fetch('https://nsfw-api-inky.vercel.app/api/check', { method: 'POST', body: formData }).catch(() => null);
      if (!response || !response.ok) return;
      const result = await response.json();
      if (result.nsfw && result.probability > 0.7) {
        await client.sendMessage(chatId, { delete: m.key });
        await client.sendMessage(chatId, { text: `🕷️ *KURUMI*: Sticker eliminado por contenido inapropiado.\n📢 Powered by Zafkiel Channel` });
      }
    } catch (err) {
      console.error('Error en filtro NSFW:', err);
    }
  }
};

