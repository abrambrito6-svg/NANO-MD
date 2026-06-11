export default {
  command: ['owner', 'creator', 'creador', 'dueño'],
  category: 'info',

  run: async (client, m, args, usedPrefix, command) => {

    const ownerNumber = '50231882808' // Tu número sin + ni espacios
    const ownerName = 'Nano-Void'

    // Array de contactos para enviar
    const contacts = [
      {
        displayName: ownerName,
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;${ownerName};;;\nFN:${ownerName}\nORG:Zafkiel System;\nTITLE:Owner & Dev;\nTEL;type=CELL;type=VOICE;waid=${ownerNumber}:+${ownerNumber}\nEND:VCARD`
      }
    ]

    const contactText = `🕰️ *${ownerName}*\n_1 contacto_`

    await m.react('👑')

    // Enviar el contacto
    await client.sendMessage(
      m.chat,
      {
        contacts: {
          displayName: `${ownerName}`,
          contacts: contacts
        },
        contextInfo: {
          externalAdReply: {
            title: '👑 Owner Zafkiel-MD',
            body: 'Zafkiel System - Contacto Oficial',
            thumbnailUrl: 'https://i.ibb.co/QF9swPd5/7a5656fd1a1038e5a686392823c48ace.jpg',
            sourceUrl: 'https://wa.me/' + ownerNumber,
            mediaType: 1,
            renderLargerThumbnail: true,
            showAdAttribution: false
          }
        }
      },
      { quoted: m }
    )
  }
}
