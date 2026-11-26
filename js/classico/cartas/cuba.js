/* Lendas das Nações — Cuba: Ritmo de Havana.
 * Estilo de vitória: o Ritmo (🎺, contador na barra). Ele cresce 1 a cada Personagem Cubano invocado e a cada Magia Cubana
 * ativada no seu turno. Quem mantém o compasso fica cada vez mais forte; mas se você terminar um turno sem tocar
 * nenhuma carta Cubana, o Ritmo cai pela metade. A Grande Rumba e o Carnaval gastam Ritmo em golpes enormes. */

const cubano = humanoDe('CU');
const ritmo = c => M.dono(c).ritmo;
const temRitmo = (c, n) => ritmo(c) >= n;

humano({
  id: 'cu_sonero', nome: 'Sonero de Santiago', nivel: 3, atk: 1100, def: 1000, icone: '🎤',
  texto: 'Quando invocado: se você tem 3 ou mais de Ritmo, compre 1 carta.',
  aoInvocar: c => temRitmo(c, 3) ? M.comprar(M.dono(c), 1) : null,
});
humano({
  id: 'cu_rumbero', nome: 'Rumbero', nivel: 4, atk: 1500, def: 1200, icone: '🥁',
  texto: 'Ganha 150 de ATK para cada ponto de Ritmo que você tem (máximo 900).',
  atkProprio: c => 150 * Math.min(6, ritmo(c)),
});
humano({
  id: 'cu_bailarina', nome: 'Bailarina de Salsa', nivel: 3, atk: 1200, def: 900, icone: '💃',
  texto: 'Quando invocada: invoque especialmente 1 Personagem Cubano de Nível 3 ou menor da sua mão.',
  aoInvocar: F.invocar(['mao'], h => cubano(h) && h.d.nivel <= 3, 'Bailarina: quem entra na roda?'),
});
humano({
  id: 'cu_conguero', nome: 'Tocador de Congas', nivel: 3, atk: 1000, def: 1300, icone: '🪘',
  texto: 'Uma vez por turno: ganhe 1 de Ritmo.',
  efeito: { nome: 'Batida das congas', usar: c => M.ganharRitmo(M.dono(c), 1) },
});
humano({
  id: 'cu_trompetista', nome: 'Trompetista do Son', nivel: 4, atk: 1600, def: 1100, icone: '🎺',
  texto: 'Com 4 ou mais de Ritmo: pode atacar duas vezes por Fase de Batalha.',
  ataquesExtras: c => temRitmo(c, 4) ? 1 : 0,
});
humano({
  id: 'cu_marti', nome: 'José Martí, o Apóstolo', nivel: 7, atk: 2600, def: 2200, icone: '📜',
  texto: 'Quando invocado: ganhe 2 de Ritmo. Seus Personagens Cubanos ganham 50 de ATK para cada ponto de Ritmo (máximo 500).',
  aoInvocar: c => M.ganharRitmo(M.dono(c), 2),
  auraAtk: (s, a) => a.dono === s.dono && cubano(a) ? 50 * Math.min(10, M.jogador(s.dono).ritmo) : 0,
});
humano({
  id: 'cu_maceo', nome: 'Antonio Maceo, o Titã de Bronze', nivel: 6, atk: 2300, def: 1900, icone: '🐎',
  texto: 'Com 5 ou mais de Ritmo: não é destruído em batalha. Quando destrói um Personagem em batalha: ganhe 1 de Ritmo.',
  indestrutivelBatalha: c => temRitmo(c, 5),
  aoDestruirEmBatalha: c => M.ganharRitmo(M.dono(c), 1),
});
humano({
  id: 'cu_mambi', nome: 'Mambí da Independência', nivel: 4, atk: 1700, def: 1100, icone: '🗡️',
  texto: 'Quando destrói um Personagem em batalha: ganhe 1 de Ritmo.',
  aoDestruirEmBatalha: c => M.ganharRitmo(M.dono(c), 1),
});
humano({
  id: 'cu_guajiro', nome: 'Guajiro de Viñales', nivel: 4, atk: 1300, def: 1800, icone: '👒',
  texto: 'Enquanto este Personagem estiver em defesa, o oponente não pode atacar seus outros Personagens.',
  protegeOutros: s => s.pos === 'def',
});
humano({
  id: 'cu_pescador', nome: 'Pescador do Malecón', nivel: 3, atk: 900, def: 1200, icone: '🎣',
  texto: 'Quando vai do campo para o cemitério: adicione 1 Personagem Cubano do seu deck à mão.',
  aoIrAoCemiterio: F.buscar(cubano, 'Pescador: o que a rede traz?'),
});
humano({
  id: 'cu_bolero', nome: 'Cantora de Bolero', nivel: 4, atk: 1400, def: 1500, icone: '🌹',
  texto: 'Quando invocada: o oponente perde 150 PV para cada ponto de Ritmo que você tem.',
  aoInvocar(c) { const n = ritmo(c); if (n) M.dano(M.oponente(M.dono(c)), 150 * n); },
});
humano({
  id: 'cu_almendron', nome: 'Motorista do Almendrón', nivel: 4, atk: 1600, def: 1000, icone: '🚗',
  texto: 'Uma vez por turno: mude 1 Personagem do oponente para defesa.',
  efeito: {
    nome: 'Carro de 1950', pode: c => M.visiveis(M.oponente(M.dono(c))).some(h => h.pos === 'atk'),
    async usar(c) {
      const p = M.dono(c);
      const [x] = await M.escolher(p, M.visiveis(M.oponente(p)).filter(h => h.pos === 'atk'), { titulo: 'Almendrón: quem sai da pista?', ia: M.pesoAlvo });
      if (x) M.paraDefesa(x);
    },
  },
});
humano({
  id: 'cu_cortador', nome: 'Cortador de Cana', nivel: 4, atk: 1800, def: 1000, icone: '🌾', normal: true,
  texto: 'Passa a safra inteira no canavial, cantando décimas para marcar o ritmo do facão.',
});

