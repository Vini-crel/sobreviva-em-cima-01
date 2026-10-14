const emojis = {
  'Zumbi': '🧟', 'Vampiro': '🧛', 'Lobisomem': '🐺',
  'Fantasma': '👻', 'Bruxa': '🧙', 'Demônio': '😈',
  'Múmia': '🧟‍♂️', 'Esqueleto': '💀', 'Palhaço': '🤡', 'Alienígena': '👽'
};

const elMonstro = document.getElementById('monstro');
const elJogador = document.getElementById('jogador');
const elTronco = document.getElementById('tronco');
const elEmojiMonstro = document.getElementById('emojiMonstro');
const elTexto = document.getElementById('texto');
const elPontos = document.getElementById('pontos');
const elGameOver = document.getElementById('gameOver');
const elMsgGameOver = document.getElementById('msgGameOver');
const btnPular = document.getElementById('btnPular');
const btnVoltar = document.getElementById('btnVoltar');

let jogando = true;
let pulando = false;
let posMonstro = 5;
let posTronco = 100;
let velTronco = 0.9;
let velMonstro = 0.05;
let pontos = 0;
let troncoJaBateu = false;

carregarMonstro();
loop();

function carregarMonstro() {
  const dados = localStorage.getItem('monstros');
  if (dados) {
    const personagens = JSON.parse(dados);
    if (personagens.length > 0) {
      const p = personagens[personagens.length - 1];
      elEmojiMonstro.textContent = emojis[p.tipo] || '👻';
      elTexto.textContent = `${p.nome} (${p.tipo}) está te perseguindo! Pule os troncos!`;
      return;
    }
  }
  elTexto.textContent = 'Pule os troncos para sobreviver!';
}

function pular() {
  if (!jogando || pulando) return;
  pulando = true;
  elJogador.classList.add('pulando');
  setTimeout(function () {
    pulando = false;
    elJogador.classList.remove('pulando');
  }, 500);
}

function loop() {
  if (!jogando) return;

  posTronco -= velTronco;
  elTronco.style.left = posTronco + '%';

  posMonstro += velMonstro;
  elMonstro.style.left = posMonstro + '%';

  if (posTronco <= 45 && posTronco >= 35 && !troncoJaBateu) {
    if (!pulando) {
      troncoJaBateu = true;
      jogando = false;

      elJogador.classList.add('atingido');
      elTexto.textContent = '💥 Você bateu no tronco! O monstro está te alcançando...';

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

  if (posTronco < -10) {
    posTronco = 100;
    troncoJaBateu = false;
    pontos++;
    elPontos.textContent = pontos;
    velTronco += 0.08;
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
}

function reiniciar() {
  jogando = true;
  pulando = false;
  posMonstro = 5;
  posTronco = 100;
  velTronco = 0.9;
  velMonstro = 0.05;
  pontos = 0;
  troncoJaBateu = false;

  elPontos.textContent = 0;
  elMonstro.style.left = '5%';
  elTronco.style.left = '100%';
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
