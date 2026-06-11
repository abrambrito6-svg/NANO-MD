import fetch from 'node-fetch'
import { resolveLidToRealJid } from "../../core/utils.js"

const captions = {
  peek: (from, to) => from === to ? '|🜸 está espiando detrás de una puerta.' : '|🜸 está espiando a',
  comfort: (from, to) => from === to ? '|🜸 se está consolando a sí mismo.' : '|🜸 está consolando a',
  thinkhard: (from, to) => from === to ? '|🜸 se quedó pensando muy intensamente.' : '|🜸 está pensando profundamente en',
  curious: (from, to) => from === to ? '|🜸 se muestra curioso por todo.' : '|🜸 está curioso por lo que hace',
  sniff: (from, to) => from === to ? '|🜸 se olfatea como si buscara algo.' : '|🜸 está olfateando a',
  stare: (from, to) => from === to ? '|🜸 se queda mirando al techo sin razón.' : '|🜸 se queda mirando fijamente a',
  trip: (from, to) => from === to ? '|🜸 se tropezó consigo mismo, otra vez.' : '|🜸 tropezó accidentalmente con',
  blowkiss: (from, to) => from === to ? '|🜸 se manda un beso al espejo.' : '|🜸 le lanzó un beso a',
  snuggle: (from, to) => from === to ? '|🜸 se acurruca con una almohada suave.' : '|🜸 se acurruca dulcemente con',
  sleep: (from, to) => from === to ? '|🜸 está durmiendo plácidamente.' : '|🜸 está durmiendo con',
  cold: (from, to) => from === to ? '|🜸 tiene mucho frío.' : '|🜸 se congela por el frío de',
  sing: (from, to) => from === to ? '|🜸 está cantando.' : '|🜸 le está cantando a',
  tickle: (from, to) => from === to ? '|🜸 se está haciendo cosquillas.' : '|🜸 le está haciendo cosquillas a',
  scream: (from, to) => from === to ? '|🜸 está gritando al viento.' : '|🜸 le está gritando a',
  push: (from, to) => from === to ? '|🜸 se empujó a sí mismo.' : '|🜸 empujó a',
  nope: (from, to) => from === to ? '|🜸 expresa claramente su desacuerdo.' : '|🜸 dice que no a',
  jump: (from, to) => from === to ? '|🜸 salta de felicidad.' : '|🜸 salta feliz con',
  heat: (from, to) => from === to ? '|🜸 siente mucho calor.' : '|🜸 tiene calor por',
  gaming: (from, to) => from === to ? '|🜸 está jugando solo.' : '|🜸 está jugando con',
  draw: (from, to) => from === to ? '|🜸 hace un lindo dibujo.' : '|🜸 dibuja inspirado en',
  call: (from, to) => from === to ? '|🜸 marca su propio número esperando respuesta.' : '|🜸 llamó al número de',
  seduce: (from, to) => from === to ? '|🜸 lanzó una mirada seductora al vacío.' : '|🜸 está intentando seducir a',
  shy: (from, to) => from === to ? '|🜸 se sonrojó tímidamente y desvió la mirada.' : '|🜸 se siente demasiado tímido con',
  slap: (from, to) => from === to ? '|🜸 se dio una bofetada a sí mismo.' : '|🜸 le dio una bofetada a',
  bath: (from, to) => from === to ? '|🜸 se está bañando.' : '|🜸 está bañando a',
  angry: (from, to) => from === to ? '|🜸 está muy enojado.' : '|🜸 está enojado con',
  bored: (from, to) => from === to ? '|🜸 está muy aburrido.' : '|🜸 está aburrido con',
  bite: (from, to) => from === to ? '|🜸 se mordió solito.' : '|🜸 le dio un mordisco a',
  bleh: (from, to) => from === to ? '|🜸 se sacó la lengua frente al espejo.' : '|🜸 le está haciendo muecas a',
  bonk: (from, to) => from === to ? '|🜸 se dio un bonk a sí mismo.' : '|🜸 le dio un bonk a',
  blush: (from, to) => from === to ? '|🜸 se sonrojó.' : '|🜸 se sonrojó por',
  impregnate: (from, to) => from === to ? '|🜸 se embarazó.' : '|🜸 embarazó a',
  bully: (from, to) => from === to ? '|🜸 se hace bullying a sí mismo.' : '|🜸 le está haciendo bullying a',
  cry: (from, to) => from === to ? '|🜸 está llorando.' : '|🜸 está llorando por',
  happy: (from, to) => from === to ? '|🜸 está feliz.' : '|🜸 está feliz con',
  coffee: (from, to) => from === to ? '|🜸 está tomando café.' : '|🜸 está tomando café con',
  clap: (from, to) => from === to ? '|🜸 está aplaudiendo.' : '|🜸 está aplaudiendo por',
  cringe: (from, to) => from === to ? '|🜸 siente cringe.' : '|🜸 siente cringe por',
  dance: (from, to) => from === to ? '|🜸 está bailando.' : '|🜸 está bailando con',
  cuddle: (from, to) => from === to ? '|🜸 se acurrucó solo.' : '|🜸 se acurruca con',
  drunk: (from, to) => from === to ? '|🜸 está demasiado borracho.' : '|🜸 está borracho con',
  dramatic: (from, to) => from === to ? '|🜸 está haciendo un drama exagerado.' : '|🜸 le está haciendo un drama a',
  handhold: (from, to) => from === to ? '|🜸 se dio la mano consigo mismo.' : '|🜸 tomó la mano de',
  eat: (from, to) => from === to ? '|🜸 está comiendo algo delicioso.' : '|🜸 está comiendo con',
  highfive: (from, to) => from === to ? '|🜸 se chocó los cinco frente al espejo.' : '|🜸 chocó los 5 con',
  hug: (from, to) => from === to ? '|🜸 se abrazó a sí mismo.' : '|🜸 le dio un abrazo a',
  kill: (from, to) => from === to ? '|🜸 se autoeliminó en modo dramático.' : '|🜸 asesinó a',
  kiss: (from, to) => from === to ? '|🜸 se mandó un beso al aire.' : '|🜸 le dio un beso a',
  kisscheek: (from, to) => from === to ? '|🜸 se besó en la mejilla usando un espejo.' : '|🜸 le dio un beso en la mejilla a',
  lick: (from, to) => from === to ? '|🜸 se lamió por curiosidad.' : '|🜸 lamió a',
  laugh: (from, to) => from === to ? '|🜸 se está riendo de algo.' : '|🜸 se está burlando de',
  pat: (from, to) => from === to ? '|🜸 se acarició la cabeza con ternura.' : '|🜸 le dio una caricia a',
  love: (from, to) => from === to ? '|🜸 se quiere mucho a sí mismo.' : '|🜸 está enamorado de',
  pout: (from, to) => from === to ? '|🜸 está haciendo pucheros solo.' : '|🜸 le hace pucheros a',
  punch: (from, to) => from === to ? '|🜸 lanzó un puñetazo al aire.' : '|🜸 le dio un puñetazo a',
  run: (from, to) => from === to ? '|🜸 está corriendo por su vida.' : '|🜸 está corriendo con',
  scared: (from, to) => from === to ? '|🜸 está asustado.' : '|🜸 tiene miedo de',
  sad: (from, to) => from === to ? '|🜸 está triste.' : '|🜸 está expresando su tristeza a',
  smoke: (from, to) => from === to ? '|🜸 está fumando tranquilamente.' : '|🜸 está fumando con',
  smile: (from, to) => from === to ? '|🜸 está sonriendo.' : '|🜸 le sonrió a',
  spit: (from, to) => from === to ? '|🜸 se escupió a sí mismo.' : '|🜸 le escupió a',
  smug: (from, to) => from === to ? '|🜸 está presumiendo mucho.' : '|🜸 está presumiendo a',
  think: (from, to) => from === to ? '|🜸 está pensando profundamente.' : '|🜸 no puede dejar de pensar en',
  step: (from, to) => from === to ? '|🜸 se pisó a sí mismo.' : '|🜸 le pisó a',
  wave: (from, to) => from === to ? '|🜸 se saludó a sí mismo.' : '|🜸 saludó a',
  walk: (from, to) => from === to ? '|🜸 salió a caminar en soledad.' : '|🜸 decidió dar un paseo con',
  wink: (from, to) => from === to ? '|🜸 se guiñó a sí mismo.' : '|🜸 le guiñó el ojo a',
}

