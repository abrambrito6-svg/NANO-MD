import { delay } from '@whiskeysockets/baileys';

const _registeredListeners = new WeakSet();

// 🕰️ Tu Newsletter oficial 『 𝙕𝙖𝙛𝙠ι𝙚𝙡 𝘾𝙝𝙖𝙣𝙣𝙚λ 』 🥀
const NL = {
  contextInfo: {
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: '120363427643259597@newsletter',
      newsletterName: '『 𝙕𝙖𝙛𝙠ι𝙚𝙡 𝘾𝙝𝙖𝙣𝙣𝙚𝙡 』',
      serverMessageId: 1
    }
  }
};

function getOurNumbers() {
  const nums = new Set();
  const add = (id) => {
    if (!id) return;
    const n = String(id).replace(/:\d+/, '').split('@')[0].replace(/[^0-9]/g, '');
    if (n) nums.add(n);
  };
  try {
    add(global.client?.user?.id);
    if (Array.isArray(global.conns)) {
      for (const c of global.conns) {
        add(c?.user?.id);
        add(c?.userId);
      }
    }
    for (const num of (global.owner || [])) add(num);
  } catch (_) {}
  return nums;
}

function isOurBot(jid, ourNums) {
  const num = String(jid || '').replace(/:\d+/, '').split('@')[0].replace(/[^0-9]/g, '');
  return ourNums.has(num);
}

// 🕵️‍♂️ ESCÁNER INTELIGENTE ANTI-BOTS (Detecta botones falsos, links de canales y scripts)
function detectBot(m) {
  if (m.isBot === true) return { detected: true, reason: 'Flag del sistema (isBot)' };

  const msgContent = m.message || m.msg || {};
  const innerMsg = msgContent[Object.keys(msgContent)[0]] || {};
  const ctxInfo = innerMsg?.contextInfo || m.msg?.contextInfo || {};
  
  if (ctxInfo?.forwardedNewsletterMessageInfo?.newsletterJid) {
    return { detected: true, reason: 'Spam via Newsletter forward' };
  }

  if (!!(msgContent.templateMessage || msgContent.buttonsMessage || msgContent.hydratedTemplateMessage || msgContent.listMessage || msgContent.productMessage)) {
    return { detected: true, reason: 'Mensaje interactivo/comercial' };
  }

  const pushName = m.pushName || m.name || '';
  if (pushName.startsWith('~') || pushName.startsWith('~ ')) {
    return { detected: true, reason: 'Nombre de perfil con (~)' };
  }

  const msgId = m.key?.id || m.id || '';
  const prefixes = ['HSK', 'BAE', 'B1E', '3EB', 'B24', 'WA', 'AE4', 'C93', 'WAME'];
  const lengths = [12, 16, 18, 20, 21, 22, 40];
  if (prefixes.some(p => msgId.startsWith(p)) && lengths.includes(msgId.length)) {
    return { detected: true, reason: 'ID con patrón de librería externa' };
  }
  
  if (msgId.length >= 16 && msgId.length <= 40 && /^[0-9A-F]+$/.test(msgId)) {
    return { detected: true, reason: 'ID Hexadecimal automatizado' };
  }
  
  if (/(.)\1{4,}/.test(msgId)) {
    return { detected: true, reason: 'ID con caracteres repetitivos' };
  }

  return { detected: false, reason: '' };
}

async function kickBot(client, chatId, senderJid, groupMetadata, reason) {
  try {
    const participants = groupMetadata.participants || [];
    const participant = participants.find(p => p.id.split('@')[0] === senderJid.split('@')[0]);
    if (!participant) return;
    
    // El guardián jamás sacará a un Administrador real o al Creador del grupo
    const isAdmin = participant.admin === 'admin' || participant.admin === 'superadmin';
    if (isAdmin) return;
    const owner = groupMetadata.owner?.replace(/:\d+/, '').split('@')[0];
    if (owner === senderJid.replace(/:\d+/, '').split('@')[0]) return;
    
    const kickId = participant.id || senderJid;
    const display = `@${senderJid.split('@')[0]}`;
    
    await client.sendMessage(chatId, {
      text:
        `╭─「 🕰️ 𝗞𝗨𝗥𝗨𝗠Ｉ: 𝗕𝗔𝗟𝗔 𝗙𝗜𝗡𝗔𝗟 」─╮\n` +
        `│\n` +
        `│ ✦ *Objetivo:* ${display}\n` +
        `│ ✦ *Detección:* ${reason}\n` +
        `│\n` +
        `│ 🩸 Ara ara~ ${display}...\n` +
        `│ ¿Creías que podías entrar a mi\n` +
        `│ dominio sin permiso? 💋\n` +
        `│\n` +
        `│ 🔫 *Zafkiel ha disparado...*\n` +
        `│ El tiempo se ha detenido para ti.\n` +
        `│ Directo al olvido~ 🖤\n` +
        `│\n` +
        `│ ⏳ *Tik tok... el reloj no perdona*\n` +
        `│\n` +
        `╰─「 🕰️ 𝗧𝗜𝗘𝗠𝗣𝗢 𝗔𝗚𝗢𝗧𝗔𝗗𝗢 」─╯`,
      mentions: [senderJid],
      ...NL
    });
    
    await delay(400);
    await client.groupParticipantsUpdate(chatId, [kickId], 'remove');
  } catch (e) {
    console.error('antibots kick error:', e?.message);
  }
}

