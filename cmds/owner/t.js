import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default {
command: ['t'],
category: 'owner',
isOwner: true,
run: async (client, m, args, usedPrefix, command, text) => {
if (!text.trim()) {
return client.reply(m.chat, `《✧》 Usa: ${usedPrefix}t <comando>\n\nEjemplo:\n${usedPrefix}t pwd\n${usedPrefix}t ls\n${usedPrefix}t ls cmds`, m)
}

let cmd = text.trim()

try {
await m.react('🕒')
const { exec } = await import('child_process')
const { promisify } = await import('util')
const execAsync = promisify(exec)

// QUITA el basePath o ponlo en la raíz real del bot
let { stdout, stderr } = await execAsync(cmd, { timeout: 10000 })

await m.react('✔️')

let result = ''
if (stdout?.trim()) result += `*STDOUT:*\n\`\`\`\n${stdout.slice(0, 4000)}\n\`\`\`\n`
if (stderr?.trim()) result += `*STDERR:*\n\`\`\`\n${stderr.slice(0, 1000)}\n\`\`\`\n`
if (!result) result = '《✧》 Sin salida'

client.reply(m.chat, result, m)

} catch (e) {
await m.react('✖️')
client.reply(m.chat, `*ERROR:*\n\`\`\`\n${e.message.slice(0, 4000)}\n\`\`\``, m)
}
}
}