const symbols = ['(⁠◠⁠‿⁠◕⁠)', '˃͈◡˂͈', '૮(˶ᵔᵕᵔ˶)ა', '(づ｡◕‿‿◕｡)づ', '(✿◡‿◡)', '(꒪⌓꒪)', '(✿✪‿✪｡)', '(*≧ω≦)', '(✧ω◕)', '˃ 𖥦 ˂', '(⌒‿⌒)']
function getRandomSymbol() {
  return symbols[Math.floor(Math.random() * symbols.length)]
}

const alias = {
  angry: ['angry','enojado','enojada'],
  bleh: ['bleh'],
  bored: ['bored','aburrido','aburrida'],
  clap: ['clap','aplaudir'],
  coffee: ['coffee','cafe'],
  dramatic: ['dramatic','drama'],
  drunk: ['drunk'],
  cold: ['cold'],
  impregnate: ['impregnate','preg','preñar','embarazar'],
  kisscheek: ['kisscheek','beso'],
  laugh: ['laugh'],
  love: ['love','amor'],
  pout: ['pout','mueca'],
  punch: ['punch','golpear'],
  run: ['run','correr'],
  sad: ['sad','triste'],
  scared: ['scared','asustado'],
  seduce: ['seduce','seducir'],
  shy: ['shy','timido','timida'],
  sleep: ['sleep','dormir'],
  smoke: ['smoke','fumar'],
  spit: ['spit','escupir'],
  step: ['step','pisar'],
  think: ['think','pensar'],
  walk: ['walk','caminar'],
  hug: ['hug','abrazar'],
  kill: ['kill','matar'],
  eat: ['eat','nom','comer'],
  kiss: ['kiss','muak'],
  wink: ['wink','guiñar'],
  pat: ['pat','acariciar'],
  happy: ['happy','feliz'],
  bully: ['bully','molestar'],
  bite: ['bite','morder'],
  blush: ['blush','sonrojarse'],
  wave: ['wave','saludar'],
  bath: ['bath','bañarse'],
  smile: ['smile','sonreir'],
  highfive: ['highfive','choca'],
  handhold: ['handhold','tomar'],
  cringe: ['cringe'],
  bonk: ['bonk'],
  cry: ['cry','llorar'],
  lick: ['lick','lamer'],
  slap: ['slap','bofetada'],
  dance: ['dance','bailar'],
  cuddle: ['cuddle','acurrucar'],
  sing: ['sing','cantar'],
  tickle: ['tickle','cosquillas'],
  scream: ['scream','gritar'],
  push: ['push','empujar'],
  nope: ['nope','no'],
  jump: ['jump','saltar'],
  heat: ['heat','calor'],
  gaming: ['gaming','jugar'],
  draw: ['draw','dibujar'],
  call: ['call','llamar'],
  snuggle: ['snuggle','acurrucarse'],
  blowkiss: ['blowkiss','besito'],
  trip: ['trip','tropezar'],
  stare: ['stare','mirar'],
  sniff: ['sniff','oler'],
  curious: ['curious','curioso','curiosa'],
  thinkhard: ['thinkhard'],
  comfort: ['comfort','consolar'],
  peek: ['peek'],
  smug: ['smug'],
}

