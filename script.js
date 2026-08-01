// ==========================================
// 1. BANCOS DE DADOS E ESTADO GERAL
// ==========================================
let habilidadesBase = [];
let tagsBase = {};
let sobreviventesBase = [];
let idiomaAtual = 'pt';

// Dicionário Global da Interface do Usuário (i18n)
const i18nUI = {
    title: { pt: "Zombicide Compêndio", en: "Zombicide Compendium" },
    menuHome: { pt: "🏠 Início", en: "🏠 Home" },
    menuSkills: { pt: "📖 Habilidades", en: "📖 Skills" },
    menuSurvivors: { pt: "🧟‍♂️ Sobreviventes", en: "🧟‍♂️ Survivors" },
    homeQuestion: { pt: "O que você deseja buscar?", en: "What do you want to search for?" },
    btnSearchSkills: { pt: "📖 Buscar Habilidades", en: "📖 Search Skills" },
    btnSearchSurvivors: { pt: "🧟‍♂️ Buscar Sobreviventes", en: "🧟‍♂️ Search Survivors" },
    titleSkills: { pt: "Busca de Habilidades", en: "Skill Search" },
    placeholderSkills: { pt: "Digite o nome da habilidade...", en: "Type the skill name..." },
    btnAllSkills: { pt: "📖 Ver Todas as Habilidades", en: "📖 View All Skills" },
    titleSurvivors: { pt: "Busca de Sobreviventes", en: "Survivor Search" },
    placeholderSurvivors: { pt: "Digite o nome do personagem...", en: "Type the character's name..." },
    btnRandom: { pt: "🎲 Sobrevivente Aleatório", en: "🎲 Random Survivor" },
    btnListBoxes: { pt: "📦 Ver Lista Completa", en: "📦 View Complete List" }
};

// Carregamento à prova de falhas: Cada arquivo tem seu próprio "catch"
Promise.all([
    fetch('skills.json')
        .then(res => res.json())
        .catch(err => { console.error("Erro Skills:", err); return []; }),
        
    fetch('tags.json')
        .then(res => res.json())
        .catch(err => { console.error("Erro Tags:", err); return {}; }),
        
    fetch('survivors.json')
        .then(res => res.json())
        .catch(err => { 
            alert("Aviso: O arquivo de Sobreviventes contém um erro de digitação (sintaxe) e não pôde ser carregado. As habilidades continuarão funcionando normalmente.");
            console.error("Erro Survivors:", err); 
            return []; // Retorna vazio para o app não travar
        })
]).then(([skillsData, tagsData, survivorsData]) => {
    habilidadesBase = skillsData;
    tagsBase = tagsData;
    sobreviventesBase = survivorsData;
    
    configurarBuscas();
    atualizarIdiomaInterface();
    mudarTela('home-view');
});


// ==========================================
// 2. SISTEMA DE NAVEGAÇÃO, MENU E IDIOMA
// ==========================================
function toggleMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    
    if (sidebar.classList.contains('aberto')) {
        sidebar.classList.remove('aberto');
        overlay.classList.add('hidden');
    } else {
        sidebar.classList.add('aberto');
        overlay.classList.remove('hidden');
    }
}

function limparTelasEBuscas() {
    document.getElementById('search-skills').value = '';
    document.getElementById('search-characters').value = '';
    
    document.getElementById('skills-dropdown').innerHTML = '';
    document.getElementById('skills-dropdown').classList.add('hidden');
    document.getElementById('characters-dropdown').innerHTML = '';
    document.getElementById('characters-dropdown').classList.add('hidden');
    
    document.getElementById('skills-results-foco').innerHTML = '';
    document.getElementById('characters-results-foco').innerHTML = '';
}

function mudarTela(telaId) {
    limparTelasEBuscas();
    
    // Só tenta fechar o menu lateral se ele estiver aberto (evita bug de tela travada)
    const sidebar = document.getElementById('sidebar');
    if (sidebar.classList.contains('aberto')) {
        toggleMenu();
    }

    document.querySelectorAll('.view-section').forEach(secao => {
        secao.classList.add('hidden');
    });
    document.getElementById(telaId).classList.remove('hidden');
}

