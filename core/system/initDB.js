let isNumber = (x) => typeof x === 'number' && !isNaN(x)

function initDB(m, client) {
  const jid = client.user.id.split(':')[0] + '@s.whatsapp.net'

  const settings = global.db.data.settings[jid] ||= {}
  settings.self ??= false
  settings.prefix ??= ['/', '!', '.', '#']
  settings.commandsejecut ??= isNumber(settings.commandsejecut) ? settings.commandsejecut : 0
  settings.id ??= '120363427643259597@newsletter'
  settings.nameid ??= "☾『𝗦𝗵𝗶𝗿𝗼𝗸𝗼 𝗖𝗵𝗮𝗻𝗻𝗲𝗹』☽"
  settings.type ??= 'Owner'
  settings.link ??= 'https://api.kurumi-nano.my.id'
  settings.banner ??= 'https://files.catbox.moe/lwepuq.jpg'
  settings.icon ??= 'https://files.catbox.moe/i8qkky.jpg'
  settings.currency ??= '⟡ ShiroCoins'
  settings.namebot ??= '𖤐『𝗦𝗵𝗶𝗿𝗼𝗸𝗼 𝗠𝗗』' // <--- Cambiado para tu rebrand
  settings.botname ??= '☾『𝗦𝗵𝗶𝗿𝗼𝗸𝗼 𝗔𝗜』 '  
  settings.owner ??= ''

  // --- CONFIGURACIÓN DE USUARIO (GLOBAL) ---
  const user = global.db.data.users[m.sender] ||= {}
  user.name ??= m.pushName
  user.exp = isNumber(user.exp) ? user.exp : 0
  user.level = isNumber(user.level) ? user.level : 0
  user.usedcommands = isNumber(user.usedcommands) ? user.usedcommands : 0
  
  // NUEVAS VARIABLES PARA RANGOS
  user.msgs = isNumber(user.msgs) ? user.msgs : 0 // Contador total de mensajes
  user.role ??= 'NOVATO' // Rango inicial

  user.pasatiempo ??= ''
  user.description ??= ''
  user.marry ??= ''
  user.genre ??= ''
  user.birth ??= ''
  user.metadatos ??= null
  user.metadatos2 ??= null
  user.registered ??= false
  user.regName ??= ''
  user.regAge ??= 0
  user.premium ??= false
  user.premiumUntil ??= 0

  const chat = global.db.data.chats[m.chat] ||= {}
  chat.users ||= {}
  chat.isBanned ??= false
  chat.welcome ??= false
  chat.goodbye ??= false
  chat.sWelcome ??= ''
  chat.sGoodbye ??= ''
  chat.nsfw ??= false
  chat.alerts ??= true
  chat.gacha ??= true
  chat.economy ??= true
  chat.adminonly ??= false
  chat.primaryBot ??= null
  chat.antilinks ??= true

  // --- CONFIGURACIÓN DE USUARIO (EN ESTE CHAT) ---
  chat.users[m.sender] ||= {}
  chat.users[m.sender].stats ||= {}
  chat.users[m.sender].usedTime ??= null
  chat.users[m.sender].lastCmd = isNumber(chat.users[m.sender].lastCmd) ? chat.users[m.sender].lastCmd : 0
  chat.users[m.sender].coins = isNumber(chat.users[m.sender].coins) ? chat.users[m.sender].coins : 0
  chat.users[m.sender].bank = isNumber(chat.users[m.sender].bank) ? chat.users[m.sender].bank : 0
  chat.users[m.sender].afk = isNumber(chat.users[m.sender].afk) ? chat.users[m.sender].afk : -1
  chat.users[m.sender].afkReason ??= ''
  chat.users[m.sender].characters = Array.isArray(chat.users[m.sender].characters) ? chat.users[m.sender].characters : []
}

export default initDB;
