let handler = async (m, { conn }) => {
    console.log('OWNER HANDLER EJECUTADO') // Para ver si entra
    let owner = [['50252642025', 'Nano Yae Miku', true]]
    let vcard = `BEGIN:VCARD
VERSION:3.0
N:;${owner[0][1]};;;
FN:${owner[0][1]}
ORG:YukiBot Owner
TEL;type=CELL;type=VOICE;waid=${owner[0][0]}:${owner[0][0]}
END:VCARD`
    
    await conn.sendMessage(m.chat, {
        contacts: { displayName: 'Owner Bot', contacts: [{ vcard }] }
    }, { quoted: m })
}

handler.help = ['owner', 'dueño', 'creador']
handler.tags = ['info']
handler.command = /^owner|dueño|creador$/i // REGEX = 100% match

export default handler