// ===========================
// DESCARGAR BUFFER DIRECTO
// ===========================
async function fetchBuffer(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36',
        'Accept': 'video/*, image/*, */*'
      },
      timeout: 15000
    })
    if (!res.ok) return null
    const arrayBuffer = await res.arrayBuffer()
    return Buffer.from(arrayBuffer)
  } catch {
    return null
  }
}

// ===========================
// OBTENER GIF CON FALLBACKS
// ===========================
async function getAnimeGif(action) {
  const apis = [
    // API 1: nekos.best - retorna JSON con URL
    async () => {
      const res = await fetch(`https://nekos.best/api/v2/${action}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 10000
      })
      if (!res.ok) return null
      const contentType = res.headers.get('content-type') || ''
      if (!contentType.includes('application/json')) return null
      const json = await res.json()
      const url = json.results?.[0]?.url
      if (!url) return null
      return await fetchBuffer(url)
    },
    // API 2: otakugifs
    async () => {
      const res = await fetch(`https://api.otakugifs.xyz/gif?reaction=${action}&format=gif`, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 10000
      })
      if (!res.ok) return null
      const contentType = res.headers.get('content-type') || ''
      if (!contentType.includes('application/json')) return null
      const json = await res.json()
      const url = json.url
      if (!url) return null
      return await fetchBuffer(url)
    },
    // API 3: waifu.pics
    async () => {
      const sfwList = ['hug','kiss','slap','pat','cry','dance','laugh','wave','smile','angry','blush','bored','sad','scared','sleep','think','wink','bite','lick','punch','run','cuddle']
      if (!sfwList.includes(action)) return null
      const res = await fetch(`https://api.waifu.pics/sfw/${action}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 10000
      })
      if (!res.ok) return null
      const contentType = res.headers.get('content-type') || ''
      if (!contentType.includes('application/json')) return null
      const json = await res.json()
      const url = json.url
      if (!url) return null
      return await fetchBuffer(url)
    },
    // API 4: stellar - con verificación content-type
    async () => {
      const res = await fetch(`https://api.stellarwa.xyz/sfw/interaction?inter=${action}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 10000
      })
      if (!res.ok) return null
      const contentType = res.headers.get('content-type') || ''
      if (!contentType.includes('application/json')) return null
      const json = await res.json()
      const url = json.result || json.url
      if (!url) return null
      return await fetchBuffer(url)
    },
    // API 5: nekosapi
    async () => {
      const validActions = ['hug','kiss','slap','pat','cry','dance','laugh','wave','smile','angry','blush','bored','sad','scared','sleep','think','wink','bite','lick','punch','run','cuddle','bonk','kick']
      if (!validActions.includes(action)) return null
      const res = await fetch(`https://nekosapi.com/api/v3/images/${action}/random`, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 10000
      })
      if (!res.ok) return null
      const contentType = res.headers.get('content-type') || ''
      if (!contentType.includes('application/json')) return null
      const json = await res.json()
      const url = json.items?.[0]?.image_url
      if (!url) return null
      return await fetchBuffer(url)
    }
  ]

  for (const api of apis) {
    try {
      const buffer = await api()
      if (buffer && buffer.length > 1000) return buffer
    } catch {}
    await new Promise(r => setTimeout(r, 300))
  }

  return null
}

