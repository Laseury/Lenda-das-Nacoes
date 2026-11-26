// Confere os decks da Arena depois de uma edição e joga partidas de teste (CPU contra CPU).
// Uso: node ferramentas/conferir-decks.js [partidas por deck, padrão 6] [só este deck, ex.: br]
// Ou dê dois cliques em "Conferir decks.bat", na pasta do jogo.
const fs = require('fs'), vm = require('vm'), path = require('path');
const raiz = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(raiz, 'index.html'), 'utf8');
/* os arquivos da Arena, na ordem do index.html */
const arquivos = ['js/comum/artes.js', ...[...html.matchAll(/<script src="(js\/arena\/(?:dados\/[^"]+|motor|ia)\.js)"><\/script>/g)].map(m => m[1].endsWith('.js') ? m[1] : m[1] + '.js')];
const N = +(process.argv[2] || 6), so = process.argv[3];
const problemas = [];
const ctx = { console: { ...console, error: () => {}, warn: () => {} }, Math, Object, Array, Set, Map, String, Number, JSON, Error, Date, setTimeout, avisarErro: () => {} };
vm.createContext(ctx);
for (const f of arquivos) {
  try { vm.runInContext(fs.readFileSync(path.join(raiz, f), 'utf8'), ctx, { filename: f }); }
  catch (e) {
    const onde = (e.stack || '').split('\n').find(l => l.includes(f)) || '';
    console.log(`\n✖ ERRO em ${f}${onde ? ' — ' + onde.trim() : ''}\n  ${e.message}\n`);
    process.exit(1);
  }
}
vm.runInContext('globalThis.__X = { AR, AR_IA, AR_DECKS, AR_PROBLEMAS, AR_CARTAS }', ctx);
const { AR, AR_IA, AR_DECKS, AR_PROBLEMAS } = ctx.__X;
const graves = AR_PROBLEMAS.filter(p => p.grave), leves = AR_PROBLEMAS.filter(p => !p.grave);
for (const p of graves) console.log(`✖ ${p.onde}: ${p.txt}`);
for (const p of leves) console.log(`· aviso — ${p.onde}: ${p.txt}`);
const decks = Object.keys(AR_DECKS);
console.log(`\n${decks.length} decks carregados: ${decks.map(d => `${d} (${AR_DECKS[d].total} cartas)`).join(', ')}`);
/* partidas de teste: cada deck contra os outros, CPU contra CPU */
let jogos = 0, falhas = 0; const vit = {}, jog = {};
for (const a of decks) {
  if (so && a !== so) continue;
  for (let n = 0; n < N; n++) {
    const b = decks.filter(d => d !== a)[n % (decks.length - 1)];
    const [x, y] = n % 2 ? [b, a] : [a, b];
    try {
      const G = AR.iniciar(x, y, { nomes: ['A', 'B'], ia: [true, true] });
      let passos = 0;
      while (G.vencedor === null && passos++ < 2500) {
        const P = G.pendente, i = P ? P.p : G.vez, p = G.jog[i];
        if (P) {
          const op = P.opcoes && P.opcoes[0];
          if (P.tipo === 'troca') AR.manterMao(p); else if (P.tipo === 'descobrir') AR.escolherDescoberta(p, op); else if (P.tipo === 'evento') AR.escolherEvento(p, op);
          else if (P.tipo === 'ano') AR.responderAno(p, op); else if (P.tipo === 'heroi') AR.escolherHeroi(p, op); else AR.responderMao(p, p.mao.slice(0, P.n).map(c => c.uid));
          continue;
        }
        if (!AR_IA.instinto(p) && G.vencedor === null) AR.passar(p);
      }
      if (G.vencedor === null) throw new Error('a partida não terminou (travou)');
      jogos++; const w = G.jog[G.vencedor].deckId; vit[w] = (vit[w] || 0) + 1; jog[x] = (jog[x] || 0) + 1; jog[y] = (jog[y] || 0) + 1;
    } catch (e) {
      falhas++;
      if (falhas <= 5) console.log(`✖ partida ${x} x ${y} quebrou: ${e.message}\n  ${(e.stack || '').split('\n').slice(1, 3).map(l => l.trim()).join('\n  ')}`);
    }
  }
}
console.log(`\n${jogos} partidas de teste, ${falhas} com erro.`);
console.log('Vitórias (só para ter ideia; com poucas partidas varia muito): ' + Object.keys(jog).map(d => `${d} ${Math.round(100 * (vit[d] || 0) / jog[d])}%`).join('  '));
console.log(graves.length || falhas ? '\nHá problemas: veja as linhas com ✖ acima.' : '\nTudo certo.');
process.exitCode = graves.length || falhas ? 1 : 0;
