const tipos = [
  { id: 1,  nome: 'Zumbi' },
  { id: 2,  nome: 'Vampiro' },
  { id: 3,  nome: 'Lobisomem' },
  { id: 4,  nome: 'Fantasma' },
  { id: 5,  nome: 'Bruxa' },
  { id: 6,  nome: 'Demônio' },
  { id: 7,  nome: 'Múmia' },
  { id: 8,  nome: 'Esqueleto' },
  { id: 9,  nome: 'Palhaço' },
  { id: 10, nome: 'Alienígena' }
];

const emojis = {
  'Zumbi': '🧟', 'Vampiro': '🧛', 'Lobisomem': '🐺',
  'Fantasma': '👻', 'Bruxa': '🧙', 'Demônio': '😈',
  'Múmia': '🧟‍♂️', 'Esqueleto': '💀', 'Palhaço': '🤡', 'Alienígena': '👽'
};

const elMonstro = document.getElementById('monstro');
const elJogador = document.getElementById('jogador');
const elArvore = document.getElementById('arvore');
const elEmojiMonstro = document.getElementById('emojiMonstro');
const elTexto = document.getElementById('texto');
const elPontos = document.getElementById('pontos');
const elGameOver = document.getElementById('gameOver');
const elMsgGameOver = document.getElementById('msgGameOver');
const elExplicacao = document.getElementById('explicacao');
const btnPular = document.getElementById('btnPular');
const btnVoltar = document.getElementById('btnVoltar');
const btnComecar = document.getElementById('btnComecar');

let jogando = false;
let pulando = false;
let posMonstro = 5;
let posArvore = 100;
let velArvore = 0.8;
let velMonstro = 0.02;
let pontos = 0;
let arvoreJaBateu = false;
let timerPulo = null;
let monstroAtualId = null;

carregarMonstro();

function carregarMonstro() {
  const dados = localStorage.getItem('monstros');
  if (dados) {
    const personagens = JSON.parse(dados);
    if (personagens.length > 0) {
      const p = personagens[personagens.length - 1];
      monstroAtualId = p.id;

      const tipo = tipos.find(t => t.id === p.tipo_id);
      const tipoNome = tipo ? tipo.nome : 'Desconhecido';

      elEmojiMonstro.textContent = emojis[tipoNome] || '👻';
      elTexto.textContent = `${p.nome} (${tipoNome}) está te perseguindo! Pule as árvores!`;
      return;
    }
  }
  elTexto.textContent = 'Pule as árvores para sobreviver!';
}

btnComecar.addEventListener('click', function () {
  elExplicacao.style.display = 'none';
  jogando = true;
  loop();
});

function pular() {
  if (!jogando || pulando) return;
  pulando = true;
  elJogador.classList.add('pulando');
  if (timerPulo) clearTimeout(timerPulo);
  timerPulo = setTimeout(function () {
    pulando = false;
    elJogador.classList.remove('pulando');
    timerPulo = null;
  }, 500);
}

function loop() {
  if (!jogando) return;

  posArvore -= velArvore;
  elArvore.style.left = posArvore + '%';

  posMonstro += velMonstro;
  elMonstro.style.left = posMonstro + '%';

  if (posArvore <= 45 && posArvore >= 35 && !arvoreJaBateu) {
    if (!pulando) {
      arvoreJaBateu = true;
      jogando = false;

      elJogador.classList.add('atingido');
      elTexto.textContent = '💥 Você bateu na árvore! O monstro está te alcançando...';

      const corridaFinal = setInterval(function () {
        posMonstro += 3;
        elMonstro.style.left = posMonstro + '%';
        if (posMonstro >= 40) {
          clearInterval(corridaFinal);
          terminarJogo();
        }
      }, 25);

      return;
    }
  }

  if (posArvore < -10) {
    posArvore = 100;
    arvoreJaBateu = false;
    pontos++;
    elPontos.textContent = pontos;
    if (velArvore < 1.6) {
      velArvore += 0.03;
    }
  }

  if (posMonstro >= 40) {
    terminarJogo();
    return;
  }

  requestAnimationFrame(loop);
}

function terminarJogo() {
  jogando = false;
  elMsgGameOver.textContent = `O monstro te pegou! Pontos: ${pontos}`;
  elGameOver.style.display = 'flex';
  salvarPartida(pontos);
}

function salvarPartida(pontosFinais) {
  if (monstroAtualId === null) return;

  const partidas = JSON.parse(localStorage.getItem('partidas')) || [];

  partidas.push({
    id: Date.now(),
    monstro_id: monstroAtualId,
    pontos: pontosFinais,
    data: new Date().toISOString().split('T')[0]
  });

  localStorage.setItem('partidas', JSON.stringify(partidas));
}

function reiniciar() {
  jogando = true;
  pulando = false;
  posMonstro = 5;
  posArvore = 100;
  velArvore = 0.8;
  velMonstro = 0.02;
  pontos = 0;
  arvoreJaBateu = false;

  if (timerPulo) {
    clearTimeout(timerPulo);
    timerPulo = null;
  }

  elPontos.textContent = 0;
  elMonstro.style.left = '5%';
  elArvore.style.left = '100%';
  elGameOver.style.display = 'none';
  elJogador.classList.remove('atingido', 'pulando');

  carregarMonstro();
  loop();
}

btnPular.addEventListener('click', pular);

btnVoltar.addEventListener('click', function () {
  window.location.href = 'criador.html';
});

document.addEventListener('keydown', function (e) {
  if (e.code === 'Space') {
    e.preventDefault();
    pular();
  }
});
