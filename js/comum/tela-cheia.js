/* Lendas das Nações — Tela cheia
 * Botões com data-tela-cheia ligam e desligam a tela cheia (some a barra do navegador). Funciona no Android e no PC.
 * No iPhone o Safari não deixa um site esconder a barra: o botão explica como pôr o jogo na Tela de Início,
 * de onde ele abre em tela cheia (manifest.json e as metas "apple-mobile-web-app" do index.html). */
(() => {
  const doc = document, raiz = doc.documentElement;
  const ativa = () => !!(doc.fullscreenElement || doc.webkitFullscreenElement);
  const suporta = () => !!(raiz.requestFullscreen || raiz.webkitRequestFullscreen);
  const instalado = () => matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches || navigator.standalone === true;

  function aviso(html) {
    let el = doc.getElementById('aviso-tela-cheia');
    if (!el) {
      el = doc.createElement('div');
      el.id = 'aviso-tela-cheia';
      el.className = 'sobreposicao';
      el.innerHTML = '<div class="janela" role="dialog" aria-modal="true"><h2>Tela cheia</h2><p class="janela-texto"></p><div class="janela-botoes"><button class="btn primario" data-fechar-aviso>Entendi</button></div></div>';
      el.addEventListener('click', e => { if (e.target === el || e.target.closest('[data-fechar-aviso]')) el.hidden = true; });
      doc.body.appendChild(el);
    }
    el.querySelector('.janela-texto').innerHTML = html;
    el.hidden = false;
  }

  async function alternar() {
    if (ativa()) { (doc.exitFullscreen || doc.webkitExitFullscreen).call(doc); return; }
    if (instalado()) { aviso('O jogo já está aberto pela Tela de Início, sem a barra do navegador.'); return; }
    if (!suporta()) {
      aviso('No iPhone, o Safari não deixa um site esconder a barra.<br><br>Para jogar em tela cheia: toque em <b>Compartilhar</b> (o quadrado com a seta ⬆️), depois em <b>Adicionar à Tela de Início</b>. Abra o jogo pelo ícone que aparecer: ele abre sem a barra.<br><br>Dica: jogue com o celular <b>deitado</b>.');
      return;
    }
    try {
      if (raiz.requestFullscreen) await raiz.requestFullscreen({ navigationUI: 'hide' });
      else raiz.webkitRequestFullscreen();
    } catch (e) {
      aviso('O navegador não deixou entrar em tela cheia aqui (dentro do claude.ai isso pode ser bloqueado). Abra o jogo pelo link do site para usar a tela cheia.');
    }
  }

  const marcar = () => {
    for (const b of doc.querySelectorAll('[data-tela-cheia]')) {
      b.textContent = ativa() ? '🗗' : '⛶';
      b.title = ativa() ? 'Sair da tela cheia' : 'Tela cheia (esconde a barra do navegador)';
      b.setAttribute('aria-pressed', ativa() ? 'true' : 'false');
    }
  };
  doc.addEventListener('click', e => { if (e.target.closest && e.target.closest('[data-tela-cheia]')) { e.preventDefault(); alternar(); } });
  doc.addEventListener('fullscreenchange', marcar);
  doc.addEventListener('webkitfullscreenchange', marcar);
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', marcar); else marcar();
})();
