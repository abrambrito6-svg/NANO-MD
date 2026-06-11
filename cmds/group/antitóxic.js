const NL = {
  contextInfo: {
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: '120363427643259597@newsletter',
      newsletterName: '『 𝙕𝙖𝙛𝙠ι𝙚λ 𝘾𝙝𝙖𝙣𝗻𝙚𝙡 』',
      serverMessageId: 1
    }
  }
}


const toxicWords = [
"puta", "puto", "mierda", "joto", "maricon", "maricón", "pendejo", "pendeja",
"verga", "pito", "culo", "cabrón", "cabron", "zorra", "perra", "gilipollas",
"idiota", "imbecil", "imbécil", "estupido", "estúpido", "maldito", "maldita",
"joder", "carajo", "coño", "hostia", "polla", "huevos", "chingar", "chinga",
"ola", "gay", "Chupenla", "🖕🏻💩💔🥀", "nigger", "nigga",
"ptm", "ptmr", "ctm", "ctmr", "ctmre", "csm", "csmr", "conchetumadre", "conchatumadre",
"concha", "recontramrd", "recontrapelotudo", "pelotudo", "pelotuda", "boludo", "boluda",
"chucha", "chuchatumadre", "xuxa", "tmr", "mrda", "mrk", "kbro", "kbrn", "qlo", "qlao", "qliao",
"hdp", "hdtpm", "pt", "ptas", "mierd", "malparido", "malparida", "gonorrea",
"careverga", "carechimba", "carepicha", "caremondá", "pirobo", "piroba", "sapo",
"mamaguevo", "mamahuevo", "mamon", "mamona",
"pene", "cojuda", "webon", "weon", "wbn", "huevon", "huevona", "pajero", "pajera",
"marica", "marico", "marik", "mk", "mka", "chimba", "chimbo",
"porqueria", "porquería", "basura", "escoria", "rata", "lacra", "mierdero",
"choto", "chota", "orto", "ortiba", "forro", "forra", "trolo", "trola",
"mogolico", "mogólico", "mogolica", "mogólica", "autista", "down", "retrasado", "retrasada",

"uta", "pt", "pt4", "pucta", "mrd", "mrd4", "kchudo", "kchuda", "kcha", "kchetumare",
"rcsm", "rcsmr", "recontracsm", "recontracsmr", "kagon", "kagona", "kagada", "kagao",
"asno", "burro", "bestia", "animal", "salvaje", "indio", "india", "cholo", "chola",
"serrano", "serrana", "chuncho", "chuncha", "motoso", "motosa", "misio", "misia",
"cachinero", "cachinera", "cagón", "cagona", "cagado", "cagada", "meon", "meona",
"zorrupio", "zorrupia", "chuchesumadre", "rechuchetumadre", "chuchetumare", "xuxetumare",
"pendejazo", "pendejaza", "pendejito", "pendejita", "huevazoo", "huevazos", "huevonazo",
"huevonaza", "weonazo", "weonaza", "wea", "weas", "wbnazo", "wbnaza",
"perkinazo", "perkinaza", "perkinqliao", "perkincsm", "flaite", "flaiteqliao", "flaiteql",
"canero", "canera", "paco", "paca", "yuta", "tombos", "batracio", "bagre", "cuy",
"rata", "raton", "ratona", "ratita", "muca", "cuca", "cucaracha", "piojo", "piojoso",
"garrapata", "gusano", "gusanos", "lombriz", "pulga", "pulgas", "pulguiento",
"baboso", "babosa", "babosos", "babosas", "mocoso", "mocosa", "mocosoqliao",
"churreta", "churreto", "chorreado", "chorreada", "apestoso", "apestosa", "hediondo",
"hedionda", "cochino", "cochina", "sucio", "sucia", "asqueroso", "asquerosa",
"cerdo", "cerda", "chancho", "chancha", "puerco", "puerca", "marrano", "marrana",
"cabrilla", "cabrito", "cabronazo", "cabronaza", "cornudo", "cornuda", "cachudo",
"venado", "venada", "borrego", "borrega", "cordero", "cordera", "llama", "alpaca",
"vicuña", "guanaco", "zopenco", "zopenca", "tarado", "tarada", "gil", "gilazo",
"gilaza", "babieca", "babieco", "papanatas", "pancho", "pancha", "panflin",
"lornaza", "lorna", "lorno", "cojinova", "cojinovo", "sarnoso", "sarnosa",
"tiñoso", "tiñosa", "piojento", "piojenta", "roñoso", "roñosa", "pulgoso",
"pulguienta", "sarna", "tiña", "lepra", "leproso", "leprosa"
]



