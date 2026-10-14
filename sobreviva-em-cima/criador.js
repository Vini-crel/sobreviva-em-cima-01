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

carregar();
renderizar();

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

  if (editandoId !== null) {
    const p = personagens.find(p => p.id === editandoId);
    p.nome = nome;
    p.tipo = campoTipo.value;
    p.perigo = perigo;
    cancelarEdicao();
  } else {
    personagens.push({
      id: Date.now(),
      nome: nome,
      tipo: campoTipo.value,
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

function salvar() {
  localStorage.setItem('monstros', JSON.stringify(personagens));
}

function carregar() {
  const dados = localStorage.getItem('monstros');
  if (dados) personagens = JSON.parse(dados);
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
  campoTipo.value = p.tipo;
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
  personagens.forEach(p => {
    const div = document.createElement('div');
    div.className = 'card';

    const info = document.createElement('span');
    info.className = 'info';
    info.innerHTML = `<strong>${p.nome}</strong> (${p.tipo}) — Perigo: ${p.perigo}/5`;

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
}
