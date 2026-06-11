import fetch from 'node-fetch';

export const cmdData = {
name: 'playtt',
command: ['playtt', 'ttaudio', 'tiktokmp3', 'tta'],
category: 'downloader',
isAdmin: false,
botAdmin: false,

run: async (client, m, args, usedPrefix, command) => {  
    const conn = client || sock;  
    const text = args.join(" ");  

    // 🔥 TUS BANNERS DE CATBOX
    const bannersB6 = [
        'https://files.catbox.moe/6fg7wn.jpg',
        'https://o.uguu.se/OVglMiLd.jpg',
        'https://h.uguu.se/lMCcTzfW.jpg',
        'https://d.uguu.se/JMvFpmiK.jpg',
        'https://d.uguu.se/SfDwjAvr.jpg',
        'https://n.uguu.se/DLPAKBnL.jpg'
    ];
    const bannerUrl = bannersB6[Math.floor(Math.random() * bannersB6.length)];

    // ⛧ DESCARGAR THUMBNAIL A BUFFER
    let thumbnailBuffer = null;
    try {
        const imgRes = await fetch(bannerUrl);
        thumbnailBuffer = await imgRes.buffer();
    } catch (e) {
        console.log('No se pudo cargar thumbnail');
    }

    // ⛧ FUNCIÓN PA MANDAR TEXTO COMO DOCUMENTO CON MINI BANNER
    const enviarConBanner = async (texto) => {
        return await conn.sendMessage(m.chat, {
            document: thumbnailBuffer, // <- La foto de Rachel/Zack
            fileName: 'Zafkiel-MD.png', // <- Nombre fake
            mimetype: 'image/png',
            caption: texto, // <- Tu texto aquí
            jpegThumbnail: thumbnailBuffer, // <- Mini banner
            fileLength: 999999999
        }, { quoted: m });
    };

    if (!text) {  
        return enviarConBanner(
`╭━━━〔 ⛧ 𝙋𝙇𝘼𝙔𝙏 𝘽𝟲 〕━━━╮
┃ 🔗 Envía un enlace de TikTok
┃
┃ 📎 Ejemplo:
┃ #playtt https://vt.tiktok.com/xxxxx/
┃
┃ 🩸 Solo audios. Zack no edita videos
╰━━━━━━━━━━━━━━━━━━━━━━━╯`);  
    }  

    const isUrl = /(?:https?:\/\/)?(?:www\.|vm|vt|t)?\.?tiktok\.com\/([^\s&]+)/gi.test(text);  

    if (!isUrl) {  
        return enviarConBanner(
`╭━━━〔 💀 𝙀𝙍𝙊𝙍 〕━━━╮
┃ 🩸 Eso no es link de TikTok we
┃ 🔗 Usa: vt.tiktok.com / vm.tiktok.com
╰━━━━━━━━━━━━━━━━━━━━━━━╯`);  
    }  

    try {  
        await enviarConBanner(
`╭━━━〔 🎧 𝘿𝙀𝙎𝘾𝘼𝙍𝙂𝘼𝙉𝘿𝙊 〕━━━╮
┃ ☁️ Descargando audio...
┃ ⛧ Kaneki procesando el sonido
┃ 🔥 Kaiser esperando el beat
┃ 🩸 Espere un momento xd
┃
┃ ${text}`);  

        const apiRes = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(text)}&hd=1`);  
        const json = await apiRes.json();  

        if (!json || json.code !== 0 || !json.data) {  
            return enviarConBanner(
`╭━━━〔 💀 𝙁𝘼𝙇𝙊 〕━━━╮
┃ 🩸 No se pudo sacar el audio
┃ 🔒 Link privado o con restricción
╰━━━━━━━━━━━━━━━━━━━━━━━╯`);  
        }  

        const data = json.data;  
        const title = data.title || 'Sin título';  
        const author = data.author?.nickname || data.author?.unique_id || 'Desconocido';  
        const duration = data.duration ? `${data.duration}s` : 'N/A';  
        const music = data.music;  

        if (!music) {  
            return enviarConBanner(
`╭━━━〔 😿 𝙎𝙄𝙉 𝘼𝙐𝘿𝙄𝙊 〕━━━╮
┃ 🩸 Este TikTok no tiene audio
┃ 🔇 O está silenciado we
╰━━━━━━━━━━━━━━━━━━━━━━━╯`);  
        }  

        const resumen =  
`╭━━〔 ⛧ 𝘼𝙐𝘿𝙄𝙊 𝙏𝙄𝙆𝙏𝙊𝙆 〕━━╮
┃ 🎶 ib: ${title}
┃ 👤 Autor: ${author}
┃ ⏱️ Duración: ${duration}
┃ 🔗 ${text}
╰━━━━━━━━━━━━━━━━━━━━━━╯

> 🔥 𝘼𝙪𝙙𝙞𝙤 𝙙𝙚𝙨𝙘𝙖𝙧𝙜𝙖𝙙𝙤 𝙘𝙤𝙧𝙚𝙘𝙩𝙖𝙢𝙚𝙣𝙩𝙚
> ⛧ 𝙕𝙖𝙛𝙠𝙞𝙚𝙡-𝙈𝘿 𝙭 𝙋𝙞𝙨𝙤 𝘽𝟲`;  

        await enviarConBanner(resumen);  

        // 📤 Audio puro SIN BANNER
        await conn.sendMessage(m.chat, {  
            audio: { url: music },  
            mimetype: 'audio/mpeg',  
            fileName: `Zafkiel_B6_${author}.mp3`
        }, { quoted: m });

    } catch (e) {  
        console.error('Error en comando playtt:', e);  
        await enviarConBanner(
`╭━━━〔 🩸 𝙀𝙍𝙊𝙍 𝘽𝟲 〕━━━╮
┃ ☠️ Algo tronó en el Piso B6
┃ 🔧 Error: ${e.message}
╰━━━━━━━━━━━━━━━━━━━━━━━╯`);  
    }  
}

};

export default cmdData;