magia({
  id: 'cu_salsa', nome: 'Noite de Salsa', icone: '🎶',
  texto: 'Invoque especialmente até 2 Personagens Cubanos de Nível 4 ou menor da sua mão.',
  podeAtivar: (c, p) => M.zonaHumanoLivre(p) && p.mao.some(h => cubano(h) && h.d.nivel <= 4),
  async ativar(c, p) { for (let k = 0; k < 2; k++) await F.invocar(['mao'], h => cubano(h) && h.d.nivel <= 4, `Noite de Salsa: quem dança? (${k + 1}/2)`)(c); },
});
magia({
  id: 'cu_clave', nome: 'A Clave', sub: 'continua', icone: '🥢',
  texto: 'Seus Personagens Cubanos ganham 300 de ATK. Uma vez por turno: ganhe 1 de Ritmo.',
  auraAtk: (s, a) => a.dono === s.dono && cubano(a) ? 300 : 0,
  efeito: { nome: 'Marcar a clave', usar: c => M.ganharRitmo(M.dono(c), 1) },
});
magia({
  id: 'cu_cafe', nome: 'Café Cubano', icone: '☕', iaCedo: true,
  texto: 'Compre 2 cartas. Depois, descarte 1 carta.',
  async ativar(c, p) { M.comprar(p, 2); await M.descartar(p, 1); },
});
magia({
  id: 'cu_carnaval', nome: 'Carnaval de Santiago', icone: '🎉',
  texto: 'Gaste 5 de Ritmo: destrua todos os Personagens do oponente com ATK menor que o do seu Personagem Cubano mais forte.',
  podeAtivar: (c, p) => p.ritmo >= 5 && M.visiveis(p).some(cubano),
  ativar(c, p) {
    if (!M.gastarRitmo(p, 5)) return;
    const maior = M.visiveis(p).filter(cubano).reduce((m, h) => Math.max(m, M.atk(h)), 0);
    for (const h of M.humanos(M.oponente(p))) if (!h.faceUp || M.atk(h) < maior) M.destruir(h);
  },
});
magia({
  id: 'cu_havana', nome: 'Havana Velha', sub: 'campo', icone: '🏛️',
  texto: 'Magia de Campo: seus Personagens Cubanos ganham 200 de ATK. No início do seu turno: ganhe 1 de Ritmo.',
  auraAtk: (s, a) => a.dono === s.dono && cubano(a) ? 200 : 0,
  noInicioDoTurno: c => M.ganharRitmo(M.dono(c), 1),
});
polimerizacao({
  id: 'cu_danca', nome: 'Dança em Par', icone: '👯',
  texto: 'Polimerização de Cuba: envie ao cemitério, da sua mão ou do seu campo, os materiais de 1 Personagem de Fusão Cubano e invoque-o especialmente. Depois, ganhe 2 de Ritmo.',
  depois: (f, p) => M.ganharRitmo(p, 2),
});

armadilha({
  id: 'cu_morro', nome: 'Castelo do Morro', gatilho: 'ataque', icone: '🏰',
  texto: 'Quando o oponente declarar um ataque: negue o ataque e ganhe 1 de Ritmo.',
  ativar(c, p, ev) { ev.negado = true; M.ganharRitmo(p, 1); },
  ia: (c, p, ev) => M.ameaca(ev),
});
armadilha({
  id: 'cu_contratempo', nome: 'Contratempo', gatilho: 'ataque', icone: '⏱️',
  texto: 'Quando o oponente declarar um ataque, se você tem 4 ou mais de Ritmo: destrua o Personagem atacante.',
  podeAtivar: (c, p) => p.ritmo >= 4,
  ativar(c, p, ev) { M.destruir(ev.atacante); },
  ia: (c, p, ev) => M.atk(ev.atacante) >= 1600,
});
armadilha({
  id: 'cu_mambo', nome: 'Mambo Inesperado', gatilho: 'livre', icone: '🕺',
  texto: 'Invoque especialmente 1 Personagem Cubano do seu cemitério.',
  podeAtivar: (c, p) => M.zonaHumanoLivre(p) && p.cemiterio.some(h => cubano(h) && !h.d.extra),
  ativar: F.invocar(['cemiterio'], h => cubano(h) && !h.d.extra, 'Mambo: quem volta para a pista?', undefined, 1),
  ia: iaReforco,
});

