import fs from "fs";
import path from "path";
import chalk from "chalk";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
global.comandos = new Map();
global.plugins = {};
const pluginCache = new Map();
const commandsFolder = path.join(__dirname, "../../cmds");

async function seeCommands(dir = commandsFolder) {
  const items = fs.readdirSync(dir);
  for (const fileOrFolder of items) {
    const fullPath = path.join(dir, fileOrFolder);
    if (fs.lstatSync(fullPath).isDirectory()) {
      await seeCommands(fullPath);
      continue;
    }
    if (!fileOrFolder.endsWith(".js")) continue;
    try {
      const mtime = fs.statSync(fullPath).mtimeMs;
      const cached = pluginCache.get(fullPath);
      let imported;
      if (cached && cached.mtime === mtime) {
        imported = cached.imported;
      } else {
        const modulePath = `${path.resolve(fullPath)}?update=${Date.now()}`;
        imported = await import(modulePath);
        pluginCache.set(fullPath, { mtime, imported });
      }
        ////
      const comando = imported.default;
      const pluginName = fileOrFolder.replace(".js", "");
      global.plugins[pluginName] = imported;

      const isHandlerStyle = typeof comando === "function";
      const cmdList = isHandlerStyle ? comando.command : comando?.command;
      const runFn = isHandlerStyle ? comando : comando?.run;

      if (!cmdList || typeof runFn !== "function") continue;
      const cmdArray = Array.isArray(cmdList) ? cmdList : [cmdList];
      cmdArray.forEach(cmd => {
        if (!cmd) return;
        global.comandos.set(cmd.toLowerCase(), {
          pluginName,
          run: runFn,
          isHandlerStyle,
          category: (isHandlerStyle ? comando.tags?.[0] : comando.category) || "uncategorized",
          isOwner: (isHandlerStyle ? comando.owner : comando.isOwner) || false,
          isAdmin: (isHandlerStyle ? comando.admin : comando.isAdmin) || false,
          botAdmin: comando.botAdmin || false,
          before: imported.before || null,
          after: imported.after || null,
          info: comando.info || {}
        });
      });
       /////
    } catch (e) {
      const archivo = fullPath.replace(process.cwd(), '.').replace(/\\/g, '/')
      
      const matchLine = e.stack?.match(new RegExp(`${fullPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}:(\\d+):(\\d+)`))
      const linea = matchLine?.[1] || e.loc?.line || e.lineNumber || 'Desconocida'
      const columna = matchLine?.[2] || e.loc?.column || ''
      
      const traducir = (msg) => {
        if (msg.includes('Unexpected token }')) return 'Sobran llaves } → Tienes una } de más o te faltó una {'
        if (msg.includes('Unexpected token {')) return 'Te faltó cerrar una } antes de esta {'
        if (msg.includes('Unexpected token )')) return 'Sobran paréntesis ) → Tienes uno de más o te faltó una ('
        if (msg.includes('Unexpected token (')) return 'Te faltó cerrar un ) antes de este ('
        if (msg.includes('Unexpected identifier')) return 'Te faltó una coma, o punto y coma ; antes de esta palabra'
        if (msg.includes('await is only valid')) return 'Usaste "await" pero la función no es "async"'
        if (msg.includes('is not defined')) return `La variable "${msg.split(' ')[0]}" no existe. ¿Es "client", "conn" o "m"?`
        if (msg.includes('export') && msg.includes('duplicate')) return 'Duplicaste "export default". Solo puede haber 1 por archivo'
        if (msg.includes('Cannot find module')) return `Falta instalar: npm i ${msg.match(/'(.+)'/)?.[1] || 'módulo'}`
        if (msg.includes('Unexpected end of input')) return 'Archivo cortado: Te faltó cerrar }, ) o ] al final'
        return msg
      }

      const sugerencia = () => {
        if (e.message.includes('Unexpected token }')) return `nano ${archivo}\nIr a línea ${linea} y borra la } extra`
        if (e.message.includes('is not defined')) return `Busca "${e.message.split(' ')[0]}" en ${archivo} y cámbiala`
        if (e.message.includes('await')) return `Agrega "async" antes de "function" o "run:"`
        return `nano ${archivo}\nCtrl+_ → Línea ${linea} → Enter`
      }

      console.error(chalk.bgRed.white.bold(`\n💀 PLUGIN ROTO 💀`))
      console.error(chalk.red(`┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓`))
      console.error(chalk.red(`┃ 📂 ${archivo}:${linea}${columna? ':' + columna : ''}`))
      console.error(chalk.red(`┃ 💀 ${e.name}`))
      console.error(chalk.red(`┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`))
      
      console.error(chalk.bgYellow.black(`\n 👉 QUÉ LA CAGASTE: `))
      console.error(chalk.yellowBright(` ${traducir(e.message)} `))
      
      console.error(chalk.bgGreen.black(`\n 🔧 ARREGLO RÁPIDO: `))
      console.error(chalk.greenBright(` ${sugerencia()} `))
      
      console.error(chalk.bgRed.white.bold(`\n💀💀💀\n`))

      if (process.env.DEBUG) {
        console.error(chalk.gray('─── Stack pa devs ───'))
        console.error(chalk.gray(e.stack.split('\n').slice(0, 5).join('\n')))
        console.error(chalk.gray('─────────────────────\n'))
      }
    }
  }
}

