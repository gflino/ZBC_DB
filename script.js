// ==========================================
// 1. BANCOS DE DADOS E ESTADO GERAL
// ==========================================
let habilidadesBase = [];
let tagsBase = {};
let sobreviventesBase = [];
let idiomaAtual = 'pt'; // 'pt' ou 'en'

// Carregamento Simultâneo dos 3 Arquivos
Promise.all([
    fetch('skills.json').then(res => res.json()),
    fetch('tags.json').then(res => res.json()),
    fetch('survivors.json').then(res => res.json())
]).then(([skillsData, tagsData, survivorsData]) => {
    habilidadesBase = skillsData;
    tagsBase = tagsData;
    sobreviventesBase = survivorsData;
    console.log("Banco de dados 100% carregado!");
    
    // Inicia ouvintes de evento de busca
    configurarBuscas();
    
    // Inicia na Home
    mudarTela('home-view');
}).catch(error => {
    console.error("Erro ao carregar os bancos de dados:", error);
});

// ==========================================
// 2. SISTEMA DE NAVEGAÇÃO E IDIOMA
// ==========================================
function mudarTela(telaId) {
    document.querySelectorAll('.view-section').forEach(secao => {
        secao.classList.add('hidden');
    });
    document.getElementById(telaId).classList.remove('hidden');

    const btnHome = document.getElementById('btn-home');
    if (telaId === 'home-view') {
        btnHome.classList.add('hidden');
    } else {
        btnHome.classList.remove('hidden');
    }
}

function toggleIdioma() {
    idiomaAtual = idiomaAtual === 'pt' ? 'en' : 'pt';
    document.getElementById('btn-language').textContent = idiomaAtual.toUpperCase();
    
    // Se a tela de habilidades estiver aberta e com texto, refaz a busca no novo idioma
    const inputSkills = document.getElementById('search-skills');
    if (inputSkills.value.trim() !== '') {
        buscarHabilidades(inputSkills.value);
    }
}

// ==========================================
// 3. TRADUTOR INTELIGENTE DE TAGS E COLCHETES
// ==========================================
// Agora recebe o idioma como parâmetro para montar o subtítulo em inglês corretamente
function traduzirTag(valorTag, idiomaRef = idiomaAtual) {
    if (!valorTag) return "";
    const chave = valorTag.trim().toLowerCase();

    if (tagsBase[chave]) {
        return tagsBase[chave][idiomaRef] || chave;
    }

    const habRef = habilidadesBase.find(s => s.id === chave);
    if (habRef) {
        return idiomaRef === 'pt' ? habRef.name_pt : habRef.name_en;
    }

    return chave.replace(/_/g, ' ');
}

function obterHabilidadeFormatada(skillId, tagValor) {
    const skill = habilidadesBase.find(s => s.id === skillId);
    if (!skill) return null;

    let nome = idiomaAtual === 'pt' ? skill.name_pt : skill.name_en;
    let nomeEn = skill.name_en; // Guardamos o inglês fixo para o subtítulo
    let desc = idiomaAtual === 'pt' ? skill.desc_pt : skill.desc_en;

    if (tagValor) {
        const tagLocal = traduzirTag(tagValor, idiomaAtual);
        const tagIngles = traduzirTag(tagValor, 'en');
        
        nome = nome.replace(/\[.*?\]/g, tagLocal);
        nomeEn = nomeEn.replace(/\[.*?\]/g, tagIngles);
        desc = desc.replace(/\[.*?\]/g, tagLocal);
    }

    return { nome, nomeEn, desc };
}

// ==========================================
// 4. BUSCA DE HABILIDADES (AUTOCOMPLETE / FOCO)
// ==========================================
function configurarBuscas() {
    // Busca de Habilidades ao digitar (auto-sugestão)
    document.getElementById('search-skills').addEventListener('input', (e) => {
        buscarHabilidades(e.target.value);
    });

    // Busca de Personagens ao digitar (auto-sugestão)
    document.getElementById('search-characters').addEventListener('input', (e) => {
        sugerirPersonagens(e.target.value);
    });
}

function listarTodasHabilidades() {
    const divResultados = document.getElementById('skills-results');
    divResultados.innerHTML = '';
    
    // Limpa o input
    document.getElementById('search-skills').value = '';

    habilidadesBase.forEach(skill => {
        divResultados.appendChild(criarCardHabilidadeCompleto(skill));
    });
}

function buscarHabilidades(termo) {
    const divResultados = document.getElementById('skills-results');
    divResultados.innerHTML = '';

    if (!termo.trim()) return;

    const termoMin = termo.toLowerCase();
    const filtradas = habilidadesBase.filter(skill => {
        const nomePt = (skill.name_pt || "").toLowerCase();
        const nomeEn = (skill.name_en || "").toLowerCase();
        return nomePt.includes(termoMin) || nomeEn.includes(termoMin);
    });

    // Desenha apenas os nomes clicáveis como sugestão (sem o texto longo)
    filtradas.forEach(skill => {
        const nomeExibicao = idiomaAtual === 'pt' ? skill.name_pt : skill.name_en;
        const subEn = idiomaAtual === 'pt' ? ` (${skill.name_en})` : '';

        const itemSugestao = document.createElement('div');
        itemSugestao.className = 'item-sugestao-lista';
        itemSugestao.innerHTML = `<strong>${nomeExibicao}</strong><span class="sub-sugestao">${subEn}</span>`;
        
        // Ao clicar no nome, abre a ficha exclusiva daquela habilidade
        itemSugestao.onclick = () => {
            renderizarFichaHabilidade(skill);
        };

        divResultados.appendChild(itemSugestao);
    });
}

