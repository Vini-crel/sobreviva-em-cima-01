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

let personagens = [];
let editandoId = null;

const form = document.getElementById('formPersonagem');
const campoNome = document.getElementById('nome');
const campoTipo = document.getElementById('tipo');
const campoPerigo = document.getElementById('perigo');
const lista = document.getElementById('listaPersonagens');
const contador = document.getElementById('contador');
const aviso = document.getElementById('aviso');
const btnSalvar = document.getElementById('btnSalvar');
const btnCancelar = document.getElementById('btnCancelar');
const btnVoltar = document.getElementById('btnVoltar');
const btnJogar = document.getElementById('btnJogar');
const ranking = document.getElementById('ranking');

preencherTipos();
carregar();
renderizar();

function preencherTipos() {
  tipos.forEach(function (t) {
    const opt = document.createElement('option');
    opt.value = t.id;
    opt.textContent = t.nome;
    campoTipo.appendChild(opt);
  });
  localStorage.setItem('tipos', JSON.stringify(tipos));
}

btnVoltar.addEventListener('click', function () {
  window.location.href = 'index.html';
});

btnJogar.addEventListener('click', function () {
  window.location.href = 'jogo.html';
});

form.addEventListener('submit', function (e) {
  e.preventDefault();

  const nome = campoNome.value.trim();
  const erro = validarNome(nome);
  if (erro) { aviso.textContent = erro; return; }
  aviso.textContent = '';

  const perigo = parseInt(campoPerigo.value);
  if (isNaN(perigo) || perigo < 1 || perigo > 5) {
    aviso.textContent = 'O perigo deve ser entre 1 e 5.';
    return;
  }

  const tipoId = parseInt(campoTipo.value);

  if (editandoId !== null) {
    const p = personagens.find(p => p.id === editandoId);
    p.nome = nome;
    p.tipo_id = tipoId;
    p.perigo = perigo;
    cancelarEdicao();
  } else {
    personagens.push({
      id: Date.now(),
      nome: nome,
      tipo_id: tipoId,
      perigo: perigo
    });
    form.reset();
  }

  salvar();
  renderizar();
});

btnCancelar.addEventListener('click', cancelarEdicao);

function validarNome(nome) {
  if (nome.length < 3) return 'O nome precisa ter pelo menos 3 caracteres.';
  if (/^[0-9]+$/.test(nome)) return 'O nome não pode ser só números!';
  if (!/^[A-Za-zÀ-ÿ0-9 ]+$/.test(nome)) return 'Use apenas letras, números e espaços.';
  if (personagens.some(p => p.nome.toLowerCase() === nome.toLowerCase() && p.id !== editandoId)) {
    return 'Já existe um monstro com esse nome.';
  }
  return '';
}

function nomeDoTipo(tipoId) {
  const t = tipos.find(t => t.id === tipoId);
  return t ? t.nome : 'Desconhecido';
}

function salvar() {
  localStorage.setItem('monstros', JSON.stringify(personagens));
}

function carregar() {
  const dados = localStorage.getItem('monstros');
  if (dados) {
    personagens = JSON.parse(dados);
    personagens.forEach(function (p) {
      if (p.tipo && !p.tipo_id) {
        const t = tipos.find(t => t.nome === p.tipo);
        p.tipo_id = t ? t.id : 1;
        delete p.tipo;
      }
    });
  }
}

function excluir(id) {
  personagens = personagens.filter(p => p.id !== id);
  salvar();
  renderizar();
}

function editar(id) {
  const p = personagens.find(p => p.id === id);
  if (!p) return;
  editandoId = id;
  campoNome.value = p.nome;
  campoTipo.value = p.tipo_id;
  campoPerigo.value = p.perigo;
  aviso.textContent = '';
  btnSalvar.textContent = '💾 Salvar edição';
  btnCancelar.style.display = 'block';
  window.scrollTo(0, 0);
}

function cancelarEdicao() {
  editandoId = null;
  form.reset();
  aviso.textContent = '';
  btnSalvar.textContent = 'Adicionar';
  btnCancelar.style.display = 'none';
}

function limparTudo() {
  if (personagens.length === 0) return;
  if (confirm('Tem certeza que deseja apagar TODOS os monstros?')) {
    personagens = [];
    salvar();
    renderizar();
  }
}

function renderizar() {
  lista.innerHTML = '';
  personagens.forEach(function (p) {
    const div = document.createElement('div');
    div.className = 'card';

    const info = document.createElement('span');
    info.className = 'info';
    info.innerHTML = `<strong>${p.nome}</strong> (${nomeDoTipo(p.tipo_id)}) — Perigo: ${p.perigo}/5`;

    const botoes = document.createElement('div');
    botoes.className = 'botoes';

    const btnEditar = document.createElement('button');
    btnEditar.textContent = '✏️ Editar';
    btnEditar.className = 'btn-editar';
    btnEditar.onclick = () => editar(p.id);

    const btnExcluir = document.createElement('button');
    btnExcluir.textContent = '🗑️ Excluir';
    btnExcluir.onclick = () => excluir(p.id);

    botoes.appendChild(btnEditar);
    botoes.appendChild(btnExcluir);
    div.appendChild(info);
    div.appendChild(botoes);
    lista.appendChild(div);
  });

  contador.textContent = personagens.length;
  btnJogar.style.display = personagens.length > 0 ? 'block' : 'none';

  renderizarRanking();
}

function renderizarRanking() {
  const partidas = JSON.parse(localStorage.getItem('partidas')) || [];
  ranking.innerHTML = '';

  if (partidas.length === 0) {
    ranking.innerHTML = '<p class="sem-ranking">Nenhuma partida jogada ainda.</p>';
    return;
  }

  const top5 = partidas.slice().sort((a, b) => b.pontos - a.pontos).slice(0, 5);

  top5.forEach(function (partida, i) {
    const m = personagens.find(m => m.id === partida.monstro_id);
    if (!m) return;

    const linha = document.createElement('div');
    linha.className = 'linha-ranking';
    linha.innerHTML = `
      <span><span class="pos">${i + 1}º</span> <strong>${m.nome}</strong> (${nomeDoTipo(m.tipo_id)})</span>
      <span>${partida.pontos} pts</span>
    `;
    ranking.appendChild(linha);
  });
}
