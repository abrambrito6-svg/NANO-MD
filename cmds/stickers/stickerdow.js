import fetch from 'node-fetch'

const BOCCHI_BANNERS = [
  'https://n.uguu.se/LiJKUqVH.jpg', // Estas pesan menos de 30KB, WhatsApp sí las carga
  'https://d.uguu.se/flRAhRYO.jpg',
  'https://h.uguu.se/RpJwzQwu.jpg'
]

export default {
  command: ['stickerdow', 'stickerpack', 'sdow'],
  category: 'stickers',

  run: async (client, m, args, usedPrefix, command) => {
    const query = args.join(' ').trim()
    const foto = BOCCHI_BANNERS[Math.floor(Math.random() * BOCCHI_BANNERS.length)]

    if (!query) {
      return client.sendMessage(m.chat, {
        text: `🪢 *Uso:* ${usedPrefix + command} [tema]\n\n*Ejemplos:*\n${usedPrefix + command} Bocchi the Rock\n${usedPrefix + command} Blue Lock\n${usedPrefix + command} anime cute`,
        contextInfo: {
          externalAdReply: {
            title: '🎸 Bocchi Protocol - NanoVoid',
            body: 'Descarga stickers 🥰',
            thumbnailUrl: foto, // URL DIRECTA COMO EN TU PING
            sourceUrl: 'https://github.com',
            mediaType: 1,
            renderLargerThumbnail: false, // false = mini banner
            showAdAttribution: false
          },
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363427643259597@newsletter',
            newsletterName: '『 𝘽𝙤𝙘𝙘𝙝𝙞 𝙏𝙝𝙚 𝙍𝙤𝙘𝙠 』🎸', // BOCCHI AQUÍ
            serverMessageId: 1
          }
        }
      }, { quoted: m })
    }

    const log = (msg) => console.log(`[STICKERDOW V5] ${msg}`)

    try {
      await m.react('🪢')
      await client.sendMessage(m.chat, {
        text: `🉐 Buscando stickers de *${query}*...\n🥰 Analizando Sticker.ly actual`,
        contextInfo: {
          externalAdReply: {
            title: '🎸 Bocchi Protocol - NanoVoid',
            body: `Buscando ${query}...`,
            thumbnailUrl: foto,
            sourceUrl: 'https://github.com',
            mediaType: 1,
            renderLargerThumbnail: false
          },
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363427643259597@newsletter',
            newsletterName: '『 𝘽𝙤𝙘𝙘𝙝𝙞 𝙏𝙝𝙚 𝙍𝙤𝙘𝙠 』🎸',
            serverMessageId: 1
          }
        }
      }, { quoted: m })

      log(`=== INICIO BÚSQUEDA: ${query} ===`)
      const stickers = await getStickersNextJS(query, log)

      if (!stickers || stickers.length === 0) {
        await m.react('❌')
        log(`=== SIN RESULTADOS ===`)
        return client.sendMessage(m.chat, {
          text: `🉐 No encontré stickers para *${query}* 🥰\n\nIntenta con:\n▸ anime\n▸ bocchi\n▸ cute\n▸ waifu`,
          contextInfo: {
            externalAdReply: {
              title: '🎸 Bocchi Protocol - NanoVoid',
              body: 'Sin resultados 🥺',
              thumbnailUrl: foto,
              sourceUrl: 'https://github.com',
              mediaType: 1,
              renderLargerThumbnail: false
            },
            forwardedNewsletterMessageInfo: {
              newsletterJid: '120363427643259597@newsletter',
              newsletterName: '『 𝘽𝙤𝙘𝙘𝙝𝙞 𝙏𝙝𝙚 𝙍𝙤𝙘𝙠 』🎸',
              serverMessageId: 1
            }
          }
        }, { quoted: m })
      }

      await m.react('🦖')
      await client.sendMessage(m.chat, {
        text: `🉐 Encontré *${stickers.length} stickers* de *${query}*\n🪢 Enviando...`,
        contextInfo: {
          externalAdReply: {
            title: '🎸 Bocchi Protocol - NanoVoid',
            body: `${stickers.length} stickers listos`,
            thumbnailUrl: foto,
            sourceUrl: 'https://github.com',
            mediaType: 1,
            renderLargerThumbnail: false
          },
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363427643259597@newsletter',
            newsletterName: '『 𝘽𝙤𝙘𝙘𝙝𝙞 𝙏𝙝𝙚 𝙍𝙤𝙘𝙠 』🎸',
            serverMessageId: 1
          }
        }
      }, { quoted: m })

      let enviados = 0
      let fallidos = 0
      const maxStickers = Math.min(stickers.length, 15)

      for (let i = 0; i < maxStickers; i++) {
        try {
          const url = stickers[i]
          log(`[${i + 1}/${maxStickers}] Descargando: ${url.slice(0, 80)}...`)
          
          const buffer = await fetchBuffer(url, log)
          if (!buffer) {
            log(`[${i + 1}] Buffer nulo`)
            fallidos++
            continue
          }

          // STICKERS SIN CONTEXTINFO porque WhatsApp los bugea
          await client.sendMessage(m.chat, { 
            sticker: buffer 
          }, { quoted: m })

          enviados++
          log(`[${i + 1}] Enviado OK - ${buffer.length} bytes`)
          
          await new Promise(r => setTimeout(r, 1500))
          
        } catch (err) {
          log(`[${i + 1}] Error: ${err.message}`)
          fallidos++
        }
      }

      await m.react('✅')
      log(`=== FIN: ${enviados} enviados, ${fallidos} fallidos ===`)
      
      await client.sendMessage(m.chat, {
        text: `┏━━━━━✦❘༻🪢༺❘✦━━━━━┓

┃ —͟͞ ♱ STICKER DOW V5 ♱ —͟͞
┗━━━━━✦❘༻🪢༺❘✦━━━━━┛

╭─━━━⊱ RESULTADO ⊰━━━─╮
│ 🉐 Búsqueda: ${query}
│ 🦖 Enviados: ${enviados}
│ ❌ Fallidos: ${fallidos}
╰─━━━⊱✧༻♱༺✧⊰━━━─╯

> 🥰 Bocchi Protocol - NanoVoid`,
        contextInfo: {
          externalAdReply: {
            title: '🎸 Bocchi Protocol - NanoVoid',
            body: `Completado: ${enviados} stickers`,
            thumbnailUrl: foto,
            sourceUrl: 'https://github.com',
            mediaType: 1,
            renderLargerThumbnail: false
          },
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363427643259597@newsletter',
            newsletterName: '『 𝘽𝙤𝙘𝙘𝙝𝙞 𝙏𝙝𝙚 𝙍𝙤𝙘𝙠 』🎸',
            serverMessageId: 1
          }
        }
      }, { quoted: m })

    } catch (e) {
      await m.react('❌')
      log(`ERROR FATAL: ${e.stack}`)
      await client.sendMessage(m.chat, {
        text: `🉐 Error crítico en *${usedPrefix + command}*\n🪢 ${e.message}`,
        contextInfo: {
          externalAdReply: {
            title: '🎸 Bocchi Protocol - NanoVoid',
            body: 'Error 🥺',
            thumbnailUrl: foto,
            sourceUrl: 'https://github.com',
            mediaType: 1,
            renderLargerThumbnail: false
          },
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363427643259597@newsletter',
            newsletterName: '『 𝘽𝙤𝙘𝙘𝙝𝙞 𝙏𝙝𝙚 𝙍𝙤𝙘𝙠 』🎸',
            serverMessageId: 1
          }
        }
      }, { quoted: m })
    }
  }
}

