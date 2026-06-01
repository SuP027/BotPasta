const https = require('https');
const BOT_TOKEN='8862217647:AAHUK6sTht5sEKAAkqfP0rUSPQla_I-Sfhk'; //
const CHAT_ID='-5163250767';
const INTERVALO_MS = 10 * 60 * 1000; // 10 minutos
const ANUNCIOS_POR_CICLO = 3;

const PRODUTOS = [
  { titulo: '🚀 Multiprocessador Philco Turbo 5 EM 1 - 900W de Potência! Imperdível!', link: 'https://meli.la/2JompFT' },
  { titulo: '🧤 Luva de Látex Descartável - Pacote com 100 unidades! Proteção total!', link: 'https://meli.la/1yzJoXc' },
  { titulo: '👧 Vestido Festa Junina Infantil - Arraia Caipira Florida! Perfeito para a festa!', link: 'https://meli.la/1waphYV' },
  { titulo: '🎮 Controle DualSense PS5 Branco - Sem Fio! Experiência Next-Gen!', link: 'https://meli.la/1rdJduG' },
  { titulo: '🩴 Chinelo Havaianas - Conforto e estilo que você merece!', link: 'https://meli.la/1T1afcS' },
  { titulo: '🚿 Chuveiro Lorenzetti Ultra Eletrônico 7500W - Potência e economia!', link: 'https://meli.la/2wDZci7' },
  { titulo: '📱 Samsung Galaxy A07 128GB - Câmera 50MP + Tela 6.7" + 4GB RAM!', link: 'https://meli.la/1nb2ieq' },
  { titulo: '🔧 Parafusadeira Furadeira Kit Completo + 2 Baterias + Maleta! Pronta para usar!', link: 'https://meli.la/1SGwYiQ' },
  { titulo: '👟 Tênis Sneeks Feminino - Casual, Academia e Treino! Promoção especial!', link: 'https://meli.la/1z1KkhD' },
  { titulo: '🧥 Jaqueta Puffer Térmica Bobojaco - Estilo e proteção contra o frio!', link: 'https://meli.la/1VHi3hX' },
  { titulo: '🇧🇷 Camisa Seleção Canarinho 26/27 - Lançamento oficial! Mostre seu amor pelo Brasil!', link: 'https://meli.la/2BTqKU1' },
  { titulo: '🔌 Extensão Elétrica 6 Tomadas + Filtro de Linha - Cabo 2m! Segurança e praticidade!', link: 'https://meli.la/1Z9nk9G' },
  { titulo: '🪞 Espelho Corpo Inteiro 100x50 Orgânico - Moldura Caramelo/Preto! Decoração exclusiva!', link: 'https://meli.la/13cWSjy' },
  { titulo: '💇 Wella Professionals Smoothening Oil 100ml - Óleo capilar profissional! Brilho e maciez!', link: 'https://meli.la/1xnUNpY' },
  { titulo: '🧴 Kit Azzaro Pour Homme - EDT 100mL + Gel de Banho 75mL! Fragrância irresistível!', link: 'https://meli.la/1vjfmaD' },
  { titulo: '🚿 Lavadora Alta Pressão Vonder LAV 1300 - 1300 Libras! Limpeza pesada sem esforço!', link: 'https://meli.la/2LSzdLj' },
  { titulo: '📚 Kit Livro de Colorir Comfy Cozy - Capa Dura! Diversão e relaxamento garantidos!', link: 'https://meli.la/1PrFrVn' }
];

const FRASES_CHAMADA = [
  'Esse achado não fica por muito tempo — confere agora!',
  'Estoque voando! Corre antes que acabe!',
  'Desconto bom assim é raro. Garante o seu!',
  'Se você estava esperando o momento, é esse.',
  'Últimas unidades no precinho. Corre!',
  'Aposto que você vai querer um pra chamar de seu.',
  'Antes que suma, vai lá que vale a pena!',
  'Essa oferta não dura até amanhã, confia!',
  'Quem vê primeiro, economiza mais. Corre!',
  'Quase saindo do ar — garanta já!'
];

function send(text) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ chat_id: CHAT_ID, text });
    const req = https.request({
      hostname: 'api.telegram.org',
      path: `/bot${BOT_TOKEN}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, res => {
      let b = '';
      res.on('data', d => b += d);
      res.on('end', () => {
        try { resolve(JSON.parse(b)); }
        catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function sorteiaFrase() {
  return FRASES_CHAMADA[Math.floor(Math.random() * FRASES_CHAMADA.length)];
}

async function ciclo() {
  const itens = shuffle(PRODUTOS).slice(0, ANUNCIOS_POR_CICLO);
  for (const item of itens) {
    const frase = sorteiaFrase();
    const text = `OFERTA IMPERDÍVEL\n\n${item.titulo}\n🔗 ${item.link}\n\n${frase}`;
    const r = await send(text);
    console.log('Enviado:', item.titulo, '->', r.ok ? 'OK' : 'ERRO', r.description || '');
    await new Promise(r => setTimeout(r, 1500));
  }
}

(async () => {
  console.log('Bot com', PRODUTOS.length, 'produtos. Ciclo de', ANUNCIOS_POR_CICLO, 'anúncios a cada', INTERVALO_MS / 1000 / 60, 'min.');
  await ciclo();
  setInterval(() => {
    console.log('\nNova rodada...');
    ciclo();
  }, INTERVALO_MS);
  console.log('Rodando... Ctrl+C para parar.');
})();
