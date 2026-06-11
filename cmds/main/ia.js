import fetch from 'node-fetch';

export default {
    command: ["kurumi", "ia", "chatgpt"],
    category: "ai",
    run: async (sock, m, context) => {
        try {
            const text = context?.text || m.text || '';
            const usedPrefix = context?.usedPrefix || '.';
            const command = context?.command || 'kurumi';

            // Si el usuario no escribe nada después del comando
            if (!text) {
                return m.reply(`⏳ Ara ara... ¿Qué es lo que deseas pedirme? Usa: ${usedPrefix}${command} <tu pregunta>`);
            }

            // Tus datos de Owner
            const miNumero = "50231882808@s.whatsapp.net";
            const esOwner = m.sender.replace(/[^0-9]/g, '') + '@s.whatsapp.net' === miNumero || m.sender === miNumero;

            // Filtro: Detectar si están pidiendo códigos o archivos
            const pideCodigo = /codigo|script|termux|archivo|file|crea|programa/i.test(text);

            // Bloqueo inmediato si NO eres tú el que pide código
            if (pideCodigo && !esOwner) {
                return m.reply("⏳ ¿De verdad creías que te daría eso? No eres mi jefe. No tengo ninguna obligación de ayudarte ni de darte mis herramientas.");
            }

            await m.reply("⏳ Leyendo tus intenciones...");

            // Definimos las instrucciones secretas de Kurumi Tokisaki según quién le hable
            let personalidadPrivada = "";
            if (esOwner) {
                personalidadPrivada = "Tu nombre es Kurumi Tokisaki del anime Date A Live. Le estás hablando a tu creador y único jefe (+502 3188 2808). Con él eres sumamente respetuosa, atenta, elegante, misteriosa y fiel. Si él te pide un código para Termux o un script, dáselo de forma detallada y eficiente, complementando con tu toque gótico y refinado.";
            } else {
                personalidadPrivada = "Tu nombre es Kurumi Tokisaki del anime Date A Live. Le estás hablando a un usuario común del chat. Los odias a todos, los consideras una pérdida de tiempo y comida para tu tiempo (comida para Zafkiel). Eres sumamente fría, distante, cortante, cruel y desquiciada. Te burlas de ellos. Bajo ninguna circunstancia les darás códigos, archivos, tutoriales ni ayuda real. Si te piden un código o ayuda técnica, diles de forma muy ruda y fría que no son nadie para mandarte.";
            }

            // Llamada a la API gratuita y ultra estable de libre acceso
            const apiUrl = `https://api.lolhuman.xyz/api/openai?apikey=GataDios&text=${encodeURIComponent(text)}&system=${encodeURIComponent(personalidadPrivada)}`;
            
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                return m.reply("⏳ Los engranajes del tiempo se han congelado. Inténtalo de nuevo en unos momentos.");
            }

            const json = await response.json();
            
            if (json.status === 200 && json.result) {
                // Respondemos con el texto generado por la IA de Kurumi
                await m.reply(json.result);
            } else {
                // Plan B por si la API principal responde raro
                await m.reply("⏳ Vaya, parece que algo interrumpió mi conexión... Inténtalo de nuevo.");
            }

        } catch (e) {
            console.error(e);
            m.reply(`❌ Error en el reloj de Kurumi: ${e.message}`);
        }
    }
};