// ===========================
// MÉTODO ACTUAL 2026: NEXT.JS DATA
// ===========================
async function getStickersNextJS(query, log) {
  try {
    log('Método 1: Extrayendo buildId de Next.js...')
    
    const mainPage = await fetch('https://sticker.ly/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml'
      }
    }).then(r => r.text())

    const buildIdMatch = mainPage.match(/"buildId":"([^"]+)"/)
    if (!buildIdMatch) {
      log('No se encontró buildId de Next.js')
      return await fallbackHTML(query, log)
    }

    const buildId = buildIdMatch[1]
    log(`BuildId encontrado: ${buildId}`)

    const searchUrl = `https://sticker.ly/_next/data/${buildId}/en/search.json?keyword=${encodeURIComponent(query)}`
    log(`Consultando: ${searchUrl}`)

    const res = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Referer': `https://sticker.ly/s/search?keyword=${encodeURIComponent(query)}`
      }
    })

    if (!res.ok) {
      log(`_next/data falló: ${res.status}`)
      return await fallbackHTML(query, log)
    }

    const data = await res.json()
    log(`JSON recibido: ${JSON.stringify(data).slice(0, 300)}...`)

    const packs = data?.pageProps?.searchResult?.stickerPacks || data?.pageProps?.packs || []
    log(`Cantidad de enlaces encontrados: ${packs.length}`)
    
    if (packs.length > 0) {
      const primeros5 = packs.slice(0, 5).map(p => p.packId || p.id || 'sin-id')
      log(`Primeros 5 enlaces detectados: ${primeros5.join(', ')}`)
    }

    if (packs.length === 0) {
      log('No hay packs en _next/data')
      return await fallbackHTML(query, log)
    }

    const stickers = []
    for (const pack of packs.slice(0, 2)) {
      const packId = pack.packId || pack.id
      if (!packId) continue
      
      log(`Procesando pack: ${packId}`)
      
      if (pack.stickers && Array.isArray(pack.stickers)) {
        for (const sticker of pack.stickers) {
          const url = sticker.fileUrl || sticker.webpUrl || sticker.imageUrl
          if (url && url.includes('.webp') && stickers.length < 20) {
            stickers.push(url)
          }
        }
      } else {
        const count = pack.stickerCount || 10
        for (let i = 1; i <= Math.min(count, 10); i++) {
          stickers.push(`https://cdn.sticker.ly/sticker_pack/${packId}/${i}.webp`)
        }
      }
      
      if (stickers.length >= 20) break
    }

    log(`Cantidad de stickers detectados: ${stickers.length}`)
    if (stickers.length > 0) {
      log(`Primeros 5 enlaces de stickers:`)
      stickers.slice(0, 5).forEach((url, i) => log(` ${i + 1}. ${url}`))
    }

    return stickers.length > 0? stickers.slice(0, 20) : await fallbackHTML(query, log)

  } catch (e) {
    log(`Error en NextJS: ${e.message}`)
    return await fallbackHTML(query, log)
  }
}

