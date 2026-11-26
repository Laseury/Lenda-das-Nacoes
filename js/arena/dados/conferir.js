/* Lendas das Nações — Arena · CONFERIR: roda depois de todos os decks e procura erros de edição.
 * Problemas sérios (carta que não existe, deck sem 40 cartas) aparecem numa faixa vermelha no topo do jogo
 * e o deck com erro sai da lista. Avisos leves só aparecem no console (F12). Não precisa editar este arquivo. */
const AR_PROBLEMAS = [];
(() => {
  const A = AR_AJUSTES;
  const erro = (onde, txt) => AR_PROBLEMAS.push({ grave: true, onde, txt });
  const aviso = (onde, txt) => AR_PROBLEMAS.push({ grave: false, onde, txt });
  for (const [id, d] of Object.entries(AR_CARTAS)) {
    const onde = `carta ${id}`;
    if (d.kw) for (const k of d.kw) if (!AR_KW[k]) erro(onde, `palavra-chave "${k}" não existe (veja AR_KW em base.js).`);
    if (d.tipo === 'unidade' && (!Number.isFinite(d.atk) || !Number.isFinite(d.vida))) erro(onde, 'unidade sem atk ou vida.');
    if (!Number.isFinite(d.custo)) erro(onde, 'sem custo.');
    if (!d.nome) erro(onde, 'sem nome.');
    if (d.arte && typeof ARTES !== 'undefined' && !ARTES.has(d.arte)) aviso(onde, `sem arte (arte/${d.arte}.jpg não está na lista de js/comum/artes.js): aparece o emoji.`);
  }
  for (const [id, D] of Object.entries(AR_DECKS)) {
    const onde = `deck ${id} (${D.nome || '?'})`, antes = AR_PROBLEMAS.length;
    if (!AR_LIDERES[D.lider]) erro(onde, `Líder "${D.lider}" não existe.`);
    else if (!AR_CARTAS[AR_LIDERES[D.lider].carta]) erro(onde, `a carta do Líder "${AR_LIDERES[D.lider].carta}" não existe.`);
    if (D.saga && !AR_SAGAS[D.saga]) erro(onde, `Saga "${D.saga}" não existe.`);
    if (!D.pais) erro(onde, 'falta pais: { nome, cor }.');
    if (!Array.isArray(D.cartas)) { erro(onde, 'falta a lista cartas.'); continue; }
    let total = 0, lendas = 0;
    for (const linha of D.cartas) {
      const [c, n] = linha;
      if (!AR_CARTAS[c]) { erro(onde, `a carta "${c}" não existe (confira o id).`); continue; }
      if (!Number.isInteger(n) || n < 1) erro(onde, `"${c}": número de cópias inválido (${n}).`);
      if (n > A.maxCopias) aviso(onde, `"${c}" tem ${n} cópias (o normal é até ${A.maxCopias}).`);
      if (AR_CARTAS[c].ficha || AR_CARTAS[c].climax) erro(onde, `"${c}" é Ficha ou Clímax: não entra no deck.`);
      total += n;
      if ((AR_CARTAS[c].kw || []).includes('lenda')) lendas += n;
    }
    D.total = total;
    if (total !== A.tamanhoDeck) erro(onde, `tem ${total} cartas; precisa de ${A.tamanhoDeck}.`);
    if (lendas > A.maxLendas) aviso(onde, `tem ${lendas} Lendas (o normal é até ${A.maxLendas}).`);
    const hs = D.herois || [];
    if (hs.length > A.maxHerois) erro(onde, `tem ${hs.length} Heróis; o máximo é ${A.maxHerois}.`);
    for (const h of hs) if (!AR_HEROIS[h]) erro(onde, `o Herói "${h}" não existe (falta o arHeroi dele).`);
    if (AR_PROBLEMAS.slice(antes).some(p => p.grave)) D.comErro = true;
  }
  /* decks com erro saem da lista, para o jogo não travar */
  for (const [id, D] of Object.entries(AR_DECKS)) if (D.comErro) delete AR_DECKS[id];
  for (const p of AR_PROBLEMAS) (p.grave ? console.error : console.warn)(`Arena · ${p.onde}: ${p.txt}`);
  const graves = AR_PROBLEMAS.filter(p => p.grave);
  if (graves.length && typeof avisarErro === 'function') avisarErro(graves.map(p => `${p.onde}: ${p.txt}`).join('\n'));
})();
