export default {
    command: ["spamwa", "spam"],
    category: "fun",

    run: async (sock, m, context) => {

        try {

            let fullText = context?.text || m.text || '';
            let usedPrefix = context?.usedPrefix || '.';
            let command = context?.command || 'spamwa';

            if (!fullText.includes("|")) {

                return sock.sendMessage(m.chat, {
                    text:
`╭━━━〔 ☠️ 𝙎𝙋𝘼𝙈 𝙒𝘼 〕━━━╮
┃ ✎ Formato incorrecto
┃ 📌 Ejemplo:
┃ ➥ ${usedPrefix}${command} +50244765267|hola|6
╰━━━━━━━━━━━━━━━━━━━━━━━╯

> _"Incluso el caos necesita orden."_ 🌧️`,
                    contextInfo: {
                        externalAdReply: {
                            title: '🩸 Rachel Gardner',
                            body: 'Angels of Death',
                            thumbnailUrl: 'https://files.catbox.moe/otwwqo.jpg',
                            sourceUrl: 'https://wa.me/50231882808',
                            mediaType: 1,
                            renderLargerThumbnail: false,
                            showAdAttribution: false
                        }
                    }
                }, { quoted: m })
            }

            let justoDatos = fullText.substring(fullText.indexOf(command) + command.length).trim();

            let partes = justoDatos.split("|");

            if (partes.length < 3) {

                return m.reply(
`╭━━━〔 ❌ 𝙀𝙍𝙍𝙊𝙍 〕━━━╮
┃ ⚠️ Faltan datos.
┃ ✎ Usa:
┃ ➥ número|mensaje|cantidad
╰━━━━━━━━━━━━━━━━━━━━━━━╯`
                )
            }

            let jid = partes[0];
            let msg = partes[1];
            let count = partes[2];

            let numeroLimpio = jid.replace(/[^0-9]/g, '').trim();

            if (!numeroLimpio || numeroLimpio.length < 8) {

                return m.reply(
`╭━━━〔 📵 𝙉𝙐𝙈𝙀𝙍𝙊 𝙄𝙉𝙑𝘼𝙇𝙄𝘿𝙊 〕━━━╮
┃ ❌ El número no parece válido.
┃ 🌎 Usa código de país.
┃ ➥ Ejemplo:
┃ ➥ +502XXXXXXXX
╰━━━━━━━━━━━━━━━━━━━━━━━╯`
                )
            }

            let target = numeroLimpio + '@s.whatsapp.net';
            let cantidad = parseInt(count.trim());

            if (isNaN(cantidad) || cantidad <= 0) {

                return m.reply(
`╭━━━〔 ⚠️ 𝘾𝘼𝙉𝙏𝙄𝘿𝘼𝘿 〕━━━╮
┃ ❌ Debes ingresar un número
┃ mayor a 0.
╰━━━━━━━━━━━━━━━━━━━━━━━╯`
                )
            }

            if (cantidad > 50) {

                return m.reply(
`╭━━━〔 ☠️ 𝙇𝙄𝙈𝙄𝙏𝙀 〕━━━╮
┃ ❌ Máximo permitido:
┃ ➥ 50 mensajes
╰━━━━━━━━━━━━━━━━━━━━━━━╯

> _"Demasiado ruido atrae monstruos."_ 🌧️`
                )
            }

            if (!msg.trim()) {

                return m.reply(
`╭━━━〔 💬 𝙈𝙀𝙉𝙎𝘼𝙅𝙀 〕━━━╮
┃ ❌ No puedes enviar
┃ texto vacío.
╰━━━━━━━━━━━━━━━━━━━━━━━╯`
                )
            }

            await sock.sendMessage(m.chat, {
                text:
`╭━━━〔 🚀 𝙍𝘼𝘾𝙃𝙀𝙇 𝙎𝙔𝙎𝙏𝙀𝙈 〕━━━╮
┃ 🎯 Objetivo:
┃ ➥ +${numeroLimpio}
┃ 💬 Mensaje:
┃ ➥ ${msg.trim()}
┃ 📦 Cantidad:
┃ ➥ ${cantidad}
╰━━━━━━━━━━━━━━━━━━━━━━━╯

> _"El sufrimiento comenzará..."_ ☁️`,
                contextInfo: {
                    externalAdReply: {
                        title: '☠️ SpamWA System',
                        body: 'Rachel Gardner',
                        thumbnailUrl: 'https://files.catbox.moe/mh97wx.jpg',
                        sourceUrl: 'https://wa.me/50231882808',
                        mediaType: 1,
                        renderLargerThumbnail: false,
                        showAdAttribution: false
                    }
                }
            }, { quoted: m })

            for (let i = 0; i < cantidad; i++) {

                await sock.sendMessage(target, {
                    text:
`╭━━━〔 🌧️ 𝙍𝘼𝘾𝙃𝙀𝙇 〕━━━╮
┃ ${msg.trim()}
┃ 🔢 ${i + 1}/${cantidad}
╰━━━━━━━━━━━━━━━━━━╯`
                })

                await new Promise(resolve => setTimeout(resolve, 2500));
            }

            await sock.sendMessage(m.chat, {
                text:
`╭━━━〔 ✅ 𝙁𝙄𝙉𝘼𝙇𝙄𝙕𝘼𝘿𝙊 〕━━━╮
┃ ☁️ Operación completada.
┃ 🎯 Objetivo afectado:
┃ ➥ +${numeroLimpio}
╰━━━━━━━━━━━━━━━━━━━━━━━╯

> _"Todo termina tarde o temprano."_ 🩸`,
                contextInfo: {
                    externalAdReply: {
                        title: '🩸 Rachel Gardner',
                        body: 'Angels of Death',
                        thumbnailUrl: 'https://files.catbox.moe/318335.jpg',
                        sourceUrl: 'https://wa.me/50231882808',
                        mediaType: 1,
                        renderLargerThumbnail: false,
                        showAdAttribution: false
                    }
                }
            }, { quoted: m })

        } catch (e) {

            console.error(e)

            m.reply(
`╭━━━〔 ❌ 𝙎𝙔𝙎𝙏𝙀𝙈 𝙀𝙍𝙍𝙊𝙍 〕━━━╮
┃ 💀 Ocurrió un fallo:
┃ ➥ ${e.message}
╰━━━━━━━━━━━━━━━━━━━━━━━╯`
            )
        }
    }
};
