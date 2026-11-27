/* Lendas das Nações — Arena: o mapa-múndi da escolha de decks.
 * Contornos simplificados em [longitude, latitude], desenhados numa projeção "olho de peixe" que aumenta a Europa
 * (onde estão quase todas as nações), como nos mapas antigos. O litoral ganha recortes por subdivisão com ruído fixo.
 * AR_MAPA.svg(dados) devolve o desenho; a mesa só liga e desliga classes (sel, rival) em cada [data-mapa]. */
const AR_MAPA = (() => {
  const W = 1000, H = 570;
  /* ───── projeção ───── */
  const FOCO = [8, 45], LON = [-114, 172], LAT = [-45, 72], DX = 1.15, DY = .72, FX = 468, FY = 218;
  const peixe = (t, d) => (t < 0 ? -peixe(-t, d) : ((d + 1) * t) / (d * t + 1));
  const proj = ([lo, la]) => {
    const tx = lo >= FOCO[0] ? (lo - FOCO[0]) / (LON[1] - FOCO[0]) : (lo - FOCO[0]) / (FOCO[0] - LON[0]);
    const ty = la >= FOCO[1] ? (la - FOCO[1]) / (LAT[1] - FOCO[1]) : (la - FOCO[1]) / (FOCO[1] - LAT[0]);
    const gx = peixe(tx, DX);
    /* Para o norte a faixa é curta: quase sem curva. */
    const gy = ty >= 0 ? peixe(ty, .35) : peixe(ty, DY);
    return [FX + gx * (gx >= 0 ? W - FX : FX), FY - gy * (gy >= 0 ? FY : H - FY)];
  };
  /* Recorte do litoral: o mesmo lado sempre sai igual, mesmo em polígonos vizinhos. */
  const ruido = (a, b) => { const s = Math.sin(Math.round(a[0] * 10) * 12.9898 + Math.round(a[1] * 10) * 78.233 + Math.round(b[0] * 10) * 12.9898 + Math.round(b[1] * 10) * 78.233) * 43758.5453; return s - Math.floor(s) - .5; };
  const rec = (a, b, out) => {
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy);
    if (L > 5) {
      /* ordem fixa das pontas, para os dois países que dividem a fronteira terem o mesmo recorte */
      const inv = a[0] > b[0] || (a[0] === b[0] && a[1] > b[1]);
      const k = ruido(a, b) * .34 * (inv ? -1 : 1);
      const m = [(a[0] + b[0]) / 2 - dy * k, (a[1] + b[1]) / 2 + dx * k];
      rec(a, m, out); rec(m, b, out);
    } else out.push(b);
  };
  const caminho = (pts, recorta = true) => {
    const out = [];
    pts.forEach((p, i) => { const q = pts[(i + 1) % pts.length]; if (recorta) rec(p, q, out); else out.push(q); });
    return 'M' + out.map(p => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('L') + 'Z';
  };
  const centro = pts => { const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]); return [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2]; };

  /* ───── contornos ───── */
  const BRASIL = [[-51.5, 4.3], [-50, 0], [-48.4, -1], [-44, -2.5], [-40, -2.9], [-37, -4.8], [-35.3, -5.3], [-34.9, -7.5], [-35.5, -9.5], [-37.2, -11.5], [-39, -13.5], [-39.2, -17.5], [-40, -20], [-41, -22], [-44, -23], [-46.5, -24.1], [-48.5, -26], [-48.7, -28.5], [-50.5, -30.5], [-53.3, -33.7], [-57.6, -30.2], [-53.8, -27.2], [-54.6, -25.6], [-55.5, -23.9], [-57.9, -22.1], [-58.2, -19.8], [-57.6, -17.8], [-60.2, -16.2], [-60.5, -13.8], [-65.3, -11.8], [-65.4, -9.7], [-70.6, -11], [-73, -9.3], [-73.8, -7.2], [-70, -4.3], [-69.5, 1], [-67, 1.8], [-64, 1.8], [-64, 4], [-60.8, 5.2], [-59.8, 2], [-56, 2], [-54, 2.2]];
  const PORTUGAL = [[-8.8, 41.9], [-6.4, 41.7], [-6.9, 40.9], [-7, 39.7], [-7.3, 38.5], [-7.4, 37.2], [-9, 37], [-8.8, 38.4], [-9.5, 38.7], [-8.8, 40.3]];
  const ESPANHA = [[-9.2, 43.2], [-6, 43.6], [-1.8, 43.4], [.7, 42.8], [3.2, 42.4], [3.2, 41.8], [.9, 41], [0, 39.9], [-.3, 39.3], [.2, 38.7], [-.7, 37.7], [-2, 36.8], [-4.5, 36.7], [-5.5, 36.1], [-6.4, 36.8], [-7.4, 37.2], [-7.3, 38.5], [-7, 39.7], [-6.9, 40.9], [-6.4, 41.7], [-8.8, 41.9]];
  const IRLANDA = [[-6.2, 52.2], [-6, 53.5], [-5.5, 54.4], [-7.2, 55.3], [-8.5, 54.5], [-10, 54.2], [-9.5, 53.3], [-10.3, 52.2], [-9.8, 51.5], [-8.2, 51.8]];
  const GRECIA = [[20.2, 39.6], [21, 40.8], [23, 41.3], [26, 41.4], [26, 40.7], [23.8, 40.5], [23, 40.2], [23.3, 39], [24, 38], [23.1, 37.4], [23.1, 36.5], [21.7, 36.8], [21.2, 38.3]];
  const CRETA = [[23.5, 35.6], [26.3, 35.4], [26, 34.9], [23.8, 35]];
  const ESCANDINAVIA = [[11.2, 59], [10.5, 59.2], [8, 58.1], [5.6, 58.7], [5, 61.5], [8.5, 63.7], [12.5, 66], [15.5, 68.5], [20, 70], [25.7, 71], [31, 70.3], [29, 69], [24, 68.6], [24, 66], [22, 65.7], [17.5, 62], [17.3, 60.7], [19, 59.8], [16.5, 57.5], [14.2, 55.5], [12.8, 55.5]];
  const DINAMARCA = [[8.6, 54.9], [8.2, 56.5], [10.5, 57.7], [10.8, 56.2], [9.8, 54.9]];
  const ISLANDIA = [[-24, 65.5], [-22, 66.4], [-16, 66.5], [-13.7, 65], [-18.5, 63.4], [-22.5, 64]];
  const JAPAO = [
    [[131, 34.2], [133, 35.5], [136, 35.8], [137, 37.4], [139, 38.2], [140, 40], [141, 41.4], [142, 39.7], [141, 37], [140.8, 35.7], [139, 34.8], [136.8, 34.4], [135.7, 33.5], [133.5, 34.4]],
    [[140, 41.6], [140.4, 43.3], [141.8, 45.4], [145.3, 43.6], [143.2, 42.1]],
    [[130, 33.3], [131.7, 33.5], [131.3, 31.4], [130.2, 31.2]],
    [[132.5, 33.5], [134.5, 34.2], [134.2, 33.4], [132.9, 32.9]]];
  const CHINA = [[130.6, 42.4], [127, 41.7], [124.3, 40], [121.5, 39], [118, 39], [122, 37], [119.5, 35], [122, 31], [120, 27], [116, 23], [110, 21], [106, 22.5], [101.5, 21.5], [98, 25], [97, 28.5], [92, 27.5], [86, 28], [81, 30.3], [78.5, 33.5], [74.5, 37.5], [74, 40], [80, 42.5], [80.5, 45], [85.5, 48.5], [91, 45], [96, 42.700], [105, 41.6], [111.5, 44], [116.5, 46.5], [120, 47.5], [120, 52.500], [125.5, 53], [131, 48], [134.5, 48.2], [131, 44.8]];
  /* Velho Oeste: do Pacífico às Grandes Planícies (oeste dos Estados Unidos). */
  const ITALIA = [[7.6, 44.1], [6.8, 45.3], [7.1, 45.9], [8.9, 46.4], [10.4, 46.6], [12.3, 46.9], [13.7, 46.5], [13.8, 45.6], [12.3, 45.2], [12.4, 44.2], [13.6, 43.5], [14.7, 42.1], [16.1, 41.4], [18.5, 40.2], [18.3, 39.8], [16.9, 40.4], [16.5, 39.6], [17.1, 39], [16.6, 38.4], [15.7, 37.9], [15.6, 38.9], [15.9, 39.6], [14.8, 40.2], [13.7, 41.2], [12.2, 41.8], [11.1, 42.4], [10.1, 43.9], [8.7, 44.4]];
  const ROMENIA = [[22, 47.8], [24.9, 47.7], [26.6, 48.2], [28.2, 46.6], [28.2, 45.5], [29.7, 45.2], [28.6, 43.7], [27, 44.1], [25.4, 43.6], [22.9, 43.8], [22.4, 44.5], [21.4, 44.8], [20.3, 46.1], [21.2, 46.4]];
  const PERU = [[-81.3, -4.3], [-80.3, -3.4], [-78.4, -3.6], [-77, -2.6], [-75.2, -0.1], [-73.6, -1.3], [-72.9, -2.4], [-70, -4.2], [-70.6, -9.5], [-69, -11], [-69.3, -15.4], [-69.8, -17.6], [-70.4, -18.4], [-74.5, -15.7], [-76.3, -13.5], [-77.8, -11.3], [-79.6, -8]];
  const OESTE = [[-124.4, 48.3], [-117, 49], [-104, 49], [-104, 41], [-102, 37], [-103, 32], [-106.5, 31.8], [-111, 31.3], [-114.8, 32.5], [-117.1, 32.5], [-118.5, 34], [-120.6, 34.6], [-122.5, 37.5], [-124.2, 40.4], [-124, 46.2]];
  /* Rússia: do mar Báltico ao Pacífico (o litoral é o mesmo da Eurásia). */
  const RUSSIA = [[28, 59.5], [30, 60], [30, 62.5], [29, 66], [29, 69], [31, 70.3], [41, 67], [40, 65], [34, 66.5], [37, 63.9], [44, 66], [44, 68.5], [54, 68.5], [60, 69], [68, 69], [67, 71], [72, 73], [80, 73], [87, 75], [104, 77.7], [113, 74], [128, 72.5], [140, 72.5], [160, 70], [180, 69], [180, 65], [177, 62.5], [165, 60], [162, 56], [157, 51], [156, 57], [163, 61], [155, 59.5], [143, 59], [135, 54.5], [141, 53], [140, 48], [135, 44], [131, 43], [131, 44.8], [134.5, 48.2], [131, 48], [125.5, 53], [120, 52.5], [116, 50], [107, 50], [98, 51], [88, 49.5], [80, 51], [76, 54], [68, 55], [60, 51], [50, 51], [48, 46], [47, 43], [40, 43.5], [38, 47], [40, 50], [35, 51.5], [31, 53], [28, 56.5]];
  const TERRAS = [
    /* América do Norte e Central */
    [[-168, 66], [-150, 71], [-135, 69], [-125, 70], [-115, 68], [-105, 68], [-96, 68], [-94, 72], [-88, 69], [-82, 69], [-82, 66], [-87, 64], [-94, 61], [-94, 58], [-88, 56.5], [-82, 55], [-82, 52.5], [-79, 51.5], [-79, 54.5], [-77, 57], [-78, 60], [-78, 62.4], [-73, 62], [-70, 61], [-69, 59], [-65, 60], [-62, 57], [-56, 53], [-60, 50], [-66, 50], [-70, 47], [-65, 49], [-64.5, 46.5], [-61, 45.5], [-66, 43.7], [-70, 43.5], [-70.5, 41.6], [-74, 40.5], [-76, 37], [-76, 35], [-81, 31.5], [-80, 27], [-80.5, 25.2], [-82.5, 27.5], [-84, 30], [-89.5, 29.5], [-94, 29.5], [-97.3, 27.5], [-97.5, 22], [-95, 18.7], [-91, 18.6], [-90, 21], [-87, 21.5], [-88, 16], [-83.5, 15], [-83.5, 11], [-81.5, 9], [-79, 9.5], [-77.5, 8.5], [-78, 7.5], [-80, 7.3], [-83, 8.3], [-86, 11], [-88, 13], [-92, 14.5], [-95, 16], [-99, 16.7], [-105, 19.5], [-105.5, 22], [-109, 25.5], [-112.5, 29.5], [-114.5, 31.5], [-112, 27], [-109.5, 23], [-112, 24.7], [-115, 28], [-117, 32.5], [-120.5, 34.5], [-122.5, 37.5], [-124, 40.5], [-124, 46], [-123, 48.5], [-127, 51], [-130, 54.5], [-135, 58.5], [-142, 60], [-160, 58]],
    [[-73, 78], [-60, 82], [-32, 83], [-20, 80], [-20, 75], [-22, 70.5], [-32, 68], [-40, 65], [-43.5, 60], [-48, 61], [-53, 66], [-54, 70], [-58, 75], [-68, 76]],
    [[-80, 73.5], [-72, 71], [-62, 66.5], [-66, 63], [-72, 64.5], [-73, 68], [-85, 70], [-90, 73]],
    [[-59, 47.6], [-53, 47], [-55, 50], [-57, 51.5]],
    [[-84.5, 22], [-80, 23], [-75, 20.5], [-77.5, 20]], [[-74, 18.5], [-72.5, 20], [-68.5, 18.7], [-71.5, 17.7]],
    /* América do Sul (com o litoral do Brasil) */
    [[-77.5, 8.5], [-72, 12], [-62, 10.7], [-57, 6], ...BRASIL.slice(0, 20), [-57, -36], [-57.7, -38.5], [-62, -39], [-65, -42.5], [-66, -46], [-69, -51], [-65.5, -55], [-72, -54], [-75, -50], [-74, -42], [-73.5, -37], [-71.5, -30], [-70.3, -19], [-76, -14], [-81, -5.5], [-80, -2], [-77, 3]],
    /* Ilhas do norte */
    ISLANDIA, [[-5.5, 50], [-1, 50.7], [1.4, 51.2], [1.7, 52.7], [0, 53.3], [-1.5, 55], [-2, 57.6], [-3.5, 58.6], [-5, 58.5], [-6, 56.5], [-4.8, 55], [-3, 54], [-4.5, 53.2], [-4.5, 52], [-5.2, 51.7], [-3, 51.3]], IRLANDA,
    /* Eurásia */
    [[-9, 37], [-8.8, 38.4], [-9.5, 38.7], [-8.8, 40.3], [-8.8, 41.9], [-9.2, 43.2], [-6, 43.6], [-1.8, 43.4], [-1.2, 46], [-4.5, 47.9], [-4.5, 48.6], [-1.6, 48.7], [-1.7, 49.7], [1.5, 50.2], [3.5, 51.5], [4.8, 53], [8.5, 53.7], [8.6, 54.9], [8.2, 56.5], [10.5, 57.7], [10.8, 56.2], [9.8, 54.9], [11, 54], [14, 54], [18.5, 54.7], [21, 55], [21.2, 57.5], [24.3, 57.2], [23.5, 59.2], [28, 59.5], [30, 60], [25, 60.2], [22.5, 60], [21.3, 62], [25.3, 65], [24, 66], [22, 65.7], [17.5, 62], [17.3, 60.7], [19, 59.8], [16.5, 57.5], [14.2, 55.5], [12.8, 55.5], [11.2, 59], [10.5, 59.2], [8, 58.1], [5.6, 58.7], [5, 61.5], [8.5, 63.7], [12.5, 66], [15.5, 68.5], [20, 70], [25.7, 71], [31, 70.3], [41, 67], [40, 65], [34, 66.5], [37, 63.9], [44, 66], [44, 68.5], [54, 68.5], [60, 69], [68, 69], [67, 71], [72, 73], [80, 73], [87, 75], [104, 77.7], [113, 74], [128, 72.5], [140, 72.5], [160, 70], [180, 69], [180, 65], [177, 62.5], [165, 60], [162, 56], [157, 51], [156, 57], [163, 61], [155, 59.5], [143, 59], [135, 54.5], [141, 53], [140, 48], [135, 44], [131, 43], [127.5, 40], [129.3, 36], [126.5, 34.5], [125, 38], [121.5, 39], [118, 39], [122, 37], [119.5, 35], [122, 31], [120, 27], [116, 23], [110, 21], [106, 19], [109, 13], [105, 9], [100.5, 13.5], [99.5, 9], [103.5, 1.5], [101, 3], [98, 8.5], [97.5, 16.5], [94.5, 16], [91.5, 22.5], [87, 21], [80.3, 15], [80, 11], [77.6, 8.1], [74, 15], [72.8, 20], [70, 21.5], [67, 25], [57, 25.8], [56, 27], [51, 28], [48, 30], [50, 26.5], [51.5, 25], [56.3, 26], [59.8, 22.5], [55, 17.5], [45, 12.8], [43, 13], [42.5, 16.5], [39, 21.5], [35, 28], [34.5, 31.5], [36, 36], [30.5, 36.6], [27.5, 37], [26.3, 39.5], [29, 41], [35, 42], [41.5, 41.5], [39, 44], [37, 47], [33.5, 46.2], [30.5, 46], [28, 43.5], [28, 41.3], [26, 40.7], [23.8, 40.5], [23, 40.2], [23.3, 39], [24, 38], [23.1, 37.4], [23.1, 36.5], [21.7, 36.8], [21.2, 38.3], [20.2, 39.6], [19.4, 40.5], [19.4, 42], [15.5, 44], [13.5, 45.6], [12.3, 45], [13.6, 43.6], [16, 41.9], [18.4, 40.2], [17, 39], [16, 38], [15.6, 40], [12.3, 41.7], [10.3, 43.5], [8.8, 44.4], [6, 43.2], [3.1, 43.1], [3.2, 42.4], [3.2, 41.8], [.9, 41], [0, 39.9], [-.3, 39.3], [.2, 38.7], [-.7, 37.7], [-2, 36.8], [-4.5, 36.7], [-5.5, 36.1], [-6.4, 36.8], [-7.4, 37.2]],
    [[12.4, 38], [15.5, 38.2], [15.1, 36.7]], [[8.3, 41], [9.7, 41], [9.5, 39.2], [8.5, 39]], [[8.7, 42.9], [9.5, 42.5], [9, 41.4]], CRETA, [[32.4, 35], [34.4, 35.5], [33.5, 34.7]],
    /* África */
    [[-5.9, 35.8], [-2, 35.1], [3, 36.8], [10, 37.3], [11, 34], [15, 32.3], [19.5, 30.5], [22, 32.8], [29, 30.9], [32.5, 31.2], [34.3, 28], [36, 23], [37.3, 19], [39.5, 15.5], [43.2, 11.8], [51, 11.9], [47.5, 4], [42, -1.5], [39, -6], [40.6, -14.7], [35, -20], [35.5, -24], [32.5, -27], [28, -33], [20, -34.8], [18, -32], [15, -27], [12, -17], [13.5, -9], [9, -1], [9.5, 4], [4.5, 6.2], [-2, 4.8], [-7.5, 4.3], [-13, 9], [-17, 14.5], [-16.5, 20], [-13, 27.5], [-9.7, 31], [-6.5, 34]],
    [[49.3, -12], [50.3, -15.5], [47, -25], [44, -24.5], [44.3, -17]],
    /* Oceania e sudeste da Ásia */
    [[114, -22], [122, -18], [129, -15], [131, -12], [136, -12], [136, -15], [140.5, -17.5], [142.5, -11], [146, -19], [153, -25.5], [153, -31], [150, -37.5], [144, -38.3], [138, -35], [131, -31.5], [124, -33], [115, -34.5]], [[145, -41], [148.2, -41], [147, -43.5]],
    [[95.5, 5.5], [104, -2], [105.7, -5.8], [101, -2.5]], [[105.5, -6.8], [114.4, -7.8], [114, -8.6], [106.5, -7.4]], [[109, 1.5], [117, 7], [119, 5], [117.8, .8], [116, -4], [110.3, -2.9]], [[131, -1], [141, -2.7], [150, -10.2], [142, -9], [133, -4]], [[120.5, 18.4], [122.2, 18.4], [124, 13], [121, 13.8]], [[122, 7], [126.3, 9], [125.5, 6]], [[119.5, .8], [125, 1.5], [121, -1], [122.5, -5.2], [119.5, -5.5]], [[120.2, 23], [121.6, 25.2], [120.9, 22]], [[79.9, 9.5], [81.8, 7.5], [80.3, 6]], [[142, 46], [142.2, 54.2], [143.4, 50]],
  ];
  /* O continente perdido: um "C" aberto para o mar de Tétis, no meio do oceano Índico. */
  const PANGEIA = [[-35, -62], [0, -72], [38, -62], [58, -40], [40, -26], [12, -22], [2, -4], [10, 12], [38, 16], [60, 30], [48, 58], [15, 74], [-20, 70], [-34, 46], [-30, 20], [-48, 0], [-55, -30]].map(([x, y]) => [742 + x * 1.12, 466 + y * .98]);
  const amplia = (grupos, k, dx, dy, c) => grupos.map(g => g.map(([x, y]) => [c[0] + (x - c[0]) * k + dx, c[1] + (y - c[1]) * k + dy]));
  const jp0 = JAPAO.map(g => g.map(proj)), ie0 = [IRLANDA.map(proj)];

  /* áreas em pixels do mapa e onde fica o medalhão (deslocado do centro da área) */
  const PAISES = {
    br: { areas: [BRASIL.map(proj)], med: [4, -2] },
    pt: { areas: [PORTUGAL.map(proj)], med: [-74, 8] },
    es: { areas: [ESPANHA.map(proj)], med: [6, 66] },
    ie: { areas: amplia(ie0, 1.18, -5, 0, centro(ie0[0])), med: [-72, -10] },
    no: { areas: [ESCANDINAVIA.map(proj), DINAMARCA.map(proj), ISLANDIA.map(proj)], foco: 0, med: [-84, 6] },
    gr: { areas: [GRECIA.map(proj), CRETA.map(proj)], foco: 0, med: [24, 46] },
    jp: { areas: amplia(jp0, 1.95, 10, 4, centro(jp0[0])), foco: 0, med: [-2, 74] },
    cn: { areas: [CHINA.map(proj)], med: [6, -2] },
    ru: { areas: [RUSSIA.map(proj)], med: [-30, 14] },
    oe: { areas: [OESTE.map(proj)], med: [0, 0] },
    pe: { areas: [PERU.map(proj)], med: [-12, 20] },
    dr: { areas: [ROMENIA.map(proj)], med: [10, -26] },
    rm: { areas: [ITALIA.map(proj)], med: [-6, 30] },
    pg: { areas: [PANGEIA], med: [-34, 0], perdida: true },
  };
  /* nome e cor de cada país vêm do deck (pais: { nome, cor } em js/arena/dados/<nação>.js); deck com erro sai do mapa */
  for (const id of Object.keys(PAISES)) if (!AR_DECKS[id]) delete PAISES[id]; else Object.assign(PAISES[id], AR_DECKS[id].pais);
  /* deck novo ainda sem desenho no mapa: ganha um quadradinho no rodapé (para desenhar o país, veja COMO-EDITAR.md) */
  let semMapa = 0;
  for (const id of Object.keys(AR_DECKS)) if (!PAISES[id]) { const x = 70 + 80 * semMapa++, y = 520; PAISES[id] = { areas: [[[x - 22, y - 16], [x + 22, y - 16], [x + 22, y + 16], [x - 22, y + 16]]], med: [0, -40], semMapa: true, ...AR_DECKS[id].pais }; }
  for (const P of Object.values(PAISES)) {
    P.centro = centro(P.areas[P.foco || 0]);
    P.m = [P.centro[0] + P.med[0], P.centro[1] + P.med[1]];
    const xs = P.areas.flat().map(p => p[0]), ys = P.areas.flat().map(p => p[1]);
    P.caixa = [Math.min(...xs), Math.min(...ys), Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)];
  }

  /* ───── desenho ───── */
  const ROSA = [0, 1, 2, 3, 4, 5, 6, 7].map(k => `<path d="M0 0 L5 -9 L0 -${k % 2 ? 22 : 36} L-5 -9Z" transform="rotate(${k * 45})"/>`).join('');
  function svg({ arte, bandeira }) {
    const grade = [-120, -90, -60, -30, 0, 30, 60, 90, 120, 150].map(lo => { const x = proj([lo, 0])[0].toFixed(1); return `<path d="M${x} -60V${H + 60}"/>`; }).join('')
      + [60, 40, 20, 0, -20, -40].map(la => { const y = proj([0, la])[1].toFixed(1); return `<path d="M-200 ${y}H${W + 200}"/>`; }).join('');
    const rumos = Array.from({ length: 16 }, (_, k) => { const a = k * Math.PI / 8; return `<path d="M352 480 L${(352 + Math.cos(a) * 1300).toFixed(0)} ${(480 + Math.sin(a) * 1300).toFixed(0)}"/>`; }).join('');
    const terra = TERRAS.map(g => caminho(g.map(proj))).join(' ');
    const jpD = !PAISES.jp ? '' : PAISES.jp.areas.map(g => caminho(g)).join(' ');
    const areaD = {};
    for (const [id, P] of Object.entries(PAISES)) areaD[id] = P.areas.map(g => caminho(g)).join(' ');
    const defs = Object.entries(PAISES).map(([id, P]) => `<clipPath id="ma-c-${id}"><path d="${areaD[id]}"/></clipPath><clipPath id="ma-r-${id}"><circle cx="${P.m[0].toFixed(1)}" cy="${P.m[1].toFixed(1)}" r="19"/></clipPath>
      <radialGradient id="ma-l-${id}"><stop offset="0" stop-color="${P.cor}" stop-opacity=".85"/><stop offset=".45" stop-color="${P.cor}" stop-opacity=".28"/><stop offset="1" stop-color="${P.cor}" stop-opacity="0"/></radialGradient>
      <linearGradient id="ma-f-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.cor}" stop-opacity="0"/><stop offset="1" stop-color="${P.cor}" stop-opacity=".6"/></linearGradient>`).join('');
    /* 1ª camada: áreas dos países (com a pintura do cenário dentro) e a luz que sai delas */
    const areas = Object.entries(PAISES).map(([id, P]) => {
      const [x, y, w, h] = P.caixa, R = Math.max(62, Math.max(w, h) * .95);
      const faisca = Array.from({ length: 9 }, (_, k) => `<circle class="ma-faisca" style="--k:${k}" cx="${(P.centro[0] + Math.sin(k * 2.4) * Math.min(w, 120) * .42).toFixed(1)}" cy="${(P.centro[1] + Math.cos(k * 1.7) * Math.min(h, 100) * .3).toFixed(1)}" r="${1.3 + (k % 3) * .5}"/>`).join('');
      return `<g class="ma-area ${P.perdida ? 'perdida' : ''}" data-mapa="${id}" style="--cor:${P.cor}">
        <circle class="ma-luz" cx="${P.centro[0].toFixed(1)}" cy="${P.centro[1].toFixed(1)}" r="${R.toFixed(0)}" fill="url(#ma-l-${id})"/>
        <path class="ma-aura" d="${areaD[id]}"/>
        <image class="ma-cena" href="${arte(id)}" x="${(x - 4).toFixed(1)}" y="${(y - 4).toFixed(1)}" width="${(w + 8).toFixed(1)}" height="${(h + 8).toFixed(1)}" preserveAspectRatio="xMidYMid slice" clip-path="url(#ma-c-${id})"/>
        <path class="ma-tinta" d="${areaD[id]}"/><path class="ma-borda" d="${areaD[id]}"/>
        <g class="ma-feixe" filter="url(#ma-borra3)"><path d="M${(P.centro[0] - 34).toFixed(1)} ${P.centro[1].toFixed(1)} L${(P.centro[0] - 12).toFixed(1)} ${(P.centro[1] - 180).toFixed(1)} h24 L${(P.centro[0] + 34).toFixed(1)} ${P.centro[1].toFixed(1)}Z" fill="url(#ma-f-${id})"/></g>
        <circle class="ma-onda" cx="${P.centro[0].toFixed(1)}" cy="${P.centro[1].toFixed(1)}" r="30"/><circle class="ma-onda dois" cx="${P.centro[0].toFixed(1)}" cy="${P.centro[1].toFixed(1)}" r="30"/>
        ${faisca}</g>`;
    }).join('');
    /* 2ª camada: medalhões dos Líderes */
    const meds = Object.entries(PAISES).map(([id, P]) => {
      const [mx, my] = P.m, longe = Math.hypot(P.med[0], P.med[1]) > 30;
      return `<g class="ma-med" data-mapa="${id}" tabindex="0" role="button" aria-label="${P.nome}" style="--cor:${P.cor}">
        ${longe ? `<path class="ma-fio" d="M${mx.toFixed(1)} ${my.toFixed(1)}L${P.centro[0].toFixed(1)} ${P.centro[1].toFixed(1)}"/><circle class="ma-pino" cx="${P.centro[0].toFixed(1)}" cy="${P.centro[1].toFixed(1)}" r="3"/>` : ''}
        <g class="ma-med-in"><circle class="ma-aro-fora" cx="${mx.toFixed(1)}" cy="${my.toFixed(1)}" r="24"/><circle class="ma-aro" cx="${mx.toFixed(1)}" cy="${my.toFixed(1)}" r="20"/>
        <image href="${arte(id, true)}" x="${(mx - 28).toFixed(1)}" y="${(my - 20).toFixed(1)}" width="56" height="42" preserveAspectRatio="xMidYMid slice" clip-path="url(#ma-r-${id})"/>
        <g transform="translate(${(mx + 7).toFixed(1)} ${(my + 8).toFixed(1)})"><rect x="-1" y="-1" width="19" height="13.6" rx="1.5" fill="#07141a"/><svg width="17" height="11.6" viewBox="0 0 30 21">${bandeira(id)}</svg></g></g>
        <text class="ma-nome" x="${mx.toFixed(1)}" y="${(my + 36).toFixed(1)}">${P.nome}</text></g>`;
    }).join('');
    return `<svg class="ma-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" aria-label="Mapa-múndi das nações">
      <defs>
        <linearGradient id="ma-terra" x1="0" y1="0" x2=".4" y2="1"><stop offset="0" stop-color="#8d7a52"/><stop offset=".5" stop-color="#6f6a45"/><stop offset="1" stop-color="#4c5136"/></linearGradient>
        <filter id="ma-papel" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".035 .05" numOctaves="4" seed="7" result="r"/><feColorMatrix in="r" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1.5 -.45" result="m"/><feComposite in="m" in2="SourceAlpha" operator="in" result="s"/><feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="s"/></feMerge></filter>
        <filter id="ma-borra" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="5"/></filter>
        <filter id="ma-borra3" x="-60%" y="-10%" width="220%" height="120%"><feGaussianBlur stdDeviation="7 2"/></filter><filter id="ma-borra2" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="14"/></filter>
        <radialGradient id="ma-monstro-m"><stop offset=".35" stop-color="#fff"/><stop offset="1" stop-color="#000"/></radialGradient>
        <mask id="ma-monstro"><ellipse cx="250" cy="118" rx="64" ry="48" fill="url(#ma-monstro-m)"/></mask>
        <path id="ma-rota1" d="M150 400 C210 330 230 300 330 292 S400 330 372 300"/>
        <path id="ma-rota2" d="M560 470 C610 400 640 395 690 350 S800 300 850 330"/>
        ${defs}
      </defs>
      <g class="ma-rumos">${rumos}</g><g class="ma-grade">${grade}</g>
      <image class="ma-monstro" href="arte/a_no_tentaculo.jpg" x="182" y="66" width="136" height="104" preserveAspectRatio="xMidYMid slice" mask="url(#ma-monstro)"/>
      <path class="ma-raso" d="${terra} ${jpD}"/><path class="ma-raso dois" d="${terra} ${jpD}"/>
      <g filter="url(#ma-papel)"><path class="ma-terra" d="${terra} ${jpD}"/></g>
      <path class="ma-mundo-vivo" d="${terra} ${jpD}"/>
      <g class="ma-rosa" transform="translate(352 480) scale(.95)"><circle r="40"/><circle r="30"/>${ROSA}<text y="-42">N</text></g>
      <g class="ma-nuvens" filter="url(#ma-borra2)"><ellipse class="ma-nuvem" cx="200" cy="200" rx="90" ry="18"/><ellipse class="ma-nuvem b" cx="620" cy="390" rx="120" ry="20"/><ellipse class="ma-nuvem c" cx="820" cy="140" rx="110" ry="16"/></g>
      ${areas}
      <path class="ma-duelo" id="ma-duelo" d=""/>
      <g class="ma-barco"><path d="M-7 3 H7 L4 7 H-4Z M0 -8 V3 M0 -8 C7 -6 7 0 0 1Z"/><animateMotion dur="46s" repeatCount="indefinite" rotate="0"><mpath href="#ma-rota1"/></animateMotion></g>
      <g class="ma-barco"><path d="M-7 3 H7 L4 7 H-4Z M0 -8 V3 M0 -8 C7 -6 7 0 0 1Z"/><animateMotion dur="38s" repeatCount="indefinite" rotate="0"><mpath href="#ma-rota2"/></animateMotion></g>
      ${meds}</svg>`;
  }
  /* Arco de batalha entre dois países. */
  const arco = (a, b) => {
    if (!PAISES[a] || !PAISES[b] || a === b) return '';
    const [x1, y1] = PAISES[a].m, [x2, y2] = PAISES[b].m, d = Math.hypot(x2 - x1, y2 - y1);
    return `M${x1.toFixed(1)} ${y1.toFixed(1)}Q${((x1 + x2) / 2).toFixed(1)} ${(Math.min(y1, y2) - d * .22).toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
  };
  return { svg, arco, PAISES };
})();