const debounceMap = new Map();
global.reload = async (_ev, fullPath) => {
  if (!fullPath.endsWith(".js")) return;
  if (debounceMap.has(fullPath)) clearTimeout(debounceMap.get(fullPath));
  debounceMap.set(fullPath, setTimeout(async () => {
    debounceMap.delete(fullPath);
    const filename = path.basename(fullPath);
    if (!fs.existsSync(fullPath)) {
      console.log(chalk.yellow(`⚠ Plugin eliminado: ${filename}`));
      pluginCache.delete(fullPath);
      const pluginName = filename.replace(".js", "");
      for (const [cmd, data] of global.comandos.entries()) {
        if (data.pluginName === pluginName) global.comandos.delete(cmd);
      }
      delete global.plugins[pluginName];
      return;
    }
    try {
      const mtime = fs.statSync(fullPath).mtimeMs;
      const cached = pluginCache.get(fullPath);
      if (cached && cached.mtime === mtime) {
        console.log(chalk.gray(`⟳ Sin cambios: ${filename}`));
        return;
      }
      const modulePath = `${fullPath}?update=${Date.now()}`;
      const imported = await import(modulePath);
      pluginCache.set(fullPath, { mtime, imported });
      const pluginName = filename.replace(".js", "");
      for (const [cmd, data] of global.comandos.entries()) {
        if (data.pluginName === pluginName) global.comandos.delete(cmd);
      }
       ///
     global.plugins[pluginName] = imported;
      const comando = imported.default;

      const isHandlerStyle = typeof comando === "function";
      const cmdList = isHandlerStyle ? comando.command : comando?.command;
      const runFn = isHandlerStyle ? comando : comando?.run;

      if (cmdList && typeof runFn === "function") {
        const cmds = Array.isArray(cmdList) ? cmdList : [cmdList];
        cmds.forEach(cmd => {
          if (cmd) global.comandos.set(cmd.toLowerCase(), {
            pluginName,
            run: runFn,
            isHandlerStyle,
            category: (isHandlerStyle ? comando.tags?.[0] : comando.category) || "uncategorized",
            isOwner: (isHandlerStyle ? comando.owner : comando.isOwner) || false,
            isAdmin: (isHandlerStyle ? comando.admin : comando.isAdmin) || false,
            botAdmin: comando.botAdmin || false,
            before: imported.before || null,
            after: imported.after || null,
            info: comando.info || {}
          });
        });
      }
        ///////
      console.log(chalk.green(`✓ Plugin recargado: ${filename}`));
    } catch (e) {
      console.error(chalk.red(`⚠ Error al recargar ${filename}:\n`), e);
    }
  }, 300));
};

Object.freeze(global.reload);
const watchers = [];
function startWatcher() {
  for (const w of watchers) { try { w.close(); } catch {} }
  watchers.length = 0;
  function watchDir(dir) {
    try {
      const w = fs.watch(dir, (event, filename) => {
        if (filename && filename.endsWith('.js')) global.reload(event, path.join(dir, filename));
      });
      watchers.push(w);
      for (const item of fs.readdirSync(dir)) {
        const full = path.join(dir, item);
        if (fs.lstatSync(full).isDirectory()) watchDir(full);
      }
    } catch {}
  }
  watchDir(commandsFolder);
}
startWatcher();

export default seeCommands;