export default {
  command: ['angry','enojado','enojada','bleh','bored','aburrido','aburrida','clap','aplaudir','coffee','cafe','dramatic','drama','drunk','cold','impregnate','preg','preñar','embarazar','kisscheek','beso','laugh','love','amor','pout','mueca','punch','golpear','run','correr','sad','triste','scared','asustado','seduce','seducir','shy','timido','timida','sleep','dormir','smoke','fumar','spit','escupir','step','pisar','think','pensar','walk','caminar','hug','abrazar','kill','matar','eat','nom','comer','kiss','muak','wink','guiñar','pat','acariciar','happy','feliz','bully','molestar','bite','morder','blush','sonrojarse','wave','saludar','bath','bañarse','smile','sonreir','highfive','choca','handhold','tomar','cringe','bonk','cry','llorar','lick','lamer','slap','bofetada','dance','bailar','cuddle','acurrucar','sing','cantar','tickle','cosquillas','scream','gritar','push','empujar','nope','no','jump','saltar','heat','calor','gaming','jugar','draw','dibujar','call','llamar','snuggle','acurrucarse','blowkiss','besito','trip','tropezar','stare','mirar','sniff','oler','curious','curioso','curiosa','thinkhard','comfort','consolar','peek','smug'],
  category: 'anime',

  run: async (client, m, args, usedPrefix, command) => {
    const currentCommand = Object.keys(alias).find(key => alias[key].includes(command)) || command
    if (!captions[currentCommand]) return

    let mentionedJid = m.mentionedJid
    let who2 = mentionedJid.length > 0 ? mentionedJid[0] : (m.quoted ? m.quoted.sender : m.sender)
    const who = await resolveLidToRealJid(who2, client, m.chat)

    const fromName = global.db.data.users[m.sender]?.name || '@' + m.sender.split('@')[0]
    const toName = global.db.data.users[who]?.name || '@' + who.split('@')[0]
    const genero = global.db.data.users[m.sender]?.genre || 'Oculto'

    const captionText = captions[currentCommand](fromName, toName, genero)
    const caption = who !== m.sender
      ? `\`${fromName}.\` ${captionText} \`${toName}.\` ${getRandomSymbol()}.`
      : `\`${fromName}\` ${captionText} ${getRandomSymbol()}.`

    try {
      await m.react('🎭')

      // ✅ DESCARGA BUFFER DIRECTO - ya no streameamos URLs
      const gifBuffer = await getAnimeGif(currentCommand)

      if (!gifBuffer) {
        await m.react('❌')
        return m.reply(`❌ No se encontró GIF para *${currentCommand}*. Intenta de nuevo.`)
      }

      await client.sendMessage(m.chat, {
        video: gifBuffer,           // ← Buffer directo, no URL
        gifPlayback: true,
        caption,
        mimetype: 'video/mp4',
        mentions: [who, m.sender]
      }, { quoted: m })

      await m.react('✅')

    } catch (e) {
      await m.react('❌')
      console.error(`[ANIME] Error en ${command}:`, e.message)
      await m.reply(`> Error en *${usedPrefix + command}*\n> [${e.message}]`)
    }
  },
}