export default {
  command: ['antisubb', 'antiubbot', 'antisubb'],
  category: 'grupo',
  
  // INTERRUPTOR LIMPIO Y TOTALMENTE DESBLOQUEADO 🔓
  run: async (client, m, args, usedPrefix, command) => {
    try {
      if (!m.isGroup) return client.reply(m.chat, '《✧》 ¡Ara ara~! Este comando solo sirve en grupos.', m);

      if (!global.db.data) global.db.data = {};
      if (!global.db.data.chats) global.db.data.chats = {};
      if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {};

      const chat = global.db.data.chats[m.chat];
      if (!('antibots' in chat)) chat.antibots = false;
      
      const arg = args && args[0] ? args[0].toLowerCase() : '';
      if (!arg) {
        const estado = chat.antibots ? '✅ *Activado*' : '❌ *Desactivado*';
        return m.reply(
          `╭─「 🕰️ 𝗔𝗡𝗧𝗜-𝗕𝗢𝗧𝗦 」─╮\n` +
          `│\n` +
          `│ ✦ Estado: ${estado}\n` +
          `│\n` +
          `│ ꕤ *${usedPrefix}antibots on*\n` +
          `│   Activa la protección de Zafkiel\n` +
          `│\n` +
          `│ ꕤ *${usedPrefix}antibots off*\n` +
          `│   Desactiva la protección\n` +
          `│\n` +
          `╰─「 🕰️ 𝗭𝗔𝗙𝗞𝗜𝗘𝗟 」─╯`
        );
      }
      
      if (arg === 'on' || arg === 'activa') {
        if (chat.antibots) return m.reply(` 🕰️ *Kurumi:* Zafkiel ya está vigilando este lugar.`);
        chat.antibots = true;
        return client.sendMessage(m.chat, { text: `🟢 *Anti-Bots activado con éxito.* El reloj de Zafkiel vigila...`, ...NL }, { quoted: m });
      }
      
      if (arg === 'off' || arg === 'desactiva') {
        if (!chat.antibots) return m.reply(`🕰️ *Kurumi:* Zafkiel ya estaba descansando.`);
        chat.antibots = false;
        return m.reply(`🔴 *Anti-Bots desactivado.* He bajado mis armas.`);
      }
      
      return m.reply(`Usa *${usedPrefix}antibots on* o *${usedPrefix}antibots off*.`);
    } catch (e) {
      return m.reply(`[Error]: ${e.message}`);
    }
  },

  // GUARDIÁN SILENCIOSO EN SEGUNDO PLANO
  all: async function (m, { client }) {
    if (!m.isGroup) return;
    const botJid = this.user?.id?.replace(/:\d+/, '').split('@')[0] + '@s.whatsapp.net';

    if (!_registeredListeners.has(this)) {
      _registeredListeners.add(this);
      this.ev?.on('group-participants.update', async (anu) => {
        try {
          if (anu.action !== 'add') return;
          const chatsData = global.db.data?.chats;
          if (!chatsData || !chatsData[anu.id]?.antibots) return;
          
          if (!chatsData[anu.id]._botJoinCache) chatsData[anu.id]._botJoinCache = {};
          const joinCache = chatsData[anu.id]._botJoinCache;
          const ourNums = getOurNumbers();
          
          for (const participantJid of anu.participants) {
            if (isOurBot(participantJid, ourNums)) continue;
            const num = participantJid.replace(/:\d+/, '').split('@')[0];
            joinCache[num] = Date.now();
          }
        } catch (_) {}
      });
    }

    const chatsData = global.db.data?.chats;
    if (!chatsData || !chatsData[m.chat]?.antibots) return;
    
    const chat = chatsData[m.chat];
    const ourNums = getOurNumbers();
    if (isOurBot(m.sender, ourNums)) return;
    const senderNum = m.sender.replace(/:\d+/, '').split('@')[0];

    let { detected, reason } = detectBot(m);
    
    if (!detected && chat._botJoinCache) {
      const joinTime = chat._botJoinCache[senderNum];
      if (joinTime && Date.now() - joinTime < 5000) {
        detected = true;
        reason = 'Mensaje automático al entrar';
      }
    }
    
    if (!detected) return;

    if (chat._botJoinCache && chat._botJoinCache[senderNum]) {
      delete chat._botJoinCache[senderNum];
    }

    const groupMetadata = await this.groupMetadata(m.chat).catch(() => null);
    if (!groupMetadata) return;
    
    await kickBot(this, m.chat, m.sender, groupMetadata, reason);
  }
};
