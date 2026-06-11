import fetch from 'node-fetch'

const NL = {
  contextInfo: {
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: '120363427643259597@newsletter',
      newsletterName: '『 𝙕𝙖𝙛𝙠𝙞𝙚𝙡 𝘾𝙝𝙖𝙣𝙣𝙚𝙡 』',
      serverMessageId: 1
    }
  }
}

async function searchModrinth(query) {
  try {
    const url = `https://api.modrinth.com/v2/search?query=${encodeURIComponent(query)}&limit=5&facets=${encodeURIComponent('[["project_type:mod"]]')}`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'YukiBot/1.0' },
      timeout: 12000
    })
    const json = await res.json()
    return json?.hits || []
  } catch (_) { return [] }
}

async function getBedrockVersions(slug) {
  try {
    const url = `https://api.modrinth.com/v2/project/${slug}/version`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'YukiBot/1.0' },
      timeout: 10000
    })
    const versions = await res.json()
    if (!Array.isArray(versions)) return null
    // Buscar versión Bedrock primero, si no la primera disponible
    const bedrock = versions.find(v => v.loaders?.includes('bedrock'))
    const latest = bedrock || versions[0]
    if (!latest) return null
    const file = latest.files?.[0]
    return {
      version: latest.version_number,
      loaders: latest.loaders?.join(', ') || 'universal',
      downloadUrl: file?.url || null,
      filename: file?.filename || `${slug}.jar`
    }
  } catch (_) { return null }
}

export default {
  command: ['mcpeld', 'mcbedrock', 'mcaddon', 'mcmod', 'minecraftmod'],
  category: 'downloader',
  run: async (client, m, args, usedPrefix, command) => {
    const query = args.join(' ').trim()
    if (!query) {
      return client.sendMessage(m.chat, {
        text:
          `⛏️ *MODS MINECRAFT BEDROCK*\n\n` +
          `> Busca y descarga mods/addons de Minecraft Bedrock Edition.\n\n` +
          `ꕤ Uso: *${usedPrefix}mcpeld <nombre del mod>*\n` +
          `ꕤ Ejemplo: *${usedPrefix}mcpeld OptiFine*\n` +
          `ꕤ Ejemplo: *${usedPrefix}mcpeld Jenny addon*`,
        ...NL
      }, { quoted: m })
    }

    const searching = await client.sendMessage(m.chat, {
      text: `⛏️ Buscando *${query}* en Modrinth...`,
      ...NL
    }, { quoted: m })

    const results = await searchModrinth(query)

    if (!results.length) {
      await client.sendMessage(m.chat, {
        text: `《✧》 No encontré mods con ese nombre.\n> Intenta con otro término de búsqueda.`,
        edit: searching.key,
        ...NL
      })
      return
    }

    // Tomar el primer resultado
    const mod = results[0]
    const slug = mod.slug || mod.project_id
    const title = mod.title || 'Desconocido'
    const description = mod.description?.slice(0, 100) || ''
    const downloads = (mod.downloads || 0).toLocaleString()
    const categories = mod.categories?.join(', ') || '—'

    const versionInfo = await getBedrockVersions(slug)

    const infoText =
      `⛏️ *${title}*\n\n` +
      `> 📝 ${description}...\n` +
      `> 📦 Categorías: *${categories}*\n` +
      `> ⬇️ Descargas totales: *${downloads}*\n` +
      (versionInfo ? `> 🔖 Versión: *${versionInfo.version}*\n> 🎮 Compatible con: *${versionInfo.loaders}*\n` : '') +
      `\n> 🔗 Modrinth: *https://modrinth.com/mod/${slug}*`

    if (versionInfo?.downloadUrl) {
      // Enviar con botón de descarga directo
      await client.sendMessage(m.chat, {
        text: infoText + `\n> 📥 Descarga directa:\n> ${versionInfo.downloadUrl}`,
        ...NL
      }, { quoted: m })
    } else {
      // Si no hay descarga directa, dar el link a Modrinth
      await client.sendMessage(m.chat, {
        text: infoText + `\n\n> ⚠️ Descarga disponible en el sitio de Modrinth.`,
        ...NL
      }, { quoted: m })
    }

    // Mostrar otros resultados si hay más
    if (results.length > 1) {
      const otros = results.slice(1, 4).map((r, i) =>
        `  \`${i + 2}.\` *${r.title}* — ${(r.downloads || 0).toLocaleString()} descargas\n  > https://modrinth.com/mod/${r.slug}`
      ).join('\n\n')
      await client.sendMessage(m.chat, {
        text: `⛏️ *Otros resultados:*\n\n${otros}`,
        ...NL
      })
    }
  }
}
