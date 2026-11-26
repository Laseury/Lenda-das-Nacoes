/* Lendas das Nações — oponente controlado pelo computador.
 * Joga com as mesmas regras do jogador e não espia cartas viradas do rival. */

const IA = (() => {
  const api = {};
  /* Dificuldade da CPU: 'facil' erra e deixa jogadas passar; 'dificil' responde melhor e calcula o ataque para vencer. */
  api.nivel = 'normal';
  const nivelDe = p => p && p.ia ? api.nivel : 'normal';
  const espera = ms => M.espera(ms);
  const render = () => M.ui.render();

  /* Escolha genérica: ordena pelo critério do efeito (op.ia) e pega as melhores. */
  api.escolher = (p, cartas, op) => {
    const nota = op.ia || (c => M.valor(c));
    const ordem = [...cartas].sort((a, b) => nota(b) - nota(a));
    let pick = ordem.slice(0, op.max);
    if (op.min === 0) pick = pick.filter(c => nota(c) >= 0);
    if (pick.length < op.min) pick = ordem.slice(0, op.min);
    return pick;
  };

  api.posicao = (p, c) => {
    const f = M.oponente(p);
    if (!M.humanos(f).length) return 'atk';
    return c.d.atk >= maiorAtkVisivel(f) || c.d.atk >= c.d.def ? 'atk' : 'def';
  };

  api.resposta = (p, tipo, ev, opcoes) => {
    const nv = nivelDe(p);
    if (nv === 'facil' && Math.random() < 0.5) return null;
    for (const o of opcoes) {
      if (o.tipo === 'armadilha') {
        if (!o.carta.d.ia || o.carta.d.ia(o.carta, p, ev)) return o;
        if (nv === 'dificil' && tipo === 'ataque' && ev && ev.atacante && (M.ameaca(ev) || p.pv <= M.atk(ev.atacante) * 1.5)) return o;
        continue;
      }
      const regra = o.carta.d.aoSerAtacado.ia;
      if (!regra || regra(o.carta, ev)) return o;
    }
    return null;
  };

  function maiorAtkVisivel(f) {
    return M.visiveis(f).reduce((m, h) => Math.max(m, M.atk(h)), 0);
  }

  /* ───────── turno ───────── */

  api.turno = async p => {
    await espera(600);
    await principal(p, 1);
    if (M.G.turno > 1 && p.flags.semAtaque !== M.G.turno) {
      M.irParaBatalha();
      render();
      await espera(500);
      await batalha(p);
    }
    M.irParaMain2();
    render();
    await espera(400);
    await principal(p, 2);
    await espera(400);
    await M.encerrarTurno();
  };

  async function principal(p, fase) {
    for (let guarda = 0; guarda < 30; guarda++) {
      if (M.G.vencedor !== null) return;
      const acao = proximaAcao(p, fase);
      if (!acao) return;
      await acao();
      render();
      await espera(650);
    }
  }

  function proximaAcao(p, fase) {
    const G = M.G;
    if (nivelDe(p) === 'facil' && Math.random() < 0.3) return null;
    const usaMagia = c => c.d.tipo === 'magia' && M.podeAtivarMagia(p, c) && !(c.d.sub === 'campo' && p.campoM && p.campoM.id === c.id) && (!c.d.ia || c.d.ia(c, p));

    // 0. Habilidade escolhida para o duelo, quando a regra dela diz que vale a pena.
    if (p.prefereArtefato === undefined) p.prefereArtefato = Math.random() < 0.4;
    for (const hab of p.habilidades) {
      /* Artefato ou Lenda: parte das CPUs guarda a habilidade de duelo para o Artefato, e qualquer uma o pega quando a Lenda não está disponível e ele resolve algo agora. */
      if (M.podeArtefatoHab(p, hab) && M.G.turno > 1 && M.artefatoUtil(p) && (p.prefereArtefato || (hab.carta && !M.podeLenda(p, hab) && M.G.turno > 3) || p.pv < 2500)) return () => M.usarHabilidade(p, hab, 'artefato');
      if (hab.vezes === 'duelo' && p.prefereArtefato && M.artefatoDisponivel(p) && M.G.turno < 8) continue;
      if (M.podeLenda(p, hab) && (!hab.ia || hab.ia(p)) && !(nivelDe(p) === 'facil' && Math.random() < 0.5)) return () => M.usarHabilidade(p, hab, 'lenda');
    }

    // 0b. Artefato lendário: uma vez por duelo, quando a regra dele diz que vale a pena.

    // 0c. Bênçãos do Zodíaco: só valem enquanto o ano é o do signo, então vêm antes de qualquer carta que mude o ano.
    for (const h of M.visiveis(p)) {
      if (M.podeBencao(p, h) && (!h.d.bencao.ia || h.d.bencao.ia(h))) return () => M.usarBencao(p, h);
    }

    // 1. Magias de compra e busca primeiro: aumentam as opções do turno.
    for (const c of p.mao) if (c.d.iaCedo && usaMagia(c)) return () => M.ativarMagia(p, c);

    // 2. Invocações especiais a partir da mão.
    for (const c of p.mao) {
      if (M.podeInvocarDaMao(p, c) && (!c.d.invocacaoMao.ia || c.d.invocacaoMao.ia(c))) return () => M.invocarDaMao(p, c);
    }

    // 3. Invocação normal.
    if (!G.invocouNormal) {
      const s = melhorInvocacao(p);
      if (s) return () => M.invocarNormal(p, s.c, s.modo, s.tributos);
    }

    // 3b. Deck Extra: Evolução, Ritual e XYZ quando o resultado vale mais que as cartas gastas.
    const vistos = new Set();
    for (const c of [...p.extra].sort((a, b) => b.d.atk - a.d.atk)) {
      if (vistos.has(c.id)) continue;
      vistos.add(c.id);
      if (M.podeEvoluir(p, c)) {
        const base = M.basesEvolucao(p, c).sort((a, b) => M.atk(b) - M.atk(a))[0];
        return () => M.evoluir(p, c, base);
      }
      // Ritual: vale quando a oferenda mais barata custa menos que ele (cartas da mão contam pela metade).
      if (M.podeRitual(p, c)) {
        const ofs = M.melhoresOferendas(p, c);
        const custo = ofs ? ofs.reduce((s, x) => s + (x.loc === 'mao' ? M.valor(x) / 2 : M.atk(x)), 0) : Infinity;
        if (ofs && c.d.atk >= custo + 300) return () => M.invocarRitual(p, c, ofs);
      }
      if (M.podeXyz(p, c)) {
        const mats = M.materiaisXyz(p, c).sort((a, b) => M.valor(a) - M.valor(b)).slice(0, c.d.materiais.n);
        const melhor = mats.reduce((m, h) => Math.max(m, M.atk(h)), 0);
        if (c.d.atk + (c.d.efeito ? 300 : 0) >= melhor + 400) return () => M.invocarXyz(p, c, mats);
      }
    }

    // 4. Demais magias (equipamentos, contínuas, remoção), da mão ou baixadas.
    for (const c of [...p.mao, ...M.campoMT(p)]) {
      if (!usaMagia(c)) continue;
      if (c.d.sub === 'equipamento') {
        const alvo = melhorAlvoEquip(p, c);
        if (alvo) return () => M.ativarMagia(p, c, alvo);
        continue;
      }
      return () => M.ativarMagia(p, c);
    }

    // 5. Efeitos de Personagens e de Magias Contínuas no campo.
    for (const h of [...M.visiveis(p), ...M.campoMT(p).filter(x => x.faceUp)]) {
      if (M.podeUsarEfeito(p, h) && (!h.d.efeito.ia || h.d.efeito.ia(h))) return () => M.usarEfeito(p, h);
    }

    // 5b. Efeitos que agem do cemitério.
    const vistosCem = new Set();
    for (const c of p.cemiterio) {
      if (vistosCem.has(c.id)) continue;
      vistosCem.add(c.id);
      if (M.podeEfeitoCemiterio(p, c) && (!c.d.efeitoCemiterio.ia || c.d.efeitoCemiterio.ia(c))) return () => M.usarEfeitoCemiterio(p, c);
    }

    // 6. Armadilhas livres no próprio turno.
    for (const c of M.campoMT(p)) {
      if (M.podeAtivarArmadilhaManual(p, c) && c.d.ia && c.d.ia(c, p, null)) return () => M.ativarArmadilha(p, c, null);
    }

    // 7. Mudanças de posição.
    for (const h of M.humanos(p)) {
      if (M.podeMudarPosicao(p, h) && querMudar(p, h, fase)) return () => M.mudarPosicao(p, h);
    }

    // 8. Baixar armadilhas.
    for (const c of p.mao) if (c.d.tipo === 'armadilha' && M.podeBaixarMT(p, c)) return () => M.baixarMT(p, c);

    return null;
  }

  function melhorInvocacao(p) {
    const f = M.oponente(p);
    const maiorRival = maiorAtkVisivel(f);
    const rivalVazio = M.humanos(f).length === 0;
    const meus = M.humanos(p);
    let melhor = null;
    for (const c of p.mao) {
      if (c.d.tipo !== 'humano' || !M.podeInvocarNormal(p, c)) continue;
      const n = M.tributosNecessarios(c);
      const tributos = M.melhoresTributos(p, c);
      if (!tributos) continue;
      const custo = tributos.reduce((s, t) => s + M.atk(t), 0);
      if (n && c.d.atk < custo + 500) continue;
      const atkBom = rivalVazio || c.d.atk >= maiorRival;
      let modo = atkBom || c.d.aoInvocar ? 'atk' : 'baixar';
      if (c.d.aoRevelar && !c.d.aoInvocar && !n) modo = 'baixar';
      if (modo === 'baixar' && n) continue;
      const nota = modo === 'atk'
        ? c.d.atk + (c.d.aoInvocar ? 350 : 0) + c.d.nivel * 30 - custo * 0.7
        : c.d.def * 0.6 + (c.d.aoRevelar ? 700 : 0);
      if (!melhor || nota > melhor.nota) melhor = { c, modo, tributos: n ? tributos : null, nota };
    }
    return melhor;
  }

  function melhorAlvoEquip(p, e) {
    const op = M.alvosEquip(p, e);
    if (!op.length) return null;
    const nota = h => M.atk(h) + (h.pos === 'atk' ? 300 : 0) + (e.d.iaPeso ? e.d.iaPeso(h) : 0);
    return op.sort((a, b) => nota(b) - nota(a))[0];
  }

  function querMudar(p, h, fase) {
    const f = M.oponente(p);
    const maior = maiorAtkVisivel(f);
    const vazio = M.humanos(f).length === 0;
    if (!h.faceUp) return fase === 1 && M.G.turno > 1 && (vazio || h.d.atk > maior || !!h.d.aoRevelar);
    if (h.pos === 'def') return fase === 1 && (vazio || M.atk(h) > maior) && M.atk(h) >= M.def(h) * 0.8;
    return fase === 2 && maior > M.atk(h) && M.def(h) > M.atk(h);
  }

  /* ───────── batalha ───────── */

  async function batalha(p) {
    for (let guarda = 0; guarda < 12; guarda++) {
      if (M.G.vencedor !== null) return;
      const atacantes = M.humanos(p).filter(M.podeAtacar).sort((a, b) => M.atk(b) - M.atk(a));
      let atacou = false;
      for (const a of atacantes) {
        const alvo = escolherAlvo(a, nivelDe(p), p);
        if (alvo === undefined) continue;
        await M.atacar(a, alvo);
        render();
        await espera(700);
        atacou = true;
        break;
      }
      if (!atacou) return;
    }
  }

  /* Retorna o alvo, null para ataque direto ou undefined para não atacar. */
  function escolherAlvo(a, nv = 'normal', p = null) {
    const { alvos, direto } = M.alvosAtaque(a);
    const A = M.atk(a);
    let melhor;
    let nota = -Infinity;
    if (nv === 'facil' && Math.random() < 0.35) {
      const op = [...(direto ? [null] : []), ...alvos];
      return op.length ? op[Math.floor(Math.random() * op.length)] : undefined;
    }
    if (direto) {
      melhor = null; nota = A * 0.9;
      /* Difícil: se a soma dos ataques diretos possíveis zera os PV do rival, todos vão direto. */
      if (nv === 'dificil' && p) {
        const diretos = M.humanos(p).filter(x => M.podeAtacar(x) && M.alvosAtaque(x).direto).reduce((s, x) => s + M.atk(x), 0);
        if (diretos >= M.oponente(p).pv) nota = 1e6;
      }
    }
    for (const t of alvos) {
      let s = -Infinity;
      if (!t.faceUp) {
        if (A >= (nv === 'dificil' ? 1500 : 1900)) s = 600;
      } else {
        const AA = A + (a.d.atkBatalha ? a.d.atkBatalha(a, t, true) : 0);
        if (t.pos === 'atk') {
          const T = M.atk(t);
          if (AA > T) s = 1000 + T + (AA - T) + (nv === 'dificil' ? M.valor(t) / 4 : 0);
          else if (AA === T && M.valor(t) > M.valor(a)) s = 200;
        } else if (AA > M.def(t)) s = 700 + M.atk(t) * 0.3;
      }
      if (s > nota) { nota = s; melhor = t; }
    }
    return nota === -Infinity ? undefined : melhor;
  }

  return api;
})();
