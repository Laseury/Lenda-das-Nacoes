/* Lendas das Nações — Artefatos lendários.
 * Magias únicas que qualquer país pode levar: cada duelista escolhe 1 antes do duelo e ela entra no seu Deck Extra
 * (sem contar no limite de 15). Na Fase Principal, você pode ativá-la direto do Deck Extra, uma vez por duelo.
 * São neutros (código GL), como a Polimerização e a Anulação. */

const ARTEFATOS = [];
const artefato = d => { const c = magia({ artefato: true, umaPorTurno: false, ...d }); ARTEFATOS.push(c.id); return c; };

artefato({
  id: 'gl_graal', nome: 'Santo Graal', icone: '🏆',
  texto: 'Artefato lendário. Ganhe 3000 PV e invoque especialmente 1 Personagem do seu cemitério.',
  async ativar(c, p) {
    M.curar(p, 3000);
    await F.invocar(['cemiterio'], x => !x.d.extra, 'Santo Graal: quem bebe e volta à vida?')(c);
  },
  ia: (c, p) => p.pv <= 4000,
});
artefato({
  id: 'gl_excalibur', nome: 'Excalibur, a Espada na Pedra', sub: 'equipamento', icone: '🗡️',
  texto: 'Artefato lendário. O Personagem equipado ganha 1000 de ATK, não é destruído em batalha e pode atacar duas vezes por Fase de Batalha.',
  equipAtk: () => 1000,
  indestrutivelHospede: true,
  ataquesExtras: () => 1,
  iaPeso: h => M.atk(h),
  ia: (c, p) => M.visiveis(p).some(h => M.atk(h) >= 1800),
});
artefato({
  id: 'gl_kusanagi', nome: 'Espada Kusanagi', icone: '🌪️',
  texto: 'Artefato lendário. A espada que corta o vento: destrua todas as Magias e Armadilhas do oponente e 1 Personagem dele.',
  podeAtivar: (c, p) => M.campoMT(M.oponente(p)).length + M.humanos(M.oponente(p)).length > 0,
  async ativar(c, p) {
    for (const x of M.campoMT(M.oponente(p))) M.destruir(x);
    if (M.humanos(M.oponente(p)).length) await F.destruirRival(() => true, 'Kusanagi: quem o vento leva?')(c);
  },
  ia: (c, p) => M.campoMT(M.oponente(p)).length >= 2 || M.humanos(M.oponente(p)).some(h => M.atk(h) >= 2500),
});
artefato({
  id: 'gl_arca', nome: 'A Arca Perdida', icone: '📦',
  texto: 'Artefato lendário. Ninguém resiste quando a Arca é aberta: bana todos os Personagens com a face para cima do oponente que tenham 2000 ou mais de ATK.',
  podeAtivar: (c, p) => M.visiveis(M.oponente(p)).some(h => M.atk(h) >= 2000),
  ativar(c, p) { for (const h of M.visiveis(M.oponente(p))) if (M.atk(h) >= 2000) M.banir(h); },
  ia: (c, p) => M.visiveis(M.oponente(p)).filter(h => M.atk(h) >= 2000).length >= 1,
});
artefato({
  id: 'gl_mjolnir', nome: 'Mjölnir, o Martelo do Trovão', icone: '🔨',
  texto: 'Artefato lendário. Destrua 1 Personagem do oponente e cause ao oponente dano igual ao ATK dele.',
  podeAtivar: (c, p) => M.humanos(M.oponente(p)).length > 0,
  async ativar(c, p) {
    const [x] = await M.escolher(p, M.humanos(M.oponente(p)), { titulo: 'Mjölnir: onde o trovão cai?', ia: h => M.atk(h) });
    if (!x) return;
    const dano = x.faceUp ? M.atk(x) : 1000;
    if (M.destruir(x)) M.dano(M.oponente(p), dano);
  },
  ia: (c, p) => M.visiveis(M.oponente(p)).some(h => M.atk(h) >= 2000),
});
artefato({
  id: 'gl_pedra', nome: 'Pedra Filosofal', icone: '💎',
  texto: 'Artefato lendário. Compre 3 cartas e ganhe 1000 PV.',
  ativar(c, p) { M.comprar(p, 3); M.curar(p, 1000); },
  ia: (c, p) => p.mao.length <= 2,
});
artefato({
  id: 'gl_tridente', nome: 'Tridente de Poseidon', icone: '🔱',
  texto: 'Artefato lendário. Uma onda gigante devolve todos os Personagens do oponente para a mão dele (os do Deck Extra voltam para o Deck Extra).',
  podeAtivar: (c, p) => M.humanos(M.oponente(p)).length > 0,
  ativar(c, p) { for (const h of M.humanos(M.oponente(p))) M.paraMao(h); M.log('A onda varre o campo do oponente.'); },
  ia: (c, p) => M.humanos(M.oponente(p)).length >= 3 || M.humanos(M.oponente(p)).some(h => h.d.extra),
});
