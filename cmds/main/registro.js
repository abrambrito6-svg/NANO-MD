// |🜸 Banner de registro
const BANNER = 'https://files.catbox.moe/8w0rz1.jpg'

// |🜸 Mensajes de bienvenida
const BIENVENIDAS = [
(name, age) =>
`|🜸 Registro completado.

Bienvenido, ${name}.
Tu información ha sido almacenada correctamente.

Puedes comenzar a utilizar todas las funciones disponibles.`,

(name, age) =>
`|🜸 Sistema actualizado.

Nombre: ${name}
Edad: ${age}

Acceso concedido correctamente.`,

(name, age) =>
`|🜸 Verificación finalizada.

${name}, ya formas parte del sistema.

Todo está listo para continuar.`
]

export default {
command: ['reg', 'registro', 'registrar', 'registrarme', 'register'],
category: 'main',

run: async (client, m, args, usedPrefix) => {

const user = global.db.data.users[m.sender] ||= {}

// Mostrar información
if (!args[0] || args[0].toLowerCase() === 'info') {

if (!user.registered) {

try {
await client.sendMessage(m.chat, {
image: { url: BANNER },
caption:
`|🜸 Registro requerido

No existe información registrada para este usuario.

|🜸 Formato

${usedPrefix}reg Nombre.Edad

Ejemplo:
${usedPrefix}reg NanoVoid.18`
}, { quoted: m })

} catch {

await m.reply(
`|🜸 Registro requerido

Usa:

${usedPrefix}reg Nombre.Edad`
)

}

return

}

return m.reply(
`|🜸 Información registrada

|🜸 Nombre: ${user.regName}
|🜸 Edad: ${user.regAge}
|🜸 Estado: Registrado
|🜸 Nivel: ${user.level || 0}`
)

}

// Ya registrado
if (
user.registered &&
args[0]?.toLowerCase() !== 'actualizar' &&
args[0]?.toLowerCase() !== 'update'
) {

return m.reply(
`|🜸 Ya existe un registro.

Nombre: ${user.regName}
Edad: ${user.regAge}

Para modificarlo utiliza:

${usedPrefix}reg actualizar Nombre.Edad`
)

}

// Obtener datos
const rawInput =
args[0]?.toLowerCase() === 'actualizar' ||
args[0]?.toLowerCase() === 'update'
? args.slice(1).join(' ')
: args.join(' ')

const match = rawInput.match(
/^([a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{1,20})[.\-_ ](\d{1,3})$/
)

if (!match) {

return m.reply(
`|🜸 Formato inválido

Usa:

${usedPrefix}reg Nombre.Edad

Ejemplo:

${usedPrefix}reg NanoVoid.18`
)

}

const regName = match[1].trim()
const regAge = parseInt(match[2])

if (regAge < 5 || regAge > 100) {

return m.reply(
`|🜸 Edad inválida

Debe estar entre 5 y 100 años.`
)

}

const isUpdate = user.registered

user.registered = true
user.regName = regName
user.regAge = regAge
user.name = regName

// Actualización
if (isUpdate) {

return m.reply(
`|🜸 Registro actualizado

Nombre: ${regName}
Edad: ${regAge}

Los cambios fueron guardados correctamente.`
)

}

// Registro nuevo
const bienvenida =
BIENVENIDAS[
Math.floor(Math.random() * BIENVENIDAS.length)
](regName, regAge)

try {

await client.sendMessage(m.chat, {

image: { url: BANNER },

caption:
`${bienvenida}

|🜸 Edad registrada: ${regAge}

|🜸 Usa ${usedPrefix}menu para comenzar.`

}, { quoted: m })

} catch {

await m.reply(
`${bienvenida}

|🜸 Usa ${usedPrefix}menu para comenzar.`
)

}

}
}