/* Deck Extra de Cuba */
fusao({
  id: 'cu_orquestra', nome: 'Orquestra de Son', nivel: 7, atk: 2400, def: 2100, icone: '🎷',
  materiais: [mat('1 Personagem Cubano', cubano), mat('1 Personagem Cubano', cubano)],
  texto: 'Ganha 100 de ATK para cada ponto de Ritmo que você tem (máximo 1000). Quando invocada: ganhe 1 de Ritmo.',
  atkProprio: c => 100 * Math.min(10, ritmo(c)),
  aoInvocar: c => M.ganharRitmo(M.dono(c), 1),
});
fusao({
  id: 'cu_patria', nome: 'Martí, Pátria e Liberdade', nivel: 9, atk: 3000, def: 2600, icone: '⭐',
  materiais: [mat('cu_marti'), mat('1 Personagem Cubano', cubano)],
  texto: 'Quando invocado: ganhe 3 de Ritmo. Com 6 ou mais de Ritmo: pode atacar duas vezes por Fase de Batalha e não é destruído em batalha.',
  aoInvocar: c => M.ganharRitmo(M.dono(c), 3),
  ataquesExtras: c => temRitmo(c, 6) ? 1 : 0,
  indestrutivelBatalha: c => temRitmo(c, 6),
});
fusao({
  id: 'cu_parsalsa', nome: 'Par de Salsa', nivel: 6, atk: 2200, def: 1900, icone: '💃',
  materiais: [mat('cu_bailarina'), mat('1 Personagem Cubano', cubano)],
  texto: 'Pode atacar duas vezes por Fase de Batalha. Quando destrói um Personagem em batalha: ganhe 1 de Ritmo.',
  ataquesExtras: () => 1,
  aoDestruirEmBatalha: c => M.ganharRitmo(M.dono(c), 1),
});
xyz({
  id: 'cu_comparsa', nome: 'Comparsa de Carnaval', rank: 4, atk: 2200, def: 1900, icone: '🎊',
  materiais: { n: 2, rotulo: 'Cubanos', filtro: cubano },
  texto: 'Uma vez por turno, remova 1 matéria: ganhe 2 de Ritmo e compre 1 carta.',
  efeito: { nome: 'A conga sai à rua', custoMateria: 1, usar(c) { M.ganharRitmo(M.dono(c), 2); M.comprar(M.dono(c), 1); } },
});
xyz({
  id: 'cu_trio', nome: 'Trio de Boleros', rank: 3, atk: 1900, def: 1800, icone: '🎸',
  materiais: { n: 2, rotulo: 'Cubanos', filtro: cubano },
  texto: 'Uma vez por turno, remova 1 matéria: o oponente perde 200 PV para cada ponto de Ritmo que você tem (máximo 1600).',
  efeito: { nome: 'Serenata', custoMateria: 1, usar(c) { const n = Math.min(8, ritmo(c)); if (n) M.dano(M.oponente(M.dono(c)), 200 * n); } },
});
ritual({
  id: 'cu_rumba', nome: 'A Grande Rumba', nivel: 8, atk: 2800, def: 2400, icone: '🔥',
  texto: 'Quando invocada: ganhe 3 de Ritmo. Uma vez por turno: gaste 3 de Ritmo: destrua 1 Personagem do oponente.',
  aoInvocar: c => M.ganharRitmo(M.dono(c), 3),
  efeito: {
    nome: 'Todo mundo dança', pode: c => temRitmo(c, 3) && M.humanos(M.oponente(M.dono(c))).length > 0,
    async usar(c) { if (M.gastarRitmo(M.dono(c), 3)) await F.destruirRival(() => true, 'Rumba: quem sai da roda?')(c); },
  },
});

deck({
  id: 'cu_ritmo', nacao: 'CU', nome: 'Ritmo de Havana', mecanica: 'Ritmo',
  resumo: 'Salsa, son e rumba: cada carta Cubana tocada no seu turno aumenta o Ritmo, que deixa os músicos e mambises mais fortes. Mantenha o compasso todo turno, ou o Ritmo cai pela metade.',
  destaques: ['cu_rumbero', 'cu_marti', 'cu_havana'],
  cartas: [
    ['cu_sonero', 2], ['cu_rumbero', 3], ['cu_bailarina', 2], ['cu_conguero', 3], ['cu_trompetista', 2], ['cu_marti', 1], ['cu_maceo', 1],
    ['cu_mambi', 2], ['cu_guajiro', 2], ['cu_pescador', 3], ['cu_bolero', 3], ['cu_almendron', 1],
    ['cu_salsa', 2], ['cu_clave', 1], ['cu_cafe', 2], ['cu_carnaval', 1], ['cu_havana', 1], ['cu_danca', 3],
    ['cu_morro', 2], ['cu_contratempo', 1], ['cu_mambo', 1], [ANULACAO, 1],
  ],
  extra: [['cu_orquestra', 3], ['cu_patria', 2], ['cu_parsalsa', 2], ['cu_comparsa', 3], ['cu_trio', 3], ['cu_rumba', 2]],
});
