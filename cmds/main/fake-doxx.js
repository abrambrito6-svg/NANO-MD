export default {
  command: ['doxx', 'doxeo', 'simular', 'falso'],
  category: 'fun',
  run: async (client, m, args, usedPrefix, command, text) => {
    let target = m.sender;
    let targetName = m.pushName || 'Usuario';

    // Si menciona a alguien o responde a un mensaje
    if (m.quoted) {
      target = m.quoted.sender;
      targetName = m.quoted.pushName || 'Desconocido';
    } else if (m.mentionedJid && m.mentionedJid[0]) {
      target = m.mentionedJid[0];
      targetName = 'Usuario mencionado';
    }

    // Generar datos falsos (pero con aspecto "realista")
    const randomIP = () => `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    const randomMAC = () => Array(6).fill(0).map(() => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join(':');
    const randomISP = () => {
      const isps = ['Movistar', 'Claro', 'Tigo', 'Vodafone', 'AT&T', 'Verizon', 'Orange', 'Telefónica', 'TIM', 'Personal'];
      return isps[Math.floor(Math.random() * isps.length)];
    };
    const randomCity = () => {
      const cities = ['Buenos Aires', 'Bogotá', 'Ciudad de México', 'Lima', 'Santiago', 'Madrid', 'Miami', 'São Paulo', 'Caracas', 'Quito'];
      return cities[Math.floor(Math.random() * cities.length)];
    };
    const randomCountry = () => {
      const countries = ['Argentina', 'Colombia', 'México', 'Perú', 'Chile', 'España', 'EE.UU.', 'Brasil', 'Venezuela', 'Ecuador'];
      return countries[Math.floor(Math.random() * countries.length)];
    };
    const randomCoordinates = () => `${(Math.random() * 180 - 90).toFixed(4)}, ${(Math.random() * 360 - 180).toFixed(4)}`;

    const ip = randomIP();
    const mac = randomMAC();
    const isp = randomISP();
    const ciudad = randomCity();
    const pais = randomCountry();
    const coordenadas = randomCoordinates();
    const navegador = 'Chrome 124.0.6367.118';
    const sistema = 'Windows 10 Pro';
    const dispositivo = Math.random() > 0.5 ? 'PC de escritorio' : 'Laptop';
    const proveedor = isp;
    const fecha = new Date().toLocaleString();

    const mensaje = `INFORMACIÓN PÚBLICA (simulada)

NOMBRE: ${targetName}
TELÉFONO: ${target.split('@')[0] || 'No disponible'}
IP PÚBLICA: ${ip}
MAC: ${mac}
ISP: ${isp}
UBICACIÓN APROX.: ${ciudad}, ${pais}
COORDENADAS: ${coordenadas}
NAVEGADOR: ${navegador}
SO: ${sistema}
DISPOSITIVO: ${dispositivo}
PROVEEDOR: ${proveedor}
FECHA/HORA: ${fecha}

ESTOS DATOS SON COMPLETAMENTE FICTICIOS. No se ha obtenido información real. Este comando es solo para entretenimiento.`;

    await client.sendMessage(m.chat, {
      text: mensaje,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363427643259597@newsletter',
          newsletterName: "『 𝙕𝙖𝙛𝙠𝙞𝙚𝙡 𝘾𝙝𝙖𝙣𝙣𝙚𝙡 』",
          serverMessageId: 1
        }
      }
    }, { quoted: m });
  }
};
