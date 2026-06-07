const https = require('https');

// --- CONFIG ---
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const ANUNCIOS_POR_CICLO = parseInt(process.env.ANUNCIOS_POR_CICLO || '3', 10);
const DELAY_ENTRE_MSGS_MS = parseInt(process.env.DELAY_ENTRE_MSGS_MS || '2000', 10);

// --- DADOS ---
// ⭐ EDITE AQUI: troque os links e frases para o novo grupo/bot ⭐
const PRODUTOS = [
  { titulo: '🚀 Multiprocessador Philco Turbo 5 EM 1 - 900W!', link: 'https://meli.la/2JompFT' },
  { titulo: '🧤 Luva de Látex Descartável 100 unidades', link: 'https://meli.la/1yzJoXc' },
  { titulo: '👧 Vestido Festa Junina Infantil - Arraia Caipira!', link: 'https://meli.la/1waphYV' },
  { titulo: '🎮 Controle DualSense PS5 Branco Sem Fio', link: 'https://meli.la/1rdJduG' },
  { titulo: '🩴 Chinelo Havaianas - Conforto e Estilo!', link: 'https://meli.la/1T1afcS' },
  { titulo: '🚿 Chuveiro Lorenzetti Eletrônico 7500W', link: 'https://meli.la/2wDZci7' },
  { titulo: '📱 Samsung Galaxy A07 128GB 50MP + 4GB RAM', link: 'https://meli.la/1nb2ieq' },
  { titulo: '🔧 Parafusadeira Kit Completo + 2 Baterias + Maleta', link: 'https://meli.la/1SGwYiQ' },
  { titulo: '👟 Tênis Sneeks Feminino - Casual & Academia!', link: 'https://meli.la/1z1KkhD' },
  { titulo: '🧥 Jaqueta Puffer Térmica Bobojaco', link: 'https://meli.la/1VHi3hX' },
  { titulo: '🇧🇷 Camisa Seleção Canarinho 26/27 - Lançamento!', link: 'https://meli.la/2BTqKU1' },
  { titulo: '🔌 Extensão Elétrica 6 Tomadas + Filtro 2m', link: 'https://meli.la/1Z9nk9G' },
  { titulo: '🪞 Espelho Corpo Inteiro Moldura Caramelo/Preto', link: 'https://meli.la/13cWSjy' },
  { titulo: '💇 Wella Smoothening Oil 100ml Profissional', link: 'https://meli.la/1xnUNpY' },
  { titulo: '🧴 Kit Azzaro Pour Homme EDT 100mL + Gel', link: 'https://meli.la/1vjfmaD' },
  { titulo: '🚿 Lavadora Alta Pressão Vonder 1300 Libras', link: 'https://meli.la/2LSzdLj' },
  { titulo: '📚 Kit Livro de Colorir Comfy Cozy - Capa Dura', link: 'https://meli.la/1PrFrVn' },
];

const FRASES_CHAMADA = [
  '🔥 Achado imperdível! Corre que o estoque voa!',
  '💸 Desconto assim é raro — garante o seu!',
  '⚡ Oferta-relâmpago! Não deixa passar!',
  '🎯 Achadinho do dia — confere agora!',
  '🏷️ Preço baixou! É hora de aproveitar!',
  '🚨 Últimas unidades — quem chegar primeiro, leva!',
  '💰 Economia garantida — link na bio!',
  '🛒 Clique e garanta antes que acabe!',
  '🤩 Promoção especial, só por tempo limitado!',
  '👀 Achou que não ia ver? Olha isso aqui!',
];

// --- UTILITÁRIOS ---

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

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function callTelegram(method, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const req = https.request({
      hostname: 'api.telegram.org',
      path: `/bot${BOT_TOKEN}/${method}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.ok) {
            resolve(parsed);
          } else {
            reject(new Error(`Telegram API error: ${parsed.description || JSON.stringify(parsed)}`));
          }
        } catch (err) {
          reject(err);
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function enviarMensagem(texto) {
  return callTelegram('sendMessage', {
    chat_id: CHAT_ID,
    text: texto,
    parse_mode: 'HTML',
    disable_web_page_preview: false,
  });
}

// --- LÓGICA PRINCIPAL ---

async function rodarCiclo() {
  if (!BOT_TOKEN) {
    throw new Error('Variável BOT_TOKEN não definida');
  }
  if (!CHAT_ID) {
    throw new Error('Variável CHAT_ID não definida');
  }

  console.log(`Bot iniciado — ${PRODUTOS.length} produtos, ${ANUNCIOS_POR_CICLO} por ciclo`);

  // Empilha todos os produtos e embaralha
  const selecionados = shuffle(PRODUTOS).slice(0, Math.min(ANUNCIOS_POR_CICLO, PRODUTOS.length));

  // Envia mensagem de abertura
  try {
    await enviarMensagem('🛍️ <b>Achadinhos do dia!</b> Confira as ofertas abaixo 👇');
    await delay(1000);
  } catch (e) {
    console.error('Erro ao enviar abertura:', e.message);
  }

  for (const produto of selecionados) {
    const frase = sorteiaFrase();
    const texto = [
      `📢 <b>${produto.titulo}</b>`,
      `🔗 <a href="${produto.link}">Ver oferta no Mercado Livre</a>`,
      ``,
      frase,
    ].join('\n');

    try {
      const r = await enviarMensagem(texto);
      console.log(`✅ Enviado: "${produto.titulo.substring(0, 40)}..." — message_id=${r.result?.message_id}`);
    } catch (e) {
      console.error(`❌ Erro ao enviar "${produto.titulo.substring(0, 40)}":`, e.message);
      // Tenta 1 retry rápido
      await delay(1500);
      try {
        const r2 = await enviarMensagem(texto);
        console.log(`✅ Retry OK: "${produto.titulo.substring(0, 40)}..." — message_id=${r2.result?.message_id}`);
      } catch (e2) {
        console.error(`❌ Falhou definitivamente:`, e2.message);
      }
    }

    // Pausa entre mensagens para não ser bloqueado pelo Telegram
    await delay(DELAY_ENTRE_MSGS_MS);
  }

  // Envia mensagem de encerramento / CTA
  try {
    await enviarMensagem('💡 <b>Fique de olho que tem mais!</b>\nA cada 10 minutos tem oferta nova por aqui. 🚀');
    console.log('✅ Ciclo completo.');
  } catch (e) {
    console.error('Erro ao enviar fechamento:', e.message);
  }
}

// Executa e sai (o GitHub Actions chama de novo no próximo cron)
(async () => {
  try {
    await rodarCiclo();
    console.log('Execucao finalizada com sucesso. Ate a proxima!');
    process.exit(0);
  } catch (err) {
    console.error('FALHA GERAL:', err.message);
    process.exit(1);
  }
})();
