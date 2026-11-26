// Atualiza a lista de artes (js/comum/artes.js) com o que está na pasta arte/.
// Rode depois de pôr uma imagem nova em arte/ (nome = id da arte + .jpg).
// Uso: node ferramentas/atualizar-artes.js  — ou dê dois cliques em "Atualizar artes.bat".
const fs = require('fs'), path = require('path');
const raiz = path.join(__dirname, '..');
const f = path.join(raiz, 'js/comum/artes.js');
const ids = fs.readdirSync(path.join(raiz, 'arte')).filter(x => x.toLowerCase().endsWith('.jpg')).map(x => x.slice(0, -4)).sort();
let s = fs.readFileSync(f, 'utf8');
s = s.replace(/const ARTES = new Set\(\[[\s\S]*?\]\)/, 'const ARTES = new Set(' + JSON.stringify(ids) + ')');
fs.writeFileSync(f, s);
console.log(`${ids.length} artes na lista.`);