document.getElementById('site-title').onclick = () => {
    limparTelasEBuscas();
    document.querySelectorAll('.view-section').forEach(s => s.classList.add('hidden'));
    document.getElementById('home-view').classList.remove('hidden');
};

function toggleIdioma() {
    idiomaAtual = idiomaAtual === 'pt' ? 'en' : 'pt';
    atualizarIdiomaInterface();

    if (document.getElementById('skills-results-foco').innerHTML !== '') {
        limparTelasEBuscas();
    }
}

function atualizarIdiomaInterface() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const chave = el.getAttribute('data-i18n');
        if (i18nUI[chave]) {
            if (el.tagName === 'INPUT') {
                el.placeholder = i18nUI[chave][idiomaAtual];
            } else {
                el.textContent = i18nUI[chave][idiomaAtual];
            }
        }
    });
}


// ==========================================
// 3. TRADUTOR INTELIGENTE DE TAGS E COLCHETES
// ==========================================
function traduzirTag(valorTag, idiomaRef = idiomaAtual) {
    if (!valorTag) return "";
    
    // Verificação para tags duplas (ex: brother_in_arms:[skill])
    if (valorTag.includes(':')) {
        const partes = valorTag.split(':');
        const idHabilidadePrincipal = partes[0].trim();
        const idSubTag = partes[1].trim();

        const skillMatriz = habilidadesBase.find(s => s.id === idHabilidadePrincipal);
        if (skillMatriz) {
            let nomeSkillMatriz = idiomaRef === 'pt' ? skillMatriz.name_pt : skillMatriz.name_en;
            const subTagTraduzida = traduzirTag(idSubTag, idiomaRef);
            return nomeSkillMatriz.replace(/\[.*?\]/g, subTagTraduzida);
        }
    }

    const chave = valorTag.trim().toLowerCase();

    // 1º Busca no dicionário auxiliar exportado
    if (Array.isArray(tagsBase)) {
        const tagObj = tagsBase.find(t => t.tags && t.tags.toLowerCase() === chave);
        if (tagObj) {
            return idiomaRef === 'pt' ? tagObj.tags_pt : tagObj.tags_en;
        }
    }

    // 2º Busca no cadastro principal de Habilidades
    const habRef = habilidadesBase.find(s => s.id === chave);
    if (habRef) {
        return idiomaRef === 'pt' ? habRef.name_pt : habRef.name_en;
    }

    // 3º Fallback de limpeza visual
    return chave.replace(/_/g, ' ');
}

