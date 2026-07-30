let habilidades = [];
let idiomaAtual = 'pt';

// Elementos da Interface
const inputBusca = document.getElementById('search-input');
const dropdownSugestoes = document.getElementById('suggestions-dropdown');
const areaResultados = document.getElementById('results');
const btnMostrarTodas = document.getElementById('btn-show-all');
const btnIdioma = document.getElementById('btn-lang');

// 1. Carregar os dados
async function carregarHabilidades() {
  try {
    const resposta = await fetch('habilidades.json');
    habilidades = await resposta.json();
    
    // Inicia com a tela limpa (sem cards renderizados)
    areaResultados.innerHTML = '';
  } catch (erro) {
    console.error('Erro ao carregar o JSON:', erro);
  }
}

// 2. Filtrar e exibir sugestões na lista suspensa (Dropdown)
function atualizarSugestoes(termo) {
  const termoBuscado = termo.trim().toLowerCase();

  // Se a caixa estiver vazia, esconde o dropdown
  if (!termoBuscado) {
    fecharDropdown();
    return;
  }

  const resultados = habilidades.filter(skill => {
    const nomePt = (skill.name_pt || '').toLowerCase();
    const nomeEn = (skill.name_en || '').toLowerCase();
    const tagsPt = (skill.tags_pt || '').toLowerCase();
    const tagsEn = (skill.tags_en || '').toLowerCase();

    return nomePt.includes(termoBuscado) || 
           nomeEn.includes(termoBuscado) || 
           tagsPt.includes(termoBuscado) || 
           tagsEn.includes(termoBuscado);
  });

  // Se não encontrou nada, esconde o dropdown com mensagem amigável
  if (resultados.length === 0) {
    dropdownSugestoes.innerHTML = `<div class="suggestion-item" style="color: var(--text-muted); cursor: default;">Nenhuma habilidade encontrada</div>`;
    dropdownSugestoes.style.display = 'block';
    return;
  }

  // Preenche a lista suspensa com inteligência de idioma cruzado
  dropdownSugestoes.innerHTML = '';
  resultados.forEach(skill => {
    // Define o nome principal com base no idioma ativo na interface
    const nomePrincipal = idiomaAtual === 'pt' 
      ? (skill.name_pt || skill.name_en) 
      : (skill.name_en || skill.name_pt);
    
    // Define o nome do "outro" idioma para comparar
    const nomeAlternativo = idiomaAtual === 'pt' ? skill.name_en : skill.name_pt;
    const prefixoAlt = idiomaAtual === 'pt' ? 'en' : 'pt';

    const item = document.createElement('div');
    item.className = 'suggestion-item';

    // Verifica se a correspondência veio do outro idioma
    const matchNoOutroIdioma = nomeAlternativo && nomeAlternativo.toLowerCase().includes(termoBuscado);
    const matchNoIdiomaAtual = nomePrincipal.toLowerCase().includes(termoBuscado);

    // Se o usuário digitou algo que bate no outro idioma (mas não no atual), mostra a referência
    if (matchNoOutroIdioma && !matchNoIdiomaAtual) {
      item.innerHTML = `
        <div>${nomePrincipal}</div>
        <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">
          ${prefixoAlt.toUpperCase()}: <i>${nomeAlternativo}</i>
        </div>
      `;
    } else {
      // Exibe normalmente apenas o nome principal
      item.textContent = nomePrincipal;
    }
    
    // Ao clicar, chama a função que renderiza o texto e título no idioma ativo da tela
    item.addEventListener('click', () => {
      selecionarHabilidade(skill);
    });

    dropdownSugestoes.appendChild(item);
  });

  dropdownSugestoes.style.display = 'block';
}

// 3. Renderizar apenas a habilidade selecionada
function selecionarHabilidade(skill) {
  // Pega o nome no idioma correto para manter a caixa de texto coerente
  const nome = idiomaAtual === 'pt' ? (skill.name_pt || skill.name_en) : (skill.name_en || skill.name_pt);
  
  // Exibe o nome da habilidade escolhida no input
  inputBusca.value = nome;
  
  // Esconde o menu suspenso
  fecharDropdown();
  
  // Exibe o card detalhado
  renderizarCards([skill]);
}

// 4. Desenhar os Cards de Regras na Tela
function renderizarCards(lista) {
  areaResultados.innerHTML = '';

  lista.forEach(skill => {
    const nome = idiomaAtual === 'pt' ? (skill.name_pt || skill.name_en) : (skill.name_en || skill.name_pt);
    const descricao = idiomaAtual === 'pt' ? (skill.desc_pt || skill.desc_en) : (skill.desc_en || skill.desc_pt);

    const card = document.createElement('div');
    card.className = 'skill-card';
    card.innerHTML = `
      <h3 class="skill-title">${nome}</h3>
      <p class="skill-desc">${descricao}</p>
    `;

    areaResultados.appendChild(card);
  });
}

function fecharDropdown() {
  dropdownSugestoes.style.display = 'none';
}

// --- EVENTOS DA INTERFACE ---

// Digitar na barra de pesquisa
inputBusca.addEventListener('input', (evento) => {
  atualizarSugestoes(evento.target.value);
});

// Botão "Ver Todas" no topo direito
btnMostrarTodas.addEventListener('click', () => {
  fecharDropdown();
  inputBusca.value = '';
  renderizarCards(habilidades);
});

// Botão para alternar Idioma no topo direito
btnIdioma.addEventListener('click', () => {
  if (idiomaAtual === 'pt') {
    idiomaAtual = 'en';
    btnIdioma.textContent = 'EN';
    btnIdioma.classList.add('active');
    btnMostrarTodas.textContent = 'View All';
    inputBusca.placeholder = 'Type to search for a skill...';
  } else {
    idiomaAtual = 'pt';
    btnIdioma.textContent = 'PT';
    btnIdioma.classList.remove('active');
    btnMostrarTodas.textContent = 'Ver Todas';
    inputBusca.placeholder = 'Digite para buscar uma habilidade...';
  }

  // Se houver algum card aberto na tela, atualiza ele para o novo idioma na hora
  if (areaResultados.children.length > 0) {
    // Se a busca estiver preenchida com um nome exato, atualiza pela busca, senão redesenha a lista
    const termo = inputBusca.value.trim();
    if (termo) {
      atualizarSugestoes(termo);
    } else {
      renderizarCards(habilidades);
    }
  }
});

// Fecha o menu suspenso se o usuário clicar em qualquer outro lugar da página
document.addEventListener('click', (evento) => {
  if (!evento.target.closest('.search-input-wrapper')) {
    fecharDropdown();
  }
});

// Inicialização
carregarHabilidades();