// ===========================
// FALLBACK 1: HTML SCRAPING
// ===========================
async function fallbackHTML(query, log) {
  try {
    log('Método 2: Fallback HTML scraping...')
    const searchUrl = `https://sticker.ly/s/search?keyword=${encodeURIComponent(query)}`
    
    const html = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml'
      }
    }).then(r => r.text())

    log(`HTML descargado: ${html.length} bytes`)

    const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/)
    if (!nextDataMatch) {
      log('No se encontró __NEXT_DATA__')
      return await fallbackTenor(query, log)
    }

    const nextData = JSON.parse(nextDataMatch[1])
    log('__NEXT_DATA__ parseado correctamente')

    const packs = nextData?.props?.pageProps?.searchResult?.stickerPacks || []
    log(`Packs en __NEXT_DATA__: ${packs.length}`)

    const stickers = []
    for (const pack of packs.slice(0, 2)) {
      const packId = pack.packId || pack.id
      if (!packId) continue

      const count = pack.stickerCount || 10
      for (let i = 1; i <= Math.min(count, 10); i++) {
        stickers.push(`https://cdn.sticker.ly/sticker_pack/${packId}/${i}.webp`)
      }
      if (stickers.length >= 20) break
    }

    log(`Stickers desde HTML: ${stickers.length}`)
    return stickers.length > 0? stickers : await fallbackTenor(query, log)

  } catch (e) {
    log(`Error en HTML: ${e.message}`)
    return await fallbackTenor(query, log)
  }
}

// ===========================
// FALLBACK 2: TENOR API
// ===========================
async function fallbackTenor(query, log) {
  try {
    log('Método 3: Fallback Tenor API...')
    const tenorUrl = `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(query + ' sticker')}&key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&client_key=my_test_app&limit=20&media_filter=webp_transparent`
    
    const res = await fetch(tenorUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    }).then(r => r.json())

    const stickers = []
    if (res.results) {
      for (const item of res.results) {
        const url = item.media_formats?.webp_transparent?.url || item.media_formats?.webp?.url
        if (url && stickers.length < 20) {
          stickers.push(url)
        }
      }
    }

    log(`Stickers desde Tenor: ${stickers.length}`)
    if (stickers.length > 0) {
      log(`Primeros 5 enlaces Tenor:`)
      stickers.slice(0, 5).forEach((url, i) => log(` ${i + 1}. ${url}`))
    }

    return stickers

  } catch (e) {
    log(`Error en Tenor: ${e.message}`)
    return []
  }
}

// ===========================
// HELPER: DESCARGAR BUFFER
// ===========================
async function fetchBuffer(url, log) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://sticker.ly/'
      },
      timeout: 20000
    })
    
    if (!res.ok) {
      log(`HTTP ${res.status} en ${url.slice(0, 60)}`)
      return null
    }
    
    const arrayBuffer = await res.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    if (buffer.length < 500) {
      log(`Buffer inválido: ${buffer.length} bytes`)
      return null
    }
    
    return buffer
  } catch (e) {
    log(`Error fetchBuffer: ${e.message}`)
    return null
  }
}