// "Outra página" -> Mostra o foco em uma única habilidade quando clicada
function renderizarFichaHabilidade(skill) {
    const divResultados = document.getElementById('skills-results');
    divResultados.innerHTML = '';
    
    // Opcional: Limpa o campo de texto após selecionar
    document.getElementById('search-skills').value = '';

    divResultados.appendChild(criarCardHabilidadeCompleto(skill));
}

// Helper para criar o card visual limpo da habilidade selecionada
function criarCardHabilidadeCompleto(skill) {
    const nomeExibicao = idiomaAtual === 'pt' ? skill.name_pt : skill.name_en;
    const descExibicao = idiomaAtual === 'pt' ? skill.desc_pt : skill.desc_en;
    const subtitulo = idiomaAtual === 'pt' ? `<div class="subtitulo-en">${skill.name_en}</div>` : '';

    const card = document.createElement('div');
    card.className = 'card-foco-habilidade';
    card.innerHTML = `
        <h3>${nomeExibicao}</h3>
        ${subtitulo}
        <div class="desc-foco">${descExibicao}</div>
    `;
    return card;
}

// ==========================================
// 5. SOBREVIVENTES: SORTEIO E LISTAGEM
// ==========================================
function sortearPersonagem() {
    if (sobreviventesBase.length === 0) return;
    const aleatorio = Math.floor(Math.random() * sobreviventesBase.length);
    renderizarFichaPersonagem(sobreviventesBase[aleatorio]);
}

function sugerirPersonagens(termo) {
    const divResultados = document.getElementById('characters-results');
    divResultados.innerHTML = '';

    if (!termo.trim()) return;

    const filtrados = sobreviventesBase.filter(s => 
        s.name.toLowerCase().includes(termo.toLowerCase())
    );

    filtrados.forEach(s => {
        const item = document.createElement('div');
        item.className = 'sugestao-personagem';
        item.textContent = `${s.name} (${s.box})`;
        item.onclick = () => renderizarFichaPersonagem(s);
        divResultados.appendChild(item);
    });
}

function listarPorCaixas() {
    const divResultados = document.getElementById('characters-results');
    divResultados.innerHTML = '';

    // Agrupa os sobreviventes em um objeto: { "Black Plague": [...], "Wulfsburg": [...] }
    const porCaixa = {};
    sobreviventesBase.forEach(s => {
        if (!porCaixa[s.box]) porCaixa[s.box] = [];
        porCaixa[s.box].push(s);
    });

    for (const [caixa, lista] of Object.entries(porCaixa)) {
        const boxDiv = document.createElement('div');
        boxDiv.className = 'bloco-caixa';
        boxDiv.innerHTML = `<h3>📦 ${caixa}</h3>`;
        
        const ul = document.createElement('ul');
        lista.forEach(s => {
            const li = document.createElement('li');
            li.textContent = s.name;
            li.onclick = () => renderizarFichaPersonagem(s);
            ul.appendChild(li);
        });
        boxDiv.appendChild(ul);
        divResultados.appendChild(boxDiv);
    }
}

// ==========================================
// 6. A FICHA COLORIDA DO SOBREVIVENTE
// ==========================================
function renderizarFichaPersonagem(sobrevivente) {
    const divResultados = document.getElementById('characters-results');
    
    // Cabeçalho no formato: Nome | Caixa
    divResultados.innerHTML = `
        <div class="ficha-sobrevivente">
            <div class="ficha-cabecalho">
                <h2>${sobrevivente.name} <span class="divisor-caixa">|</span> <span class="texto-caixa">${sobrevivente.box}</span></h2>
            </div>
            <div id="ficha-niveis" class="niveis-container"></div>
        </div>
    `;

    const containerNiveis = document.getElementById('ficha-niveis');

    // Níveis limpos, sem os pontos de experiência (PA)
    const estruturaNiveis = [
        { cor: 'Azul',     classe: 'azul',     slots: [{ id: sobrevivente.blue1, tag: sobrevivente.tag_blue1 }, { id: sobrevivente.blue2, tag: sobrevivente.tag_blue2 }] },
        { cor: 'Amarelo',  classe: 'amarelo',  slots: [{ id: sobrevivente.yellow }] },
        { cor: 'Laranja',  classe: 'laranja',  slots: [{ id: sobrevivente.oranged1, tag: sobrevivente.tag_oranged1 }, { id: sobrevivente.oranged2, tag: sobrevivente.tag_oranged2 }] },
        { cor: 'Vermelho', classe: 'vermelho', slots: [{ id: sobrevivente.red1, tag: sobrevivente.tag_red1 }, { id: sobrevivente.red2, tag: sobrevivente.tag_red2 }, { id: sobrevivente.red3, tag: sobrevivente.tag_red3 }] }
    ];

    estruturaNiveis.forEach(bloco => {
        const slotsValidos = bloco.slots.filter(slot => slot && slot.id && slot.id.trim() !== '');
        if (slotsValidos.length === 0) return;

        slotsValidos.forEach(slot => {
            const hab = obterHabilidadeFormatada(slot.id, slot.tag);
            if (hab) {
                const linha = document.createElement('div');
                linha.className = 'linha-habilidade';
                
                // Adiciona o nome em inglês embaixo se estiver em português
                const subtitulo = idiomaAtual === 'pt' ? `<div class="subtitulo-en">${hab.nomeEn}</div>` : '';

                // Formato Flexbox: Cor | Nome + Inglês + Descrição
                linha.innerHTML = `
                    <div class="coluna-cor cor-${bloco.classe}">${bloco.cor}</div>
                    <div class="coluna-divisor">|</div>
                    <div class="coluna-texto">
                        <strong>${hab.nome}</strong>
                        ${subtitulo}
                        <p class="desc-habilidade">${hab.desc}</p>
                    </div>
                `;
                containerNiveis.appendChild(linha);
            }
        });
    });
}