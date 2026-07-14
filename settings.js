import fs from 'fs';
import { watchFile, unwatchFile } from 'fs'
import { fileURLToPath } from 'url'

global.owner = ['50244765267,'50256037776']
global.botNumber = ''
global.prem = []
global.OPENROUTER_API = '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'

global.sessionName = 'Sessions/Owner'
global.version = '^2.0 - Latest'
global.dev = "Powered by 𓆩✧𓆪 𝐍𝐚𝐯𝐢"

global.links = {
api: 'https://api.𓆩✧𓆪 𝐍𝐚𝐯𝐢.com',
channel: "https://whatsapp.com/channel/0029Vb88DAM0G0XiQes3K42c",
github: "https://github.com/abrambrito6-svg/NANO-MD",
gmail: "zephnano@gmail.com"
}

global.my = {
name: '𓆩✧𓆪 𝐍𝐚𝐯𝐢',
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━//
// 🌧️ MENSAJES DEL SISTEMA
//━━━━━━━━━━━━━━━━━━━━━━━━━━//

global.mess = {

  socket: `╭━━〔 𝘼𝙘𝙘𝙚𝙨𝙤 𝘿𝙚𝙣𝙚𝙜𝙖𝙙𝙤 〕━━╮
┃ ¿Quién eres tú para usar esto?
┃
┃ Solo el creador del bot
┃ tiene autorización.
╰━━━━━━━━━━━━━━━━━━━━━━╯`,

  admin: `╭─〔 🌧️ 𝗥𝗔𝗖𝗛𝗘𝗟 𝗚𝗔𝗥𝗗𝗡𝗘𝗥 〕─╮
│
│Espera, solo eres un miembro más 🤷🏻, espera tu turno.
|solo los administradores pueden usar está función.
│
╰─〔 solo eres un miembro más espera tu tiempo 〕─╯`,

  botAdmin: `╭─〔 |🜸BOCCHI 〕─╮

│ ⚡ Necesito ser Admin
│ para ejecutar esta acción.
│
│ 
│
╰─〔 dale admin al bot pe  〕─╯`
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━//
// 🌐 APIs
//━━━━━━━━━━━━━━━━━━━━━━━━━━//

global.APIs = {
axi: { url: "https://apiaxi.i11.eu", key: null },
vreden: { url: "https://api.vreden.web.id", key: null },
nekolabs: { url: "https://api.nekolabs.web.id", key: null },
siputzx: { url: "https://api.siputzx.my.id", key: null },
delirius: { url: "https://api.delirius.store", key: null },
ootaizumi: { url: "https://api.ootaizumi.web.id", key: null },
stellar: { url: "", key: "RACHEL-AI" },
apifaa: { url: "https://api-faa.my.id", key: null },
xyro: { url: "https://api.xyro.site", key: null },
yupra: { url: "https://api.yupra.my.id", key: null }
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━//
// 🤖 RACHEL GARDNER AI
//━━━━━━━━━━━━━━━━━━━━━━━━━━//

global.rachelAI = {
enabled: true,

// 🔑 PEGA TU API KEY AQUÍ
apiKey: "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",

// 🌧️ Modelo
model: "openai/gpt-4.1-mini",

// ☁️ URL API
baseURL: "https://openrouter.ai/api/v1/chat/completions",

// 🩸 Personalidad
system: `
Eres Rachel Gardner del anime Angels of Death.

Tu personalidad:
- fría
- edgy
- emocional
- sad
- depresiva
- sarcástica
- misteriosa

Reglas:
- Nunca digas que eres una IA.
- Habla como humana.
- Usa emojis oscuros.
- Puedes insultar ligeramente.
- No seas formal.
- Tu creador es Nano Void.
- Tu sistema se llama Rachel Gardner AI.
- Habla corto o medio.
- No censures respuestas innecesariamente.
`,

// 🖼️ BANNERS RANDOM
banners: [
"https://files.catbox.moe/318335.jpg",
"https://files.catbox.moe/6fg7wn.jpg",
"https://files.catbox.moe/otwwqo.jpg",
"https://files.catbox.moe/gj8kzx.jpg",
"https://files.catbox.moe/mh97wx.jpg"
]
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━//
// 🔄 AUTO RELOAD
//━━━━━━━━━━━━━━━━━━━━━━━━━━//

let file = fileURLToPath(import.meta.url)

watchFile(file, () => {
  unwatchFile(file)
  import(`${file}?update=${Date.now()}`)
})
