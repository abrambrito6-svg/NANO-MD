import yts from 'yt-search'
import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'
import { getBuffer } from '../../core/message.js'

export default {
  command: ['play2', 'mp4', 'ytmp4', 'ytvideo', 'playvideo'],
  category: 'downloader',
  run: async (client, m, args, usedPrefix, command) => {
    try {
      if (!args[0]) {
        return m.reply('《✧》Por favor, menciona el nombre o URL del video que deseas descargar')
      }
      
      const text = args.join(' ')
      const videoMatch = text.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/))([a-zA-Z0-9_-]{11})/)
      const query = videoMatch ? 'https://youtu.be/' + videoMatch[1] : text
      let url = query, title = 'video', thumbBuffer = null

      // 1. BUSCADOR DE YOUTUBE (Información previa)
      try {
        const search = await yts(query)
        if (search.all.length) {
          const videoInfo = videoMatch ? search.videos.find(v => v.videoId === videoMatch[1]) || search.all[0] : search.all[0]
          if (videoInfo) {
            url = videoInfo.url
            title = videoInfo.title
            
            try {
              thumbBuffer = await getBuffer(videoInfo.image)
            } catch {
              thumbBuffer = 'https://i.ibb.co/XZPxry0z/IMG-20260518-WA0245.jpg'
            }

            const vistas = (videoInfo.views || 0).toLocaleString()
            const canal = videoInfo.author?.name || 'Desconocido'
            const infoMessage = `➩ Descargando › *${title}*

> ❖ Canal › *${canal}*
> ⴵ Duración › *${videoInfo.timestamp || 'Desconocido'}*
> ❀ Vistas › *${vistas}*
> ✩ Publicado › *${videoInfo.ago || 'Desconocido'}*
> ❒ Enlace › *${url}*`
            
            await client.sendMessage(m.chat, { image: typeof thumbBuffer === 'string' ? { url: thumbBuffer } : thumbBuffer, caption: infoMessage }, { quoted: m })
          }
        }
      } catch (err) {
        console.error('Error en búsqueda de YT:', err)
      }

      // 2. DESCARGA MEDIANTE YT-DLP (MÉTODO LOCAL INDESTRUCTIBLE)
      const tmpDir = path.resolve('./tmp')
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir)
      
      const tmpFilePath = path.join(tmpDir, `video_${Date.now()}.mp4`)

      // Comando de ejecución para bajar video integrado en calidad óptima (máximo 480p para no saturar WhatsApp)
      const comandoYtdlp = `yt-dlp -f "bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]" --max-filesize 50M -S "res:480" -o "${tmpFilePath}" "${url}"`

      exec(comandoYtdlp, async (error, stdout, stderr) => {
        if (error) {
          console.error(`Error en yt-dlp: ${stderr}`)
          return m.reply('❌ No se pudo descargar el video. Asegúrate de haber instalado correctamente yt-dlp en Termux.')
        }

        // 3. ENVÍO DEL ARCHIVO DESCARGADO
        if (fs.existsSync(tmpFilePath) && fs.statSync(tmpFilePath).size > 0) {
          await client.sendMessage(m.chat, { 
            video: fs.readFileSync(tmpFilePath), 
            fileName: `${title}.mp4`, 
            mimetype: 'video/mp4' 
          }, { quoted: m })

          // Borramos el archivo temporal
          fs.unlinkSync(tmpFilePath)
        } else {
          m.reply('❌ El video procesado no es compatible o excede el límite de tamaño permitido por WhatsApp.')
        }
      })

    } catch (e) {
      console.error(e)
      await m.reply(`> Ocurrió un error inesperado al procesar el comando.\n> [Error: *${e.message}*]`)
    }
  }
}
