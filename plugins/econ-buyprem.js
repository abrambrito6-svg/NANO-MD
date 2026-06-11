let precio = 50000 // 50k monedas
let dias = 7

let handler = async (m, { conn }) => {
    let user = global.db.data.users[m.sender]
    let isPrem = global.prem.includes(m.sender.split('@')[0])
    
    if (isPrem) return m.reply('✨ Ya eres Premium, Yae Miko te bendice 🌸')
    if (user.money < precio) return m.reply(`🌸 Te faltan *${precio - user.money}* monedas. Usa *.work* *.daily* *.minar*`)
    
    user.money -= precio
    global.prem.push(m.sender.split('@')[0])
    if (!user.premTime) user.premTime = 0
    user.premTime += dias * 24 * 60 * 60 * 1000
    
    conn.sendMessage(m.chat, {
        text: `🌸 *PREMIUM ACTIVADO* 🌸\nUsuario: @${m.sender.split('@')[0]}\nDuración: ${dias} días\n- *.play* sin limite\n- *.sticker* HD\n- *.ai* sin cooldown`,
        mentions: 
    })
}
handler.help = ['buyprem']
handler.tags = ['economy']
handler.command = /^(buyprem|premium)$/i
export default handler