const warnedToxic = globalThis.__kurumiWarnedToxic ||= {}

// ╔══════════ USANDO 'all' (más confiable en tu bot) ══════════
export const all = async function (m, { client }) {
  try {
    if (!m.isGroup || m.fromMe) return

    const bot = (global.db.data.settings ||= {})[client.user?.id?.split(':')[0] + '@s.whatsapp.net'] ||= {}
    if (!bot.antitoxic) return

    // === Extracción agresiva de texto ===
    let text = (m.text || 
               m.body || 
               m.message?.conversation || 
               m.message?.extendedTextMessage?.text || 
               '').toString().toLowerCase().trim()

    if (!text) return

    // Proteger admins y owner
    try {
      const meta = await client.groupMetadata(m.chat)
      const isAdmin = meta.participants?.find(p => p.id === m.sender)?.admin
      const isOwner = (global.owner || []).some(([n]) => (n + '@s.whatsapp.net') === m.sender)
      if (isAdmin || isOwner) return
    } catch {}

    const sender = m.sender

    // Detección fuerte
    const isToxic = toxicWords.some(word => text.includes(word))

    if (!isToxic) return

    console.log(`[ANTI-TOXIC] 🔥 Detectado: "${text}" → ${sender}`)

    // Borrar mensaje
    await client.sendMessage(m.chat, { delete: m.key }).catch(() => {})

    // Kick directo por bypass con #
    if (text.startsWith('#') || text.includes(' #')) {
      await client.sendMessage(m.chat, {
        text: `╭━━━〔 𝙆𝙪𝙧𝙪𝙢𝙞 𝙏𝙤𝙠𝙞𝙨𝙖𝙠𝙞 〕━━━╮\n┃ 👺 Kick directo\n┃ @${sender.split('@')[0]}\n┃ ❏ Intento de bypass con #\n╰━━━━━━━━━━━━━━━━━━━━━╯`,
        mentions: [sender],
        ...NL
      }, { quoted: m })

      await client.groupParticipantsUpdate(m.chat, [sender], 'remove').catch(() => {})
      return
    }

    // Sistema de advertencias
    warnedToxic[sender] = (warnedToxic[sender] || 0) + 1
    const warns = warnedToxic[sender]

    if (warns === 1) {
      await client.sendMessage(m.chat, { 
        text: `⚠️ @${sender.split('@')[0]} Primera advertencia por insulto.`, 
        mentions: [sender], ...NL 
      }, { quoted: m })
    } 
    else if (warns === 2) {
      await client.sendMessage(m.chat, { 
        text: `⚠️ @${sender.split('@')[0]} Última advertencia.`, 
        mentions: [sender], ...NL 
      }, { quoted: m })
    } 
    else if (warns >= 3) {
      await client.sendMessage(m.chat, { 
        text: `👺 @${sender.split('@')[0]} Eliminad@ por insultos repetidos.`, 
        mentions: [sender], ...NL 
      }, { quoted: m })
      
      await client.groupParticipantsUpdate(m.chat, [sender], 'remove').catch(() => {})
      delete warnedToxic[sender]
    }

  } catch (e) {
    console.error('[ANTITOXIC ERROR]:', e)
  }
}

// ╔══════════ Comando ══════════
export default {
  command: ['antitoxic', 'antitoxico'],
  category: 'grupo',
  isAdmin: true,

  run: async (client, m, args) => {
    const bot = (global.db.data.settings ||= {})[client.user?.id?.split(':')[0] + '@s.whatsapp.net'] ||= {}
    const op = (args[0] || '').toLowerCase()

    if (op === 'on') {
      bot.antitoxic = true
      m.reply(`《✧》 𝑲𝒖𝒓𝒖𝒎𝒊 activó el **Anti-Tóxico ULTRA** ✿`)
    } else if (op === 'off') {
      bot.antitoxic = false
      m.reply(`《✧》 𝑲𝒖𝒓𝒖𝒎𝒊 desactivó el Anti-Tóxico.`)
    } else {
      m.reply(`Estado actual: ${bot.antitoxic ? '🟢 Activo' : '🔴 Inactivo'}\nUso: .antitoxic on/off`)
    }
  }
}
