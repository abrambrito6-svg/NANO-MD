const NL = {
  contextInfo: {
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: '120363427643259597@newsletter',
      newsletterName: '\u300E \uD835\uDE15\uD835\uDE56\uD835\uDE57\uD835\uDE60\u03B9\uD835\uDE5A\u03BB \uD835\uDE3E\uD835\uDE5D\uD835\uDE56\uD835\uDE63\uD835\uDDFB\uD835\uDE5A\u03BB \u300F',
      serverMessageId: 1
    }
  }
};

const pending = new Map();

export default {
  command: ['kickinactivos', 'purgafantasmas', 'kickghost'],
  category: 'grupo',
  isAdmin: true,
  botAdmin: true,
  run: async (client, m, args) => {
    try {
      if (!m.isGroup) return m.reply('Solo en grupos, querido~', null, NL);

      const limit = Math.max(0, parseInt(args[0]) || 3);
      const meta = await client.groupMetadata(m.chat);
      const chatDB = global.db.data.chats[m.chat] || {};
      const activity = chatDB.activity || {};
      const ownerNum = (global.owner && global.owner[0] && global.owner[0][0]) ? global.owner[0][0] : '';

      const ghosts = meta.participants
        .filter(p => {
          const n = activity[p.id] || 0;
          const isAdmin = p.admin === 'admin' || p.admin === 'superadmin';
          const isMe = p.id === (client.user && client.user.id);
          const isOwner = String(p.id).startsWith(String(ownerNum));
          return n <= limit && !isAdmin && !isMe && !isOwner;
        })
        .map(p => ({ id: p.id, n: activity[p.id] || 0 }));

      if (!ghosts.length) return m.reply('No hay fantasmas para purgar, fufufu~', null, NL);

      let txt = '《✧》Purga de Fantasmas — Kurumi Tokisaki\n';
      txt += '✎ Detectados ' + ghosts.length + ' fantasmas (≤ ' + limit + ' msgs):\n\n';
      ghosts.forEach((u, i) => {
        txt += '👻 ' + String(i + 1).padStart(2, '0') + ' @' + String(u.id).split('@')[0] + ' — ' + u.n + ' msgs\n';
      });
      txt += '\n❏ Responde *SI* en 60s para devorar sus tiempos.';

      const sent = await client.sendMessage(m.chat, {
        text: txt,
        mentions: ghosts.map(u => u.id),
        ...NL
      }, { quoted: m });

      pending.set(m.chat + '|' + m.sender, {
        ghosts: ghosts,
        ts: Date.now(),
        msgId: sent && sent.key ? sent.key.id : null
      });

      setTimeout(() => pending.delete(m.chat + '|' + m.sender), 60000);
    } catch (e) {
      m.reply('✿ Error: ' + (e && e.message ? e.message : e), null, NL);
    }
  },

  before: async (client, m) => {
    try {
      if (!m.isGroup) return false;
      const key = m.chat + '|' + m.sender;
      const data = pending.get(key);
      if (!data) return false;
      if (Date.now() - data.ts > 60000) { pending.delete(key); return false; }

      const body = (m.text || m.body || '').trim().toUpperCase();
      if (body !== 'SI' && body !== 'SÍ') return false;

      pending.delete(key);
      await m.reply('《✧》Comenzando la purga... fufufu~', null, NL);

      let ok = 0, fail = 0;
      for (const g of data.ghosts) {
        try {
          await client.groupParticipantsUpdate(m.chat, [g.id], 'remove');
          ok++;
          await new Promise(r => setTimeout(r, 1500));
        } catch (e) {
          fail++;
        }
      }

      await client.sendMessage(m.chat, {
        text: '❏ Purga completa.\n✿ Expulsados: ' + ok + '\n✎ Fallidos: ' + fail,
        ...NL
      }, { quoted: m });
      return true;
    } catch (e) {
      return false;
    }
  }
};
