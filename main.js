import ws from 'ws';
import moment from 'moment';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import gradient from 'gradient-string';
import seeCommands from './core/system/commandLoader.js';
import initDB from './core/system/initDB.js';
import antilink from './cmds/antilink.js';
import { restrictedCommands, hasPremium, isSubBotJid } from './cmds/economy/premium.js'
import level from './cmds/level.js';
import { getGroupAdmins } from './core/message.js';
seeCommands();

export default async (client, m) => {
  const sender = m.sender;
  let body = m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || m.message.videoMessage?.caption || m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply?.selectedRowId || m.message.templateButtonReplyMessage?.selectedId || '';
  if ((m.id.startsWith("3EB0") || (m.id.startsWith("BAE5") && m.id.length === 16) || (m.id.startsWith("B24E") && m.id.length === 20))) return;
  initDB(m, client);
  antilink(client, m);

  // 🩸 PISO B6 - CONTADOR DE MENSAJES PARA #TOPON
if (m.isGroup) {
    global.db.data.chats[m.chat] ||= {}
    global.db.data.chats[m.chat].users ||= {}
    global.db.data.chats[m.chat].users[m.sender] ||= {
        msgCount: 0,
        lastSeen: Date.now()
    }
    global.db.data.chats[m.chat].users[m.sender].msgCount += 1
    global.db.data.chats[m.chat].users[m.sender].lastSeen = Date.now()
}


  const from = m.key.remoteJid;
  const botJid = client.user.id.split(':')[0] + '@s.whatsapp.net' || client.user.lid;
  const chat = global.db.data.chats[m.chat] || {};
  const settings = global.db.data.settings[botJid] || {};
  const user = global.db.data.users[sender] ||= {};
  const users = chat.users[sender] || {};
  const pushname = m.pushName || 'Sin nombre';

  // ==========================================
  // CORTAFUEGOS ANTI-SPAM ULTRA POTENTE (CERO RAM)
  // ==========================================
  if (user?.banned && !global.owner.map(num => num + '@s.whatsapp.net').includes(sender)) {
    return;
  }

  // ==========================================
  // INTERCEPTOR DE CONFIRMACIÓN PARA "KICKINACTIVE"
  // ==========================================
global.db.data.userBans ||= {}

if (global.db.data.userBans[m.sender]?.banned) {
  return
}



  if (m.quoted && m.text && m.text.trim().toUpperCase() === 'SI') {
    const chatJid = m.chat;
    global.purgasActivas = global.purgasActivas || {};

    if (global.purgasActivas[chatJid] && global.purgasActivas[chatJid].estado === 'esperando_confirmacion') {
      const dataPurga = global.purgasActivas[chatJid];

      if (m.sender === dataPurga.senderOriginal) {
        dataPurga.estado = 'eliminando';
        
        await client.sendMessage(chatJid, { 
          text: `🚀 *Confirmación aceptada.* Iniciando la purga de ${dataPurga.usuarios.length} miembros inactivos. Esto tomará un momento...` 
        }, { quoted: m });

        (async () => {
          const { delay } = await import('@whiskeysockets/baileys').catch(() => ({ delay: (ms) => new Promise(r => setTimeout(r, ms)) }));

          for (const usuarioJid of dataPurga.usuarios) {
            if (!global.purgasActivas[chatJid] || !global.purgasActivas[chatJid].bucle) {
              break;
            }

            try {
              await client.groupParticipantsUpdate(chatJid, [usuarioJid], 'remove');
              await delay(3500); 
            } catch (err) {
              console.error(`No se pudo eliminar a ${usuarioJid}:`, err);
            }
          }

          if (global.purgasActivas[chatJid] && global.purgasActivas[chatJid].bucle) {
            await client.sendMessage(chatJid, { text: '🏁 *Proceso terminado.* Los miembros inactivos han sido purgados de la línea temporal.' });
          }
          delete global.purgasActivas[chatJid];
        })();
      } else {
        await client.sendMessage(chatJid, { text: '⏳ Error: Solo el administrador que inició el escaneo puede dar la orden de proceder.' }, { quoted: m });
      }
    }
  }







  let groupMetadata = null;
  let groupAdmins = []
  let groupName = ''
  if (m.isGroup) {
    groupMetadata = await client.groupMetadata(m.chat).catch(() => null);
    groupName = groupMetadata?.subject || '';
    groupAdmins = groupMetadata?.participants.filter(p => (p.admin === 'admin' || p.admin === 'superadmin')) || [];
  }
  const isBotAdmins = m.isGroup ? groupAdmins.some(p => p.phoneNumber === botJid || p.jid === botJid || p.id === botJid || p.lid === botJid) : false;
  const isAdmins = m.isGroup ? groupAdmins.some(p => p.phoneNumber === sender || p.jid === sender || p.id === sender || p.lid === sender) : false;
  const isOwners = [botJid, ...(settings.owner ? [settings.owner] : []), ...global.owner.map(num => num + '@s.whatsapp.net')].includes(sender);

  for (const name in global.plugins) {
    const plugin = global.plugins[name];
    if (plugin && typeof plugin.all === "function") {
      try {
        await plugin.all.call(client, m, { client });
      } catch (err) {
        console.error(`Error xd en plugin.all -> ${name}`, err);
      }
    }
  }

  const today = new Date().toLocaleDateString('es-CO', { timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit' }).split('/').reverse().join('-');
  if (!users.stats) users.stats = {};
  if (!users.stats[today]) users.stats[today] = { msgs: 0, cmds: 0 };
  users.stats[today].msgs++;

  const rawBotname = settings.namebot || 'Kurumi';
  const tipo = settings.type || 'Sub';
  const cleanBotname = rawBotname.replace(/[^a-zA-Z0-9\s]/g, '');
  const namebot = cleanBotname || 'Kurumi ';
  const shortForms = [namebot.charAt(0), namebot.split(" ")[0], tipo.split(" ")[0], namebot.split(" ")[0].slice(0, 2), namebot.split(" ")[0].slice(0, 3)];
  const prefixes = shortForms.map(name => `${name}`);
  prefixes.unshift(namebot);
  let prefix;
  if (Array.isArray(settings.prefix) || typeof settings.prefix === 'string') {
    const prefixArray = Array.isArray(settings.prefix) ? settings.prefix : [settings.prefix];
    prefix = new RegExp('^(' + prefixes.join('|') + ')?(' + prefixArray.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')', 'i');
  } else if (settings.prefix === true) {
    prefix = new RegExp('^', 'i');
  } else {
    prefix = new RegExp('^(' + prefixes.join('|') + ')?', 'i');
  }
  const strRegex = (str) => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
  let pluginPrefix = client.prefix ? client.prefix : prefix;
  let matchs = pluginPrefix instanceof RegExp ? [[pluginPrefix.exec(m.text), pluginPrefix]] : Array.isArray(pluginPrefix) ? pluginPrefix.map(p => {
    let regex = p instanceof RegExp ? p : new RegExp(strRegex(p));
    return [regex.exec(m.text), regex];
  }) : typeof pluginPrefix === 'string' ? [[new RegExp(strRegex(pluginPrefix)).exec(m.text), new RegExp(strRegex(pluginPrefix))]] : [[null, null]];
  let match = matchs.find(p => p[0]);

  for (const name in global.plugins) {
    const plugin = global.plugins[name];
    if (!plugin) continue;
    if (plugin.disabled) continue;
    if (typeof plugin.before === "function") {
      try {
        if (await plugin.before.call(client, m, { client })) {
          continue;
        }
      } catch (err) {
        console.error(`Error en plugin.all -> ${name}`, err);
      }
    }
  }

  if (!match) return;
  let usedPrefix = (match[0] || [])[0] || '';
  let args = m.text.slice(usedPrefix.length).trim().split(" ");
  let command = (args.shift() || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  let text = args.join(' ');
  if (!command) return;

  const chatData = global.db.data.chats[from] || {};
  const consolePrimary = chatData.primaryBot;
  if (m.message || !consolePrimary || consolePrimary === botJid) {
console.log(chalk.bold.red(`╭═━═━═『 🩸 𝗞𝗨𝗥𝗨𝗠𝗜 𝗣𝗥𝗢𝗧𝗢𝗖𝗢𝗟 』═━═━═╮\n║ ${chalk.cyanBright('𝗕𝗼𝘁')}: ${gradient('red', 'black')(botJid)}\n║ ${chalk.bold.yellowBright('𝗙𝗲𝗰𝗵𝗮')}: ${gradient('orange', 'red')(moment().format('DD/MM/YY HH:mm:ss'))}\n║ ${chalk.bold.blueBright('𝗨𝘀𝘂𝗮𝗿𝗶𝗼')}: ${gradient('cyan', 'magenta')(`『 𝗡𝗔𝗡𝗢 𝗩𝗢𝗜𝗗 』 ${pushname}`)}\n║ ${chalk.bold.magentaBright('𝗥𝗲𝗺𝗶𝘁𝗲𝗻𝘁𝗲')}: ${gradient('blue', 'purple')(sender)}\n${m.isGroup ? '║' + chalk.bold.greenBright(' 𝗚𝗿𝘂𝗽𝗼') + ': ' + gradient('lime', 'green')(groupName) : '║' + chalk.bold.greenBright(' 𝗣𝗿𝗶𝘃𝗮𝗱𝗼') + ': ' + gradient('pink', 'red')('Chat Privado')}\n${'║' + chalk.bold.magenta(' 𝗜𝗗') + ': ' + gradient('purple', 'blue')(m.isGroup ? from : 'Chat Privado')}\n║ ${chalk.bold.redBright('𝗖𝗼𝗺𝗮𝗻𝗱𝗼')}: ${chalk.bgBlack.redBright(` ${command ? command : 'No Command'} `)}\n╰═━🔫═━🔫═━╯\n`));


  }

  const hasPrefix = settings.prefix === true ? true : (Array.isArray(settings.prefix) ? settings.prefix : typeof settings.prefix === 'string' ? [settings.prefix] : []).some(p => m.text?.startsWith(p));
  function getAllSessionBots() {
    const sessionDirs = ['./Sessions/Subs']
    let bots = []
    for (const dir of sessionDirs) {
      try {
        const subDirs = fs.readdirSync(path.resolve(dir))
        for (const sub of subDirs) {
          const credsPath = path.resolve(dir, sub, 'creds.json')
          if (fs.existsSync(credsPath)) {
            bots.push(sub + '@s.whatsapp.net')
          }
        }
      } catch {}
    }
    try {
      const ownerCreds = path.resolve('./Sessions/Owner/creds.json')
      if (fs.existsSync(ownerCreds)) {
        const ownerId = global.client.user.id.split(':')[0] + '@s.whatsapp.net'
        bots.push(ownerId)
      }
    } catch {}
    return bots;
  }
  const botprimaryId = chat?.primaryBot
  if (botprimaryId && botprimaryId !== botJid) {
    if (hasPrefix) {
      const participants = m.isGroup ? (await client.groupMetadata(m.chat).catch(() => ({ participants: [] }))).participants : []
      const primaryInGroup = participants.some(p => (p.phoneNumber || p.id) === botprimaryId)
      const isPrimarySelf = botprimaryId === botJid
      const primaryInSessions = getAllSessionBots().includes(botprimaryId)
      if (!primaryInSessions || !primaryInGroup) {
        return
      }
      if ((primaryInSessions && primaryInGroup) || isPrimarySelf) {
        return;
      }
    }
  }

// ===========================

// =============================================
// ANTIPRIVADO - Ignorar desconocidos en privado
// =============================================
const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
const antiprivado = global.db.data.settings?.[botId]?.antiprivado ?? false

if (antiprivado) {
  const isGroup = m.isGroup
  const isOwner = global.owner.includes(m.sender.split('@')[0])
  const isPrivate = !isGroup

  if (isPrivate && !isOwner) {
    // Verificar si tiene prefix (#/.!)
    const prefixes = ['#', '.', '!', '/']
    const msgText = m.text || ''
    const hasPrefix = prefixes.some(p => msgText.startsWith(p))

    if (hasPrefix) {
      return // Ignorar silenciosamente
    }
  }
}
// =============================================


  if (!isOwners && settings.self) return;
  if (m.chat && !m.chat.endsWith('g.us')) {
    const allowedInPrivateForUsers = ['allmenu', 'help', 'menu', 'infobot', 'botinfo', 'invite', 'invitar', 'ping', 'speed', 'p', 'status', 'estado', 'report', 'reporte', 'sug', 'suggest', 'token', 'join', 'unir', 'logout', 'reload', 'self', 'setbanner', 'setbotbanner', 'setchannel', 'setbotchannel', 'setbotcurrency', 'setcurrency', 'seticon', 'setboticon', 'setlink', 'setbotlink', 'setbotname', 'setname', 'setbotowner', 'setowner', 'setimage', 'setpfp', 'setprefix', 'setbotprefix', 'setstatus', 'setusername', 'code', 'qr'];
    if (!global.owner.map(num => num + '@s.whatsapp.net').includes(sender) && !allowedInPrivateForUsers.includes(command)) return;
  }
  if (chat?.isBanned && !(command === 'bot' && text === 'on') && !global.owner.map(num => num + '@s.whatsapp.net').includes(sender)) {
    await m.reply(`ꕥ El bot *${settings.botname}* está desactivado en este grupo.\n\n> ✎ Un *administrador* puede activarlo con el comando:\n> » *${usedPrefix}bot on*`);
    return;
  }
// ===========================
// SISTEMA PREMIUM ❄️
// ===========================
const isSubBot2 = isSubBotJid(botJid)
const isOwnerUser2 = global.owner.includes(m.sender.split('@')[0])

console.log(chalk.gray(`[PREMIUM] botJid=${botJid} isSubBot=${isSubBot2} cmd=${command}`))

if (isSubBot2 && !isOwnerUser2 && restrictedCommands.has(command)) {
  if (!hasPremium(m.sender)) {
    const banner = global.getBocchiBanner?.() || 'https://files.catbox.moe/5jorq4.jpg'
    await client.sendMessage(m.chat, {
      image: { url: banner },
      caption: `┏━━━━━✦❘༻👑༺❘✦━━━━━┓\n┃ —͟͞ ♱ *COMANDO PREMIUM* ♱ —͟͞\n┗━━━━━✦❘༻👑༺❘✦━━━━━┛\n\n|🜸 El comando *${usedPrefix + command}* no está disponible en *Sub-Bots* sin Premium.\n\n╭─━━━⊱ *¿CÓMO?* ⊰━━━─╮\n│ |🜸 Gana con *${usedPrefix}work*\n│ |🜸 Reclama *${usedPrefix}daily*\n│ |🜸 Compra *${usedPrefix}premium*\n│\n│ *1h* → 500 coins\n│ *1d* → 2,000 coins\n│ *7d* → 10,000 coins\n╰─━━━⊱✧༻♱༺✧⊰━━━─╯\n\n> ❄️ *Kurumi Protocol* - NanoVoid 💜`,
      contextInfo: {
        externalAdReply: {
          title: '👑 Comando Premium',
          body: `Usa ${usedPrefix}premium`,
          mediaType: 1,
          thumbnailUrl: banner,
          renderLargerThumbnail: false
        }
      }
    }, { quoted: m })
    return
  }
}
// ===========================
// ===========================
// Verificación de registro
const sinRegistro = [
  'reg', 'registro', 'registrar', 'registrarme', 'register',
  'menu', 'help', 'allmenu', 'ping', 'speed', 'p',
  'infobot', 'botinfo', 'invite', 'invitar',
  'status', 'estado'
]

if (!isOwners && !user.registered && !sinRegistro.includes(command)) {

  const banners = [
    'https://files.catbox.moe/318335.jpg',
    'https://files.catbox.moe/6fg7wn.jpg',
    'https://files.catbox.moe/otwwqo.jpg',
    'https://files.catbox.moe/gj8kzx.jpg',
    'https://files.catbox.moe/mh97wx.jpg'
  ]

  const banner = banners[Math.floor(Math.random() * banners.length)]

  const mensajes = [

`╭━━━〔 🩸 𝙍𝙖𝙘𝙝𝙚𝙡 𝙂𝙖𝙧𝙙𝙣𝙚𝙧 〕━━━╮
┃ ⚠️ ¿Quién eres tú...?
┃ ✎ No puedo dejarte entrar todavía.
┃ ❏ Primero debes registrarte.
┃
┃ ➥ Usa:
┃ ➥ *${usedPrefix}reg Nombre.Edad*
┃
┃ ✨ Ejemplo:
┃ ➥ *${usedPrefix}reg Nano.15*
╰━━━━━━━━━━━━━━━━━━━━━━━╯

> _“Si quieres quedarte conmigo... demuestra quién eres.”_ 🩸`,

`╭━━━〔 🩸 𝘼𝙣𝙜𝙚𝙡𝙨 𝙤𝙛 𝘿𝙚𝙖𝙩𝙝 〕━━━╮
┃ 🚫 Acceso denegado.
┃ ✎ Rachel no reconoce tu identidad.
┃ ❏ Registro obligatorio para continuar.
┃
┃ ➥ Comando:
┃ ➥ *${usedPrefix}reg Nombre.Edad*
╰━━━━━━━━━━━━━━━━━━━━━━━╯

> _“No me gusta hablar con desconocidos...”_ 🌑`,

`╭━━━〔 🩸 𝙍𝙖𝙘𝙝𝙚𝙡 𝙎𝙮𝙨𝙩𝙚𝙢 〕━━━╮
┃ ❓ Usuario desconocido detectado.
┃ ✎ Tus datos no existen todavía.
┃
┃ 📌 Regístrate usando:
┃ ➥ *${usedPrefix}reg Nombre.Edad*
┃
┃ ✨ Ejemplo:
┃ ➥ *${usedPrefix}reg Zack.20*
╰━━━━━━━━━━━━━━━━━━━━━━━╯

> _“Quizás después pueda confiar en ti...”_ 🕯️`,

`╭━━━〔 🩸 𝙍𝙖𝙘𝙝𝙚𝙡 𝙂𝙖𝙧𝙙𝙣𝙚𝙧 〕━━━╮
┃ ⚠️ Espera...
┃ ✎ No apareces en mis registros.
┃ ❏ Debes registrarte antes.
┃
┃ ➥ Usa:
┃ ➥ *${usedPrefix}reg Nombre.Edad*
╰━━━━━━━━━━━━━━━━━━━━━━━╯

> _“No quiero perderme otra vez...”_ 🌧️`,

`╭━━━〔 🩸 𝘿𝙚𝙖𝙩𝙝 𝙁𝙡𝙤𝙤𝙧 〕━━━╮
┃ 🚪 Acceso bloqueado.
┃ ✎ Rachel está observándote...
┃ ❏ Identifícate para continuar.
┃
┃ ➥ *${usedPrefix}reg Nombre.Edad*
╰━━━━━━━━━━━━━━━━━━━━━━━╯

> _“Tal vez puedas acompañarme...”_ 🔪`
  ]

  const msg = mensajes[Math.floor(Math.random() * mensajes.length)]

  try {
    await client.sendMessage(m.chat, {
      text: msg,
      contextInfo: {
        externalAdReply: {
          title: '🩸 Rachel Gardner - Register',
          body: '🌑 Sistema de identificación requerido',
          thumbnailUrl: banner,
          sourceUrl: 'https://kurumi-tokisha-65e2e9.netlify.app/',
          mediaType: 1,
          renderLargerThumbnail: false,
          showAdAttribution: false
        },
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363427643259597@newsletter',
          newsletterName: '『 𝙍𝙖𝙘𝙝𝙚𝙡 𝙂𝙖𝙧𝙙𝙣𝙚𝙧 』',
          serverMessageId: 1
        }
      }
    }, { quoted: m })
  } catch (_) {
    await m.reply(msg)
  }

  return
}

  if (!users.stats) users.stats = {};
  if (!users.stats[today]) users.stats[today] = { msgs: 0, cmds: 0 };
  if (chat.adminonly && !isAdmins) return;
  const cmdData = global.comandos.get(command);
  if (!cmdData) {
    if (settings.prefix === true) return;
    await client.readMessages([m.key]);

    // Lista de respuestas críticas y random al puro estilo de Kurumi

const criticasComando = [
  {
    img: 'https://files.catbox.moe/318335.jpg',
    txt: `╭━━━〔 🩸 𝙍𝙖𝙘𝙝𝙚𝙡 𝙂𝙖𝙧𝙙𝙣𝙚𝙧 〕━━━╮
┃ ❓ ¿Qué mierda es *${command}*?
┃ ✎ Ese comando no existe aquí.
┃ ❏ Usa *${usedPrefix}menu*
╰━━━━━━━━━━━━━━━━━━━━━━━╯
> _"Quizá estás perdido..."_ 🌧️`
  },

  {
    img: 'https://files.catbox.moe/6fg7wn.jpg',
    txt: `╭━━━〔 ☠️ 𝘼𝙣𝙜𝙚𝙡𝙨 𝙊𝙛 𝘿𝙚𝙖𝙩𝙝 〕━━━╮
┃ Que mierda es *${command}?*
┃ ✎ esa mierda no existe mierda 
┃ ❏ Revisa *${usedPrefix}help*
╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯
> _"No hagas perder mi tiempo..."_ 🥀`
  },

  {
    img: 'https://files.catbox.moe/otwwqo.jpg',
    txt: `╭━━━〔 🌧️ 𝙍𝙖𝙘𝙝𝙚𝙡 〕━━━╮
┃ ❌ *${command}* no existe.
┃ ✎ ¿Te inventas comandos o qué?
┃ ❏ Usa *${usedPrefix}menu*
╰━━━━━━━━━━━━━━━━━━━━━━╯
> _"Incluso Zack entiende mejor..."_ 🔪`
  },

  {
    img: 'https://files.catbox.moe/gj8kzx.jpg',
    txt: `╭━━━〔 🩸 𝙍𝙖𝙘𝙝𝙚𝙡 𝙎𝙮𝙨𝙩𝙚𝙢 〕━━━╮
┃ esa cagada que mierda 
┃ ✎ *${command}*
┃ ❏ Usa *${usedPrefix}help*
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
> _"Qué decepción..."_ ☁️`
  },

  {
    img: 'https://files.catbox.moe/mh97wx.jpg',
    txt: `╭━━━〔 🔪 𝙍𝙖𝙘𝙝𝙚𝙡 〕━━━╮
┃ te hace falta cerebro mierda? esa madre
┃ ✎ *${command}*?
┃ ❏ no existe pendejo 
╰━━━━━━━━━━━━━━━━━━━━━━╯
> _"Tu lógica da miedo..."_ 💔`
  },

  {
    img: 'https://files.catbox.moe/318335.jpg',
    txt: `╭━━━〔 ☠️ 𝘿𝙀𝘼𝘿 𝙀𝙉𝘿 〕━━━╮
┃ ✎ usa *menu* mierda el *${command}*
┃ ❌es una cagada total mierda .
┃ ❏ Usa *${usedPrefix}menu*
╰━━━━━━━━━━━━━━━━━━━━━━━╯
> _"Ni los fantasmas usan eso..."_ 🌧️`
  },

  {
    img: 'https://files.catbox.moe/6fg7wn.jpg',
    txt: `╭━━━〔 🌑 𝙍𝙖𝙘𝙝𝙚𝙡 〕━━━╮
┃ ⚠️ *${command}* no existe.
┃ ✎ Tu cerebro tampoco parece.
┃ ❏ Usa *${usedPrefix}help*
╰━━━━━━━━━━━━━━━━━━━━━━╯
> _"Necesitas ayuda..."_ 🥀`
  },

  {
    img: 'https://files.catbox.moe/otwwqo.jpg',
    txt: `╭━━━〔 🩸 𝙎𝙔𝙎𝙏𝙀𝙈 〕━━━╮
┃ ❌ que pendejo usando
┃ ✎ *${command}* como si existiera igual que tu cerebro 🧠.
┃ ❏ Abre *${usedPrefix}menu*
╰━━━━━━━━━━━━━━━━━━━━━━━╯
> _"Qué vergüenza..."_ ☠️`
  },

  {
    img: 'https://files.catbox.moe/gj8kzx.jpg',
    txt: `╭━━━〔 ☁️ 𝙍𝙖𝙘𝙝𝙚𝙡 〕━━━╮
┃ ❓ Intentaste usar:
┃ ✎ *${command}*
┃ ❌ Resultado: fracasado absoluto.
╰━━━━━━━━━━━━━━━━━━━━━━╯
> _"Das pena..."_ 🌧️`
  },

  {
    img: 'https://files.catbox.moe/mh97wx.jpg',
    txt: `╭━━━〔 🔪 𝘼𝙉𝙂𝙀𝙇𝙎 𝙊𝙁 𝘿𝙀𝘼𝙏𝙃 〕━━━╮
┃ ⚠️ El comando *${command}*
┃ ✎ jamás existió.
┃ ❏ Usa *${usedPrefix}menu*
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
> _"Tu IQ me preocupa..."_ 💀`
  },

  {
    img: 'https://files.catbox.moe/318335.jpg',
    txt: `╭━━━〔 ☠️ 𝙕𝙖𝙘𝙠 〕━━━╮
┃  ya das pena con.
┃ ✎ *${command}* .
┃ ❏ no existe mejor no uses el bot das asco. *${usedPrefix}menu* o te corta.
╰━━━━━━━━━━━━━━━━━━━━━━━╯
> _"Tiene razón..."_ 🔪`
  },

  {
    img: 'https://files.catbox.moe/6fg7wn.jpg',
    txt: `╭━━━〔 🩸 𝙍𝙖𝙘𝙝𝙚𝙡 𝙂𝙖𝙧𝙙𝙣𝙚𝙧 〕━━━╮
┃ ⚠️ Nivel de pena ajena: INFINITO
┃ ✎ Escribiste *${command}* y el Piso B6 se rió.
┃ ❏ *${usedPrefix}help* antes de que me dé diabetes.
╰━━━━━━━━━━━━━━━━━━━━━━━╯
> _"Qué vergüenza contigo..."_ 🌑`
  },

  {
    img: 'https://files.catbox.moe/otwwqo.jpg',
    txt: `╭━━━〔 ☠️ 𝙋𝙞𝙨𝙤 𝘽6 〕━━━╮
┃ ❌  esa basura de *${command}*
┃ ✎ no existe mierda .
┃ ❏ *${usedPrefix}menu* pa que no empeores.
╰━━━━━━━━━━━━━━━━━━━━━━━╯
> _"Caso clínico..."_ 🔪`
  },

  {
    img: 'https://files.catbox.moe/gj8kzx.jpg',
    txt: `╭━━━〔 🌑 𝙍𝙖𝙮.𝙚𝙭𝙚 〕━━━╮
┃ apoco 
┃ ✎  *${command}*
┃ ❏ existe igual que tú cerebro 🧠? *${usedPrefix}help*
╰━━━━━━━━━━━━━━━━━━━━━━━╯
> _"Sistema corrupto..."_ 🩸`
  },

  {
    img: 'https://files.catbox.moe/mh97wx.jpg',
    txt: `╭━━━〔 🔪 𝙂𝙤𝙙'𝙨 𝙅𝙪𝙙𝙜𝙚𝙢𝙚𝙣𝙩 〕━━━╮
┃ ⚖️ ese mierdero
┃ ✎ *${command}*
┃ ✎ que, mejor borra esa cagada 
┃ ❏ *${usedPrefix}menu* pa pedir perdón.
╰━━━━━━━━━━━━━━━━━━━━━━━╯
> _"Condenado..."_ ☠️`
  }
]

// ESTO VA DONDE RESPONDE EL COMANDO INVÁLIDO:
const randomCritica = criticasComando[Math.floor(Math.random() * criticasComando.length)]

await client.sendMessage(m.chat, {
  text: randomCritica.txt, // ← SOLO TEXTO, SIN IMAGE:
  contextInfo: {
    externalAdReply: {
      title: '🩸 Rachel Gardner - Angels of Death',
      body: '☁️ Comando inexistente detectado...',
      thumbnailUrl: randomCritica.img, // ← MINI THUMBNAIL SOLO AQUÍ
      sourceUrl: 'https://kurumi-tokisha-65e2e9.netlify.app/',
      mediaType: 1,
      renderLargerThumbnail: false, // ← FALSE = MINI
      showAdAttribution: false
    },
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: '120363427643259597@newsletter',
      newsletterName: '『 𝙍𝙖𝙘𝙝𝙚𝙡 𝙂𝙖𝙧𝙙𝙣𝙚𝙧 』',
      serverMessageId: 1
    }
  }
}, { quoted: m })
return


    // Selecciona una crítica al azar
    const respuestaCritica = criticasComando[Math.floor(Math.random() * criticasComando.length)];
    return m.reply(respuestaCritica);
  }
  if (cmdData.isOwner && !global.owner.map(num => num + '@s.whatsapp.net').includes(sender)) {
    if (settings.prefix === true) return;
    return m.reply(`ꕤ El comando *${command}* no existe.\n✎ Usa *${usedPrefix}help* para ver la lista de comandos disponibles.`);
  }
  if (cmdData.isAdmin && !isAdmins) return client.reply(m.chat, mess.admin, m);
  if (cmdData.botAdmin && !isBotAdmins) return client.reply(m.chat, mess.botAdmin, m);
  try {
    await client.readMessages([m.key]);
    user.usedcommands = (user.usedcommands || 0) + 1;
    settings.commandsejecut = (settings.commandsejecut || 0) + 1;
    users.usedTime = new Date();
    users.lastCmd = Date.now();
    user.exp = (user.exp || 0) + Math.floor(Math.random() * 100);
    user.name = m.pushName;
    users.stats[today].cmds++;
    await cmdData.run(client, m, args, usedPrefix, command, text);
  } catch (error) {
    await client.sendMessage(m.chat, { text: `《✧》 Error al ejecutar el comando\n${error}` }, { quoted: m });
  }
  level(m);
};