function obterHabilidadeFormatada(skillId, tagValor) {
    const skill = habilidadesBase.find(s => s.id === skillId);
    if (!skill) return null;

    let nome = idiomaAtual === 'pt' ? skill.name_pt : skill.name_en;
    let nomeEn = skill.name_en; 
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
// 4. BUSCA DE HABILIDADES
// ==========================================
function configurarBuscas() {
    document.getElementById('search-skills').addEventListener('input', (e) => {
        buscarHabilidades(e.target.value);
    });

    document.getElementById('search-characters').addEventListener('input', (e) => {
        sugerirPersonagens(e.target.value);
    });
}

function buscarHabilidades(termo) {
    const dropdown = document.getElementById('skills-dropdown');
    dropdown.innerHTML = '';
    
    if (!termo.trim()) {
        dropdown.classList.add('hidden');
        return;
    }

    dropdown.classList.remove('hidden');
    const termoMin = termo.toLowerCase();
    
    const filtradas = habilidadesBase.filter(skill => {
        const pt = (skill.name_pt || "").toLowerCase();
        const en = (skill.name_en || "").toLowerCase();
        return pt.includes(termoMin) || en.includes(termoMin);
    });

    filtradas.forEach(skill => {
        const nomeVisivel = idiomaAtual === 'pt' ? skill.name_pt : skill.name_en;
        const sub = idiomaAtual === 'pt' ? skill.name_en : '';

        const item = document.createElement('div');
        item.className = 'item-sugestao-lista';
        item.innerHTML = `<strong>${nomeVisivel}</strong> <span class="sub-sugestao">${sub}</span>`;
        
        item.onclick = () => {
            renderizarFichaHabilidade(skill);
            dropdown.classList.add('hidden');
            document.getElementById('search-skills').value = ''; 
        };
        dropdown.appendChild(item);
    });
}

function renderizarFichaHabilidade(skill) {
    const divResultados = document.getElementById('skills-results-foco');
    divResultados.innerHTML = '';
    divResultados.appendChild(criarCardHabilidadeCompleto(skill));
}

function listarTodasHabilidades() {
    document.getElementById('search-skills').value = '';
    document.getElementById('skills-dropdown').classList.add('hidden');
    
    const divResultados = document.getElementById('skills-results-foco');
    divResultados.innerHTML = '';

    habilidadesBase.forEach(skill => {
        divResultados.appendChild(criarCardHabilidadeCompleto(skill));
    });
}

function criarCardHabilidadeCompleto(skill) {
    const nome = idiomaAtual === 'pt' ? skill.name_pt : skill.name_en;
    const desc = idiomaAtual === 'pt' ? skill.desc_pt : skill.desc_en;
    const sub = idiomaAtual === 'pt' ? `<div class="subtitulo-en">${skill.name_en}</div>` : '';

    const card = document.createElement('div');
    card.className = 'card-foco-habilidade';
    card.innerHTML = `<h3>${nome}</h3>${sub}<div class="desc-foco">${desc}</div>`;
    return card;
}


// ==========================================
// 5. SOBREVIVENTES
// ==========================================
function sugerirPersonagens(termo) {
    const dropdown = document.getElementById('characters-dropdown');
    dropdown.innerHTML = '';

    if (!termo.trim()) {
        dropdown.classList.add('hidden');
        return;
    }

    dropdown.classList.remove('hidden');
    const termoMin = termo.toLowerCase();

    // 1. Busca Caixas que batem com o termo
    const caixasUnicas = [...new Set(sobreviventesBase.map(s => s.box))];
    const caixasFiltradas = caixasUnicas.filter(c => c.toLowerCase().includes(termoMin));

    caixasFiltradas.forEach(caixa => {
        const itemBox = document.createElement('div');
        itemBox.className = 'item-sugestao-lista destaque-caixa';
        itemBox.innerHTML = `<strong>📦 Caixa: ${caixa}</strong>`;
        itemBox.onclick = () => {
            listarPersonagensDaCaixa(caixa);
            dropdown.classList.add('hidden');
            document.getElementById('search-characters').value = '';
        };
        dropdown.appendChild(itemBox);
    });

    // 2. Busca Personagens que batem com o termo
    const filtrados = sobreviventesBase.filter(s => s.name.toLowerCase().includes(termoMin));

    filtrados.forEach(s => {
        const item = document.createElement('div');
        item.className = 'item-sugestao-lista';
        item.innerHTML = `<strong>${s.name}</strong> <span class="sub-sugestao">${s.box}</span>`;
        
        item.onclick = () => {
            renderizarFichaPersonagem(s);
            dropdown.classList.add('hidden');
            document.getElementById('search-characters').value = '';
        };
        dropdown.appendChild(item);
    });
}

// Renderiza todos os personagens de uma caixa específica
function listarPersonagensDaCaixa(caixaNome) {
    const divResultados = document.getElementById('characters-results-foco');
    divResultados.innerHTML = '';

    const boxDiv = document.createElement('div');
    boxDiv.className = 'bloco-caixa';
    boxDiv.innerHTML = `<h3 style="color:#ff4747; border-bottom:1px solid #383840; margin-bottom:10px;">📦 ${caixaNome}</h3>`;
    
    const lista = sobreviventesBase.filter(s => s.box === caixaNome);
    lista.forEach(s => {
        const li = document.createElement('div');
        li.className = 'item-sugestao-lista';
        li.textContent = s.name;
        li.onclick = () => renderizarFichaPersonagem(s);
        boxDiv.appendChild(li);
    });
    
    divResultados.appendChild(boxDiv);
}

function sortearPersonagem() {
    if (sobreviventesBase.length === 0) return;
    document.getElementById('characters-dropdown').classList.add('hidden');
    const aleatorio = Math.floor(Math.random() * sobreviventesBase.length);
    renderizarFichaPersonagem(sobreviventesBase[aleatorio]);
}

function listarPorCaixas() {
    const divResultados = document.getElementById('characters-results-foco');
    document.getElementById('characters-dropdown').classList.add('hidden');
    divResultados.innerHTML = '';

    const porCaixa = {};
    sobreviventesBase.forEach(s => {
        if (!porCaixa[s.box]) porCaixa[s.box] = [];
        porCaixa[s.box].push(s);
    });

    for (const [caixa, lista] of Object.entries(porCaixa)) {
        const boxDiv = document.createElement('div');
        boxDiv.className = 'bloco-caixa';
        boxDiv.innerHTML = `<h3 style="color:#ff4747; border-bottom:1px solid #383840; margin-bottom:10px;">📦 ${caixa}</h3>`;
        
        lista.forEach(s => {
            const li = document.createElement('div');
            li.className = 'item-sugestao-lista';
            li.textContent = s.name;
            li.onclick = () => renderizarFichaPersonagem(s);
            boxDiv.appendChild(li);
        });
        divResultados.appendChild(boxDiv);
    }
}

function renderizarFichaPersonagem(sobrevivente) {
    const divResultados = document.getElementById('characters-results-foco');
    divResultados.innerHTML = `
        <div class="ficha-sobrevivente">
            <div class="ficha-cabecalho">
                <h2>${sobrevivente.name} <span class="divisor-caixa">|</span> <span class="texto-caixa">${sobrevivente.box}</span></h2>
            </div>
            <div id="ficha-niveis" class="niveis-container"></div>
        </div>
    `;

    const containerNiveis = document.getElementById('ficha-niveis');
    const titulosNiveis = {
        pt: { azul: 'Azul', amarelo: 'Amarelo', laranja: 'Laranja', vermelho: 'Vermelho' },
        en: { azul: 'Blue', amarelo: 'Yellow', laranja: 'Orange', vermelho: 'Red' }
    };

    const estrutura = [
        { cor: titulosNiveis[idiomaAtual].azul, classe: 'azul', slots: [{ id: sobrevivente.blue1, tag: sobrevivente.tag_blue1 }, { id: sobrevivente.blue2, tag: sobrevivente.tag_blue2 }] },
        { cor: titulosNiveis[idiomaAtual].amarelo, classe: 'amarelo', slots: [{ id: sobrevivente.yellow }] },
        { cor: titulosNiveis[idiomaAtual].laranja, classe: 'laranja', slots: [{ id: sobrevivente.orange1, tag: sobrevivente.tag_orange1 }, { id: sobrevivente.orange2, tag: sobrevivente.tag_orange2 }] },
        { cor: titulosNiveis[idiomaAtual].vermelho, classe: 'vermelho', slots: [{ id: sobrevivente.red1, tag: sobrevivente.tag_red1 }, { id: sobrevivente.red2, tag: sobrevivente.tag_red2 }, { id: sobrevivente.red3, tag: sobrevivente.tag_red3 }] }
    ];

    estrutura.forEach(bloco => {
        const slotsValidos = bloco.slots.filter(slot => slot && slot.id && slot.id.trim() !== '');
        if (slotsValidos.length === 0) return;

        slotsValidos.forEach(slot => {
            const hab = obterHabilidadeFormatada(slot.id, slot.tag);
            if (hab) {
                const sub = idiomaAtual === 'pt' ? `<div class="subtitulo-en">${hab.nomeEn}</div>` : '';
                const div = document.createElement('div');
                div.className = 'linha-habilidade';
                div.innerHTML = `
                    <div class="coluna-cor cor-${bloco.classe}">${bloco.cor}</div>
                    <div class="coluna-divisor">|</div>
                    <div class="coluna-texto">
                        <strong>${hab.nome}</strong>${sub}
                        <p class="desc-habilidade">${hab.desc}</p>
                    </div>
                `;
                containerNiveis.appendChild(div);
            }
        });
    });
        }
            
