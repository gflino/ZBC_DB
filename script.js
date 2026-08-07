// ==========================================
// 1. BANCOS DE DADOS E ESTADO GERAL
// ==========================================
let habilidadesBase = [];
let sobreviventesBase = [];
let inimigosBase = [];
let equipamentosBase = [];
let auxBase = []; 
let priorityBpGhBase = [];
let priorityWdBase = [];
let idiomaAtual = 'pt';
// Variáveis Globais de Filtros
let roleFiltroAtivo = '';
let classFiltroInimigo = '';
let deckFiltroEquip = '';
let classFiltroEquip = '';
let typeFiltroEquip = '';

// Dicionário Global da Interface do Usuário (i18n)
const i18nUI = {
    title: { pt: "Zombicide DB", en: "Zombicide DB" },
    menuHome: { pt: "Início", en: "Home" },
    menuSkills: { pt: "Habilidades", en: "Skills" },
    menuSurvivors: { pt: "Sobreviventes", en: "Survivors" },
    menuEnemies: { pt: "Inimigos", en: "Enemies" },
    menuEquipment: { pt: "Equipamentos", en: "Equipment" },
    menuPriority: { pt: "Ordem de Prioridade", en: "Priority Order" },
    menuDraw: { pt: "Gerenciamento de Entradas de Zumbi", en: "Zombie Spawn Manager" },
    btnSearchSkills: { pt: "Habilidades", en: "Skills" },
    btnSearchSurvivors: { pt: "Sobreviventes", en: "Survivors" },
    btnSearchEnemies: { pt: "Inimigos", en: "Enemies" },
    btnSearchEquipment: { pt: "Equipamentos", en: "Equipment" },
    btnPriority: { pt: "Ordem de Prioridade", en: "Priority Order" },
    btnDraw: { pt: "Gerenciamento de Entradas de Zumbi", en: "Zombie Spawn Manager" },
    titleSkills: { pt: "Habilidades", en: "Skill" },
    titleSurvivors: { pt: "Sobreviventes", en: "Survivors" },
    titleEnemies: { pt: "Inimigos", en: "Enemies" },
    titleEquipment: { pt: "Equipamentos", en: "Equipment" },
    titlePriority: { pt: "Ordem de Prioridade", en: "Priority Order" },
    placeholderSkills: { pt: "Digite o nome da habilidade...", en: "Type the skill name..." },
    placeholderSurvivors: { pt: "Digite o nome do personagem...", en: "Type the character's name..." },
    placeholderEnemies: { pt: "Digite o nome do inimigo...", en: "Type the enemy's name..." },
    placeholderEquipment: { pt: "Digite o nome do equipamento...", en: "Type the equipment's name..." },
    btnAllSkills: { pt: "Ver Tudo", en: "Show All" },
    btnRandom: { pt: "Sobrevivente Aleatório", en: "Random Survivor" },
    btnListBoxes: { pt: "Ver Tudo", en: "Show All" }
};
const ordemCaixasPreferida = [
        // === ERA BLACK PLAGUE (2015) ===
        "Black Plague",
        "Wulfsburg",
        "Hero Box-1",
        "NPC-1",
        "NPC-2",
        "Zombie Bosses Abomination Pack",
        "Deadeye Walkers",
        "Murder of Crowz",
        "Huntsman Pack",
        "Knight Pack",
        "Grom and Thalia Box",
        "Evil Troy Box",
        "Erik the Summoner Box",
        "Benson Box",
        "Homer Box",
        "Willow Box",
        "Special Guest Adrian Smith",
        "Special Guest Edouard Guiton",
        "Special Guest Gipi",
        "Special Guest John Howe",
        "Special Guest Jovem Nerd",
        "Special Guest Karl Kopinski",
        "Special Guest Marc Simonetti",
        "Special Guest Naïade",
        "Special Guest Neal Adams",
        "Special Guest Paolo Parente",
        "Special Guest Paul Bonner",
        "B-Sieged Crossover Pack",
        "Game Night Kit",

        // === ERA GREEN HORDE (2017) ===
        "Green Horde",
        "Friends and Foes",
        "No Rest for the Wicked",
        "Horde Box",
        "Fatty Bursters Box",
        "Rat King & Swamp Troll",
        "Abominarat and Dr Stormcrow Box",
        "Grin and Scowl Box",
        "Liam Box",
        "North the Halfling Box",
        "Special Guest Adrian Smith 2",
        "Special Guest Carl Critchlow",
        "Special Guest Paul Bonner 2",
        "Special Guest Sean A. Murray",
        "Special Guest Stefan Kopinski",
        "Massive Darkness Crossover Pack",
        "Black Plague Ultimate Survivors",
        "Time Machine PNP",

        // === CROSSOVERS E PACOTES ESPECIAIS (2019-2022) ===
        "Massive Darkness 2 Crossover Pack",
        "Comic Book Extras (Road to Hell)",
        "Thundercats Pack 1",
        "Thundercats Pack 2",
        "Thundercats Pack 3",
        "Iron Maiden Pack 1",
        "Iron Maiden Pack 2",
        "Iron Maiden Pack 3",
        "La Compagnia Della Forca",

        // === ERA WHITE DEATH (2023) ===
        "White Death",
        "Eternal Empire",
        "Frozen Fortress",
        "TMNT Timecrash",
        "Crossfire Pack",
        "Divine Beasts",
        "Berserker Walkers",
        "Climbers & Terrorcotta Walkers",
        "Celestial Knights",
        "Virtues of Bushido",
        "Warlords of the Middle Kingdom",
        "Warlords of the Rising Sun",
        "Chang' E and Hou Yi Box",   
        "Jennika Box",
        "Usagi Yojimbo Box",
        "TMNT Bebop & Rocksteady"
    ];

Promise.all([
    fetch('skills.json').then(res => res.json()).catch(() => []),
    fetch('survivors.json').then(res => res.json()).catch(() => []),
    fetch('enemies.json').then(res => res.json()).catch(() => []),
    fetch('equipment.json').then(res => res.json()).catch(() => []),
    fetch('aux.json').then(res => res.json()).catch(() => []),
    fetch('prioritybpgh.json').then(res => res.json()).catch(() => []),
    fetch('prioritywd.json').then(res => res.json()).catch(() => [])
// NO FINAL DO Promise.all
]).then(results => {
    habilidadesBase = results[0];
    sobreviventesBase = results[1];
    inimigosBase = results[2];
    equipamentosBase = results[3];
    auxBase = results[4];
    priorityBpGhBase = results[5];
    priorityWdBase = results[6];
    
    configurarBuscas();
    renderizarFiltrosRole();        // Sobreviventes
    renderizarFiltrosInimigos();    // Inimigos
    renderizarFiltrosEquipamentos(); // Equipamentos
    
    atualizarIdiomaInterface();
    renderizarTabelasPrioridade(); 
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
    // Limpa Inputs
    document.getElementById('search-skills').value = '';
    document.getElementById('search-characters').value = '';
    document.getElementById('search-enemies').value = '';
    document.getElementById('search-equipment').value = '';
    
    // Esconde Dropdowns
    const dropdowns = ['skills-dropdown', 'characters-dropdown', 'enemies-dropdown', 'equipment-dropdown'];
    dropdowns.forEach(id => {
        const el = document.getElementById(id);
        if(el) {
            el.innerHTML = '';
            el.classList.add('hidden');
        }
    });
    
    // Limpa Resultados
    const focos = ['skills-results-foco', 'characters-results-foco', 'enemies-results-foco', 'equipment-results-foco'];
    focos.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.innerHTML = '';
    });
}

// === NOVA FUNÇÃO ATUALIZADA ===
// Adicionamos o parâmetro 'registrarNoHistorico' (padrão: true)
function mudarTela(telaId, registrarNoHistorico = true) {
    limparTelasEBuscas();
    
    const sidebar = document.getElementById('sidebar');
    if (sidebar.classList.contains('aberto')) {
        toggleMenu();
    }

    document.querySelectorAll('.view-section').forEach(secao => {
        secao.classList.add('hidden');
    });
    
    document.getElementById(telaId).classList.remove('hidden');

    // Mágica para o celular: registra a mudança no histórico do navegador
    if (registrarNoHistorico) {
        history.pushState({ tela: telaId }, '');
    }

    if (telaId === 'priority-view') {
        renderizarTabelasPrioridade();
    }
}

// O "Ouvinte" do botão físico de Voltar do celular (ou seta do navegador do PC)
window.addEventListener('popstate', (event) => {
    // Se o navegador salvou o estado (nome da tela), recarrega aquela tela
    if (event.state && event.state.tela) {
        // Passamos 'false' para não registrar a mesma tela duas vezes no histórico
        mudarTela(event.state.tela, false); 
    } else {
        // Ponto de segurança: se voltar tudo, retorna para a tela inicial
        mudarTela('home-view', false);
    }
});


// ==========================================
// SISTEMA DE IDIOMA E INTERFACE
// ==========================================

// NA FUNÇÃO DE MUDAR IDIOMA (Bloco 2)
function mudarIdiomaSelecionado(novoIdioma) {
    idiomaAtual = novoIdioma;
    
    atualizarIdiomaInterface();
    renderizarTabelasPrioridade();
    
    renderizarFiltrosRole();
    renderizarFiltrosInimigos();
    renderizarFiltrosEquipamentos();
    
    limparTelasEBuscas();
}

function atualizarIdiomaInterface() {
    // Varre TODOS os elementos do HTML que possuem o atributo data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const chave = el.getAttribute('data-i18n');
        
        // Se a chave existir no nosso dicionário (i18nUI)
        if (i18nUI[chave] && i18nUI[chave][idiomaAtual]) {
            // Se o elemento for um campo de digitação, traduz o "placeholder"
            if (el.tagName === 'INPUT') {
                el.setAttribute('placeholder', i18nUI[chave][idiomaAtual]);
            } else {
                // Se for um título, botão ou texto normal, traduz o conteúdo
                el.innerHTML = i18nUI[chave][idiomaAtual];
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

    // 1º Busca no dicionário global (aux.json)
    if (Array.isArray(auxBase)) {
        const tagObj = auxBase.find(t => 
            (t.tags && t.tags.toLowerCase() === chave) || 
            (t.id && t.id.toLowerCase() === chave) ||
            (t.name && t.name.toLowerCase() === chave)
        );
        
        if (tagObj) {
            if (idiomaRef === 'pt') return tagObj.tags_pt || tagObj.pt || tagObj.name_pt;
            return tagObj.tags_en || tagObj.en || tagObj.name_en;
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

    document.getElementById('search-enemies').addEventListener('input', (e) => {
        buscarInimigos(e.target.value);
    });

    document.getElementById('search-equipment').addEventListener('input', (e) => {
        buscarEquipamentos(e.target.value);
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

function renderizarFiltrosRole() {
    const view = document.getElementById('characters-view');
    if (!view) return;
    let section = document.getElementById('role-filter-section');
    
    if (!section) {
        section = document.createElement('div');
        section.id = 'role-filter-section';
        section.className = 'filtro-section';
        const controls = view.querySelector('.character-controls');
        view.insertBefore(section, controls);
    }

    const labelRole = traduzirTag('role') || (idiomaAtual === 'pt' ? 'Função' : 'Role');
    const todosLabel = idiomaAtual === 'pt' ? 'Todos' : 'All';

    const todasRoles = [];
    sobreviventesBase.forEach(s => {
        if (s.role && String(s.role).trim() !== '') {
            todasRoles.push(...String(s.role).split(';').map(r => r.trim()).filter(Boolean));
        }
    });
    const rolesUnicas = [...new Set(todasRoles)].sort();

    let botoesHtml = `
        <div class="filtro-linha">
            <span class="filtro-label">${labelRole}:</span>
            <div class="filtro-container">
                <button class="btn-filtro ${roleFiltroAtivo === '' ? 'ativo' : ''}" onclick="selecionarFiltroRole('')">${todosLabel}</button>
    `;

    rolesUnicas.forEach(roleCrua => {
        botoesHtml += `<button class="btn-filtro ${roleFiltroAtivo === roleCrua ? 'ativo' : ''}" onclick="selecionarFiltroRole('${roleCrua}')">${traduzirTag(roleCrua)}</button>`;
    });

    botoesHtml += `</div></div>`;
    section.innerHTML = botoesHtml;
}

function selecionarFiltroRole(roleCrua) {
    roleFiltroAtivo = roleCrua;
    renderizarFiltrosRole();
    const divResultados = document.getElementById('characters-results-foco');
    if (divResultados && divResultados.innerHTML.trim() !== '') listarPorCaixas();
}

function sugerirPersonagens(termo) {
    const dropdown = document.getElementById('characters-dropdown');
    dropdown.innerHTML = '';
    if (!termo.trim()) { dropdown.classList.add('hidden'); return; }
    dropdown.classList.remove('hidden');
    const termoMin = termo.toLowerCase();

    const caixasUnicas = [...new Set(sobreviventesBase.map(s => s.set))];
    const caixasFiltradas = caixasUnicas.filter(c => c && c.toLowerCase().includes(termoMin));
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

    const filtrados = sobreviventesBase.filter(s => {
        if (roleFiltroAtivo !== '') {
            if (!s.role || !String(s.role).split(';').map(r => r.trim()).includes(roleFiltroAtivo)) return false;
        }
        return s.name.toLowerCase().includes(termoMin);
    });

    filtrados.forEach(s => {
        const item = document.createElement('div');
        item.className = 'item-sugestao-lista';
        item.innerHTML = `<strong>${s.name}</strong> <span class="sub-sugestao">${s.set ? s.set.replace(/;/g, ' / ') : ''}</span>`;
        item.onclick = () => {
            renderizarFichaPersonagem(s);
            dropdown.classList.add('hidden');
            document.getElementById('search-characters').value = '';
        };
        dropdown.appendChild(item);
    });
}

function listarPersonagensDaCaixa(caixaNome) {
    const divResultados = document.getElementById('characters-results-foco');
    divResultados.innerHTML = '';
    const boxDiv = document.createElement('div');
    boxDiv.className = 'bloco-caixa';
    boxDiv.innerHTML = `<h3 style="color:#ff4747; border-bottom:1px solid #383840; margin-bottom:10px;">📦 ${caixaNome}</h3>`;
    
    let lista = sobreviventesBase.filter(s => {
        if (!s.set || !s.set.includes(caixaNome)) return false;
        if (roleFiltroAtivo !== '') {
            if (!s.role || !String(s.role).split(';').map(r => r.trim()).includes(roleFiltroAtivo)) return false;
        }
        return true;
    });

    if(lista.length === 0) {
        boxDiv.innerHTML += `<div class="item-sugestao-lista" style="color:#9e9ea8; text-align:center; font-style:italic;">Nenhum personagem correspondente.</div>`;
    }

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
    const listaFiltrada = sobreviventesBase.filter(s => {
        if (roleFiltroAtivo === '') return true;
        if (!s.role) return false;
        return String(s.role).split(';').map(r => r.trim()).includes(roleFiltroAtivo);
    });
    if (listaFiltrada.length === 0) return;
    document.getElementById('characters-dropdown').classList.add('hidden');
    const aleatorio = Math.floor(Math.random() * listaFiltrada.length);
    renderizarFichaPersonagem(listaFiltrada[aleatorio]);
}

function listarPorCaixas() {
    const divResultados = document.getElementById('characters-results-foco');
    const dropdown = document.getElementById('characters-dropdown');
    if (dropdown) dropdown.classList.add('hidden');
    if (!divResultados) return;
    
    divResultados.innerHTML = '';
    const porCaixa = {};

    const listaFiltrada = sobreviventesBase.filter(s => {
        if (roleFiltroAtivo === '') return true;
        if (!s.role) return false;
        return String(s.role).split(';').map(r => r.trim()).includes(roleFiltroAtivo);
    });

    listaFiltrada.forEach(s => {
        if (!s.set || String(s.set).trim() === '') {
            const caixaPadrao = 'Sem Caixa';
            if (!porCaixa[caixaPadrao]) porCaixa[caixaPadrao] = [];
            porCaixa[caixaPadrao].push(s);
            return;
        }
        const caixasDoItem = String(s.set).split(/[;/]/).map(c => c.trim()).filter(Boolean);
        caixasDoItem.forEach(caixa => {
            if (!porCaixa[caixa]) porCaixa[caixa] = [];
            porCaixa[caixa].push(s);
        });
    });

    const caixasOrdenadas = Object.keys(porCaixa).sort((a, b) => {
        const indexA = ordemCaixasPreferida.findIndex(c => c.toLowerCase() === a.toLowerCase());
        const indexB = ordemCaixasPreferida.findIndex(c => c.toLowerCase() === b.toLowerCase());
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.localeCompare(b);
    });

    caixasOrdenadas.forEach(caixa => {
        if (porCaixa[caixa].length === 0) return;
        const boxDiv = document.createElement('div');
        boxDiv.className = 'bloco-caixa';
        boxDiv.innerHTML = `<h3 style="color:#ff4747; border-bottom:1px solid #383840; margin-bottom:10px;">📦 ${caixa}</h3>`;
        
        const listaPersonagens = porCaixa[caixa].sort((a, b) => {
            const nomeA = (idiomaAtual === 'pt' ? a.name_pt : a.name_en) || a.name || '';
            const nomeB = (idiomaAtual === 'pt' ? b.name_pt : b.name_en) || b.name || '';
            return nomeA.localeCompare(nomeB);
        });

        listaPersonagens.forEach(s => {
            const li = document.createElement('div');
            li.className = 'item-sugestao-lista';
            li.textContent = (idiomaAtual === 'pt' ? s.name_pt : s.name_en) || s.name;
            li.onclick = () => renderizarFichaPersonagem(s);
            boxDiv.appendChild(li);
        });
        divResultados.appendChild(boxDiv);
    });
}

function renderizarFichaPersonagem(sobrevivente) {
    const divResultados = document.getElementById('characters-results-foco');
    if (!divResultados) return;
    
    const nome = (idiomaAtual === 'pt' ? sobrevivente.name_pt : sobrevivente.name_en) || sobrevivente.name;
    const caixas = sobrevivente.set ? sobrevivente.set.replace(/;/g, ' / ') : '';

    let bodyHtml = '';
    if (sobrevivente.body && sobrevivente.body.trim() !== '') {
        const tituloBody = traduzirTag('body');
        const termoBody = sobrevivente.body.trim().toLowerCase();
        const equip = equipamentosBase.find(e => 
            (e.id && e.id.toLowerCase() === termoBody) ||
            (e.name_en && e.name_en.toLowerCase() === termoBody) ||
            (e.name_pt && e.name_pt.toLowerCase() === termoBody) ||
            (e.name && e.name.toLowerCase() === termoBody)
        );
        let equipamentoBody = equip ? (idiomaAtual === 'pt' ? (equip.name_pt || equip.name) : (equip.name_en || equip.name)) : traduzirTag(sobrevivente.body);
        
        bodyHtml = `
            <div style="text-align: center; margin-top: 5px; margin-bottom: 15px; font-size: 0.9em;">
                <span style="color: #4da6ff; text-transform: uppercase; letter-spacing: 1px; margin-right: 5px;">${tituloBody}:</span>
                <span style="color: #e0e0e0; font-weight: bold; text-transform: capitalize;">${equipamentoBody}</span>
            </div>
        `;
    }

    let imagemHtml = '';
    if (sobrevivente.image && sobrevivente.image.trim() !== '') {
        imagemHtml = `
            <div class="sobrevivente-imagem-container">
                <img src="${sobrevivente.image}" alt="${nome}" class="sobrevivente-img" loading="lazy" onerror="this.style.display='none'">
            </div>
        `;
    }

    let roleHtml = '';
    if (sobrevivente.role && sobrevivente.role.trim() !== '') {
        const rolesFormatados = String(sobrevivente.role).split(';').map(r => traduzirTag(r.trim())).filter(Boolean).join(' <span style="color: #ff4747;">|</span> '); 
        roleHtml = `
            <div style="text-align: center; margin-bottom: 15px; font-size: 0.9em; font-weight: bold; color: #d1d1d6; text-transform: uppercase; letter-spacing: 1px;">
                ${rolesFormatados}
            </div>
        `;
    }

    divResultados.innerHTML = `
        <div class="ficha-sobrevivente">
            <div class="ficha-cabecalho" style="text-align: center;">
                <h2>${nome} <span class="divisor-caixa">|</span> <span class="texto-caixa">${caixas}</span></h2>
            </div>
            ${bodyHtml}
            ${imagemHtml}
            ${roleHtml}
            <div id="ficha-niveis" class="niveis-container"></div>
        </div>
    `;

    const containerNiveis = document.getElementById('ficha-niveis');
    const titulosNiveis = {
        pt: { azul: 'Azul', amarelo: 'Amarelo', laranja: 'Laranja', vermelho: 'Vermelho' },
        en: { azul: 'Blue', amarelo: 'Yellow', laranja: 'Orange', vermelho: 'Red' }
    };

    const extrairSlots = (corBase) => {
        let slots = [];
        const chaves = [corBase, `${corBase}1`, `${corBase}2`, `${corBase}3`, `${corBase}4`];
        chaves.forEach(chave => {
            if (sobrevivente[chave] && sobrevivente[chave].trim() !== '') {
                const chaveTag = chave === corBase ? `tag_${corBase}` : `tag_${chave}`;
                slots.push({ id: sobrevivente[chave], tag: sobrevivente[chaveTag] });
            }
        });
        return slots;
    };

    const estrutura = [
        { cor: titulosNiveis[idiomaAtual].azul, classe: 'azul', slots: extrairSlots('blue') },
        { cor: titulosNiveis[idiomaAtual].amarelo, classe: 'amarelo', slots: extrairSlots('yellow') },
        { cor: titulosNiveis[idiomaAtual].laranja, classe: 'laranja', slots: extrairSlots('orange') },
        { cor: titulosNiveis[idiomaAtual].vermelho, classe: 'vermelho', slots: extrairSlots('red') }
    ];

    estrutura.forEach(bloco => {
        if (bloco.slots.length === 0) return;
        bloco.slots.forEach(slot => {
            const hab = obterHabilidadeFormatada(slot.id, slot.tag);
            if (hab) {
                const sub = idiomaAtual === 'pt' ? `<div class="subtitulo-en" style="color: #9e9ea8; font-size: 0.85em; font-style: italic;">${hab.nomeEn}</div>` : '';
                const div = document.createElement('div');
                div.className = 'linha-habilidade';
                div.innerHTML = `
                    <div class="coluna-cor cor-${bloco.classe}">${bloco.cor}</div>
                    <div class="coluna-divisor">|</div>
                    <div class="coluna-texto">
                        <strong>${hab.nome}</strong>${sub}
                        <p class="desc-habilidade" style="margin-top: 6px; color: #dedede; font-size: 0.9em; line-height: 1.4;">${hab.desc}</p>
                    </div>
                `;
                containerNiveis.appendChild(div);
            }
        });
    });
    divResultados.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ==========================================
// 6. INIMIGOS
// ==========================================

function renderizarFiltrosInimigos() {
    const view = document.getElementById('enemies-view');
    if (!view) return;
    let section = document.getElementById('enemy-filter-section');
    
    if (!section) {
        section = document.createElement('div');
        section.id = 'enemy-filter-section';
        section.className = 'filtro-section';
        const controls = view.querySelector('.character-controls');
        view.insertBefore(section, controls);
    }

    const labelClass = traduzirTag('class') || (idiomaAtual === 'pt' ? 'Classe' : 'Class');
    const todosLabel = idiomaAtual === 'pt' ? 'Todos' : 'All';

    const todasClasses = [];
    inimigosBase.forEach(i => {
        if (i.class && String(i.class).trim() !== '') {
            todasClasses.push(...String(i.class).split(';').map(c => c.trim()).filter(Boolean));
        }
    });
    const classesUnicas = [...new Set(todasClasses)].sort();

    let botoesHtml = `
        <div class="filtro-linha">
            <span class="filtro-label">${labelClass}:</span>
            <div class="filtro-container">
                <button class="btn-filtro ${classFiltroInimigo === '' ? 'ativo' : ''}" onclick="selecionarFiltroInimigo('')">${todosLabel}</button>
    `;

    classesUnicas.forEach(c => {
        botoesHtml += `<button class="btn-filtro ${classFiltroInimigo === c ? 'ativo' : ''}" onclick="selecionarFiltroInimigo('${c}')">${traduzirTag(c)}</button>`;
    });

    botoesHtml += `</div></div>`;
    section.innerHTML = botoesHtml;
}

function selecionarFiltroInimigo(classe) {
    classFiltroInimigo = classe;
    renderizarFiltrosInimigos();
    const divResultados = document.getElementById('enemies-results-foco');
    if (divResultados && divResultados.innerHTML.trim() !== '') listarInimigosPorCaixas();
}

function buscarInimigos(termo) {
    const dropdown = document.getElementById('enemies-dropdown');
    dropdown.innerHTML = '';
    if (!termo.trim()) { dropdown.classList.add('hidden'); return; }
    dropdown.classList.remove('hidden');
    const termoMin = termo.toLowerCase();
    
    const filtrados = inimigosBase.filter(i => {
        if (classFiltroInimigo !== '') {
            if (!i.class || !String(i.class).split(';').map(c => c.trim()).includes(classFiltroInimigo)) return false;
        }
        const pt = (i.name_pt || "").toLowerCase();
        const en = (i.name_en || "").toLowerCase();
        return pt.includes(termoMin) || en.includes(termoMin);
    });

    filtrados.forEach(inimigo => {
        const nomeVisivel = idiomaAtual === 'pt' ? inimigo.name_pt : inimigo.name_en;
        const sub = inimigo.set ? inimigo.set.replace(/;/g, ' / ') : '';
        const item = document.createElement('div');
        item.className = 'item-sugestao-lista';
        item.innerHTML = `<strong>${nomeVisivel}</strong> <span class="sub-sugestao">${sub}</span>`;
        item.onclick = () => {
            renderizarFichaInimigo(inimigo);
            dropdown.classList.add('hidden');
            document.getElementById('search-enemies').value = ''; 
        };
        dropdown.appendChild(item);
    });
}

function listarInimigosPorCaixas() {
    const divResultados = document.getElementById('enemies-results-foco');
    const dropdown = document.getElementById('enemies-dropdown');
    if (dropdown) dropdown.classList.add('hidden');
    if (!divResultados) return;
    divResultados.innerHTML = '';
    const porCaixa = {};
    
    const listaFiltrada = inimigosBase.filter(i => {
        if (classFiltroInimigo === '') return true;
        if (!i.class) return false;
        return String(i.class).split(';').map(c => c.trim()).includes(classFiltroInimigo);
    });

    listaFiltrada.forEach(i => {
        if (!i.set || String(i.set).trim() === '') {
            const caixaPadrao = 'Sem Caixa';
            if (!porCaixa[caixaPadrao]) porCaixa[caixaPadrao] = [];
            porCaixa[caixaPadrao].push(i);
            return;
        }
        const caixasDoItem = String(i.set).split(/[;/]/).map(c => c.trim()).filter(Boolean);
        caixasDoItem.forEach(caixa => {
            if (!porCaixa[caixa]) porCaixa[caixa] = [];
            porCaixa[caixa].push(i);
        });
    });

    const caixasOrdenadas = Object.keys(porCaixa).sort((a, b) => {
        const indexA = ordemCaixasPreferida.findIndex(c => c.toLowerCase() === a.toLowerCase());
        const indexB = ordemCaixasPreferida.findIndex(c => c.toLowerCase() === b.toLowerCase());
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.localeCompare(b);
    });

    caixasOrdenadas.forEach(caixa => {
        if (porCaixa[caixa].length === 0) return;
        const boxDiv = document.createElement('div');
        boxDiv.className = 'bloco-caixa';
        boxDiv.innerHTML = `<h3 style="color:#ff4747; border-bottom:1px solid #383840; margin-bottom:10px;">📦 ${caixa}</h3>`;
        
        const listaInimigos = porCaixa[caixa].sort((a, b) => {
            const nomeA = (idiomaAtual === 'pt' ? a.name_pt : a.name_en) || '';
            const nomeB = (idiomaAtual === 'pt' ? b.name_pt : b.name_en) || '';
            return nomeA.localeCompare(nomeB);
        });

        listaInimigos.forEach(i => {
            const li = document.createElement('div');
            li.className = 'item-sugestao-lista';
            li.textContent = idiomaAtual === 'pt' ? i.name_pt : i.name_en;
            li.onclick = () => renderizarFichaInimigo(i);
            boxDiv.appendChild(li);
        });
        divResultados.appendChild(boxDiv);
    });
}

function renderizarFichaInimigo(inimigo) {
    const divResultados = document.getElementById('enemies-results-foco'); 
    if (!divResultados) return;

    const nome = idiomaAtual === 'pt' ? inimigo.name_pt : inimigo.name_en;
    const regras = idiomaAtual === 'pt' ? inimigo.rules_pt : inimigo.rules_en;
    const caixasFormatadas = inimigo.set ? inimigo.set.replace(/;/g, ' / ') : '';
    const classFormatada = inimigo.class ? String(inimigo.class).split(';').map(c => traduzirTag(c.trim())).join(' / ') : '';

    const labels = {
        acoes: traduzirTag('actions') || (idiomaAtual === 'pt' ? 'Ações' : 'Actions'),
        alcance: traduzirTag('range') || (idiomaAtual === 'pt' ? 'Alcance' : 'Range'),
        dano: traduzirTag('damage') || (idiomaAtual === 'pt' ? 'Dano' : 'Damage'),
        movimento: traduzirTag('move') || (idiomaAtual === 'pt' ? 'Mov.' : 'Move'),
        letal: traduzirTag('lethal') || (idiomaAtual === 'pt' ? 'Letal' : 'Lethal'),
        pa: traduzirTag('ap') || (idiomaAtual === 'pt' ? 'PA' : 'AP')
    };

    let imagemHtml = '';
    if (inimigo.image && inimigo.image.trim() !== '') {
        imagemHtml = `
            <div class="inimigo-imagem-container">
                <img src="${inimigo.image}" alt="${nome}" class="inimigo-img" loading="lazy" onerror="this.style.display='none'">
            </div>
        `;
    }

    divResultados.innerHTML = `
        <div class="ficha-inimigo">
            <div class="inimigo-cabecalho">
                <h2>${nome}</h2>
                <div class="inimigo-subtitulo">${classFormatada} | ${caixasFormatadas}</div>
            </div>
            ${imagemHtml}
            <div class="inimigo-stats-grid">
                <div class="stat-item"><span class="stat-label">${labels.acoes}</span><span class="stat-valor">${inimigo.actions}</span></div>
                <div class="stat-item"><span class="stat-label">${labels.alcance}</span><span class="stat-valor">${inimigo.range}</span></div>
                <div class="stat-item"><span class="stat-label">${labels.dano}</span><span class="stat-valor">${inimigo.damage}</span></div>
                <div class="stat-item"><span class="stat-label">${labels.movimento}</span><span class="stat-valor">${inimigo.move}</span></div>
                <div class="stat-item"><span class="stat-label">${labels.letal}</span><span class="stat-valor">${inimigo.lethal}</span></div>
                <div class="stat-item"><span class="stat-label">${labels.pa}</span><span class="stat-valor">${inimigo.ap}</span></div>
            </div>
            <div class="inimigo-regras">
                <p>${regras ? regras : ''}</p>
            </div>
        </div>
    `;
    divResultados.scrollIntoView({ behavior: 'smooth', block: 'start' });
}


// ==========================================
// 7. ORDEM DE PRIORIDADES
// ==========================================

let tabelaPrioridadeAtual = 'bpgh';

function alternarTabelaPrioridade(versao) {
    tabelaPrioridadeAtual = versao;
    renderizarTabelasPrioridade();
}

function renderizarTabelasPrioridade() {
    const divResultados = document.getElementById('priority-results-foco');
    if(!divResultados) return;

    const cabecalhos = {
        prioridade: traduzirTag('priority') !== 'priority' ? traduzirTag('priority') : (idiomaAtual === 'pt' ? 'Prioridade' : 'Priority'),
        nome: traduzirTag('target') !== 'target' ? traduzirTag('target') : (idiomaAtual === 'pt' ? 'Alvo' : 'Target'),
        letal: traduzirTag('damage') !== 'damage' ? traduzirTag('damage') : (idiomaAtual === 'pt' ? 'Dano' : 'Damage'),
        pa: traduzirTag('ap') !== 'ap' ? traduzirTag('ap') : (idiomaAtual === 'pt' ? 'PA' : 'AP')
    };

    let html = `
        <table class="tabela-prioridade">
            <thead>
                <tr>
                    <th>${cabecalhos.prioridade}</th>
                    <th class="coluna-alvo-header">${cabecalhos.nome}</th>
                    <th>${cabecalhos.letal}</th>
                    <th>${cabecalhos.pa}</th>
                </tr>
            </thead>
            <tbody>
    `;

    const dados = tabelaPrioridadeAtual === 'bpgh' ? priorityBpGhBase : priorityWdBase;

    dados.forEach((item) => {
        let nomeTraduzido = traduzirTag(item.name);

        html += `
            <tr>
                <td class="coluna-destaque">${item.priority}</td>
                <td class="coluna-alvo">${nomeTraduzido}</td>
                <td>${item.lethal}</td>
                <td>${item.ap}</td>
            </tr>
        `;
    });

    html += `</tbody></table>`;
    divResultados.innerHTML = html;

    const btnBpGh = document.getElementById('btn-prio-bpgh');
    const btnWd = document.getElementById('btn-prio-wd');
    
    if(btnBpGh && btnWd) {
        if(tabelaPrioridadeAtual === 'bpgh') {
            btnBpGh.className = 'btn-toggle btn-ativo';
            btnWd.className = 'btn-toggle btn-inativo';
        } else {
            btnWd.className = 'btn-toggle btn-ativo';
            btnBpGh.className = 'btn-toggle btn-inativo';
        }
    }
}


// ==========================================
// 8. EQUIPAMENTOS
// ==========================================

function renderizarFiltrosEquipamentos() {
    const view = document.getElementById('equipment-view');
    if (!view) return;
    let section = document.getElementById('equipment-filter-section');
    
    if (!section) {
        section = document.createElement('div');
        section.id = 'equipment-filter-section';
        section.className = 'filtro-section';
        const controls = view.querySelector('.character-controls');
        view.insertBefore(section, controls);
    }

    const todosLabel = idiomaAtual === 'pt' ? 'Todos' : 'All';

    // Helper para extrair valores únicos de um campo específico (ignorando itens invisíveis)
    const extrairValores = (campo) => {
        const valores = [];
        equipamentosBase.forEach(e => {
            if (e.visible !== undefined && String(e.visible).trim().toLowerCase() === 'false') return;
            if (e[campo] && String(e[campo]).trim() !== '') {
                valores.push(...String(e[campo]).split(';').map(x => x.trim()).filter(Boolean));
            }
        });
        return [...new Set(valores)].sort();
    };

    const decks = extrairValores('deck');
    const classes = extrairValores('class');
    const types = extrairValores('type');

    // Helper para criar uma linha de botões
    const criarLinhaFiltro = (label, valores, filtroAtivo, tipoState) => {
        if (valores.length === 0) return '';
        let html = `
            <div class="filtro-linha">
                <span class="filtro-label">${traduzirTag(label) || label}:</span>
                <div class="filtro-container">
                    <button class="btn-filtro ${filtroAtivo === '' ? 'ativo' : ''}" onclick="selecionarFiltroEquipamento('${tipoState}', '')">${todosLabel}</button>
        `;
        valores.forEach(v => {
            html += `<button class="btn-filtro ${filtroAtivo === v ? 'ativo' : ''}" onclick="selecionarFiltroEquipamento('${tipoState}', '${v}')">${traduzirTag(v)}</button>`;
        });
        html += `</div></div>`;
        return html;
    };

    section.innerHTML = 
        criarLinhaFiltro('deck', decks, deckFiltroEquip, 'deck') +
        criarLinhaFiltro('class', classes, classFiltroEquip, 'class') +
        criarLinhaFiltro('type', types, typeFiltroEquip, 'type');
}

function selecionarFiltroEquipamento(tipo, valor) {
    if (tipo === 'deck') deckFiltroEquip = valor;
    if (tipo === 'class') classFiltroEquip = valor;
    if (tipo === 'type') typeFiltroEquip = valor;
    
    renderizarFiltrosEquipamentos();
    const divResultados = document.getElementById('equipment-results-foco');
    if (divResultados && divResultados.innerHTML.trim() !== '') listarEquipamentosPorCaixas();
}

// Verifica se um item passa no teste de um filtro específico
const verificaFiltroEquipamento = (valorFiltro, campoItem) => {
    if (valorFiltro === '') return true; // Se não tem filtro selecionado, passa livre.
    if (!campoItem) return false; // Se tem filtro ativo mas o item não tem esse campo, bloqueia.
    return String(campoItem).split(';').map(x => x.trim()).includes(valorFiltro);
};

function buscarEquipamentos(termo) {
    const dropdown = document.getElementById('equipment-dropdown');
    dropdown.innerHTML = '';
    if (!termo.trim()) { dropdown.classList.add('hidden'); return; }
    dropdown.classList.remove('hidden');
    const termoMin = termo.toLowerCase();
    
    const filtrados = equipamentosBase.filter(e => {
        if (e.visible !== undefined && String(e.visible).trim().toLowerCase() === 'false') return false;
        
        // Aplica os três filtros combinados
        if (!verificaFiltroEquipamento(deckFiltroEquip, e.deck)) return false;
        if (!verificaFiltroEquipamento(classFiltroEquip, e.class)) return false;
        if (!verificaFiltroEquipamento(typeFiltroEquip, e.type)) return false;

        const pt = (e.name_pt || "").toLowerCase();
        const en = (e.name_en || "").toLowerCase();
        return pt.includes(termoMin) || en.includes(termoMin);
    });

    filtrados.forEach(equip => {
        const nomeVisivel = idiomaAtual === 'pt' ? equip.name_pt : equip.name_en;
        const sub = equip.set ? equip.set.replace(/;/g, ' / ') : '';
        const item = document.createElement('div');
        item.className = 'item-sugestao-lista';
        item.innerHTML = `<strong>${nomeVisivel}</strong> <span class="sub-sugestao">${sub}</span>`;
        item.onclick = () => {
            renderizarFichaEquipamento(equip);
            dropdown.classList.add('hidden');
            document.getElementById('search-equipment').value = ''; 
        };
        dropdown.appendChild(item);
    });
}

function listarEquipamentosPorCaixas() {
    const divResultados = document.getElementById('equipment-results-foco');
    const dropdown = document.getElementById('equipment-dropdown');
    if (dropdown) dropdown.classList.add('hidden');
    if (!divResultados) return;
    
    divResultados.innerHTML = '';
    const porCaixa = {};

    const listaFiltrada = equipamentosBase.filter(e => {
        if (e.visible !== undefined && String(e.visible).trim().toLowerCase() === 'false') return false;
        
        // Aplica os três filtros combinados
        if (!verificaFiltroEquipamento(deckFiltroEquip, e.deck)) return false;
        if (!verificaFiltroEquipamento(classFiltroEquip, e.class)) return false;
        if (!verificaFiltroEquipamento(typeFiltroEquip, e.type)) return false;
        
        return true;
    });

    listaFiltrada.forEach(e => {
        if (!e.set || String(e.set).trim() === '') {
            const caixaPadrao = 'Sem Caixa';
            if (!porCaixa[caixaPadrao]) porCaixa[caixaPadrao] = [];
            porCaixa[caixaPadrao].push(e);
            return;
        }
        const caixasDoItem = String(e.set).split(/[;/]/).map(c => c.trim()).filter(Boolean);
        caixasDoItem.forEach(caixa => {
            if (!porCaixa[caixa]) porCaixa[caixa] = [];
            porCaixa[caixa].push(e);
        });
    });

    const caixasOrdenadas = Object.keys(porCaixa).sort((a, b) => {
        const indexA = ordemCaixasPreferida.findIndex(c => c.toLowerCase() === a.toLowerCase());
        const indexB = ordemCaixasPreferida.findIndex(c => c.toLowerCase() === b.toLowerCase());
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.localeCompare(b);
    });

    caixasOrdenadas.forEach(caixa => {
        if (porCaixa[caixa].length === 0) return;
        const boxDiv = document.createElement('div');
        boxDiv.className = 'bloco-caixa';
        boxDiv.innerHTML = `<h3 style="color:#4da6ff; border-bottom:1px solid #383840; margin-bottom:10px;">📦 ${caixa}</h3>`;
        
        const listaEquipamentos = porCaixa[caixa].sort((a, b) => {
            const nomeA = (idiomaAtual === 'pt' ? a.name_pt : a.name_en) || '';
            const nomeB = (idiomaAtual === 'pt' ? b.name_pt : b.name_en) || '';
            return nomeA.localeCompare(nomeB);
        });

        listaEquipamentos.forEach(e => {
            const li = document.createElement('div');
            li.className = 'item-sugestao-lista';
            li.textContent = idiomaAtual === 'pt' ? e.name_pt : e.name_en;
            li.onclick = () => renderizarFichaEquipamento(e);
            boxDiv.appendChild(li);
        });
        divResultados.appendChild(boxDiv);
    });
}

function renderizarFichaEquipamento(equip) {
    const divResultados = document.getElementById('equipment-results-foco'); 
    if (!divResultados) return;

    const nome = idiomaAtual === 'pt' ? equip.name_pt : equip.name_en;
    const texto = idiomaAtual === 'pt' ? equip.effect_pt : equip.effect_en;
    const setFormatado = equip.set ? equip.set.replace(/;/g, ' / ') : ''; 

    const formatarAtributoSplit = (valor, index) => {
        if (valor === 0 || valor === '0') return index === 0 ? '0' : '-'; 
        if (valor === undefined || valor === null || String(valor).trim() === '') return '-';
        const parts = String(valor).split(';');
        if (parts.length > index) {
            const part = parts[index].trim();
            if (part === '0') return '0';
            return part ? part : '-';
        }
        return '-';
    };

    const traduzirMultiplos = (campo) => {
        if (!campo || String(campo).trim() === '') return null;
        return String(campo).split(';').map(tag => traduzirTag(tag.trim())).join(' / ');
    };

    const formatarETraduzir = (valor) => {
        if (!valor || String(valor).trim() === '') return '-';
        return String(valor).split(';').map(v => traduzirTag(v.trim())).join(' / ');
    };

    const tagsEquipamento = [
        traduzirMultiplos(equip.deck),
        traduzirMultiplos(equip.class),
        traduzirMultiplos(equip.type)
    ].filter(Boolean).join(' | ');

    let imagemHtml = '';
    if (equip.image && equip.image.trim() !== '') {
        imagemHtml = `
            <div class="equipamento-imagem-container">
                <img src="${equip.image}" alt="${nome}" class="equipamento-img" loading="lazy" onerror="this.style.display='none'">
            </div>
        `;
    }
    
    const hasSecondMode = (equip.range && String(equip.range).includes(';')) ||
                          (equip.dice && String(equip.dice).includes(';')) ||
                          (equip.accuracy && String(equip.accuracy).includes(';')) ||
                          (equip.damage && String(equip.damage).includes(';'));

    let statsHtml = `
        <div class="equipamento-stats-grid">
            <div class="stat-item"><span class="stat-label">${traduzirTag('range')}</span><span class="stat-valor">${formatarAtributoSplit(equip.range, 0)}</span></div>
            <div class="stat-item"><span class="stat-label">${traduzirTag('dice')}</span><span class="stat-valor">${formatarAtributoSplit(equip.dice, 0)}</span></div>
            <div class="stat-item"><span class="stat-label">${traduzirTag('accuracy')}</span><span class="stat-valor">${formatarAtributoSplit(equip.accuracy, 0)}</span></div>
            <div class="stat-item"><span class="stat-label">${traduzirTag('damage')}</span><span class="stat-valor">${formatarAtributoSplit(equip.damage, 0)}</span></div>
        </div>
    `;

    if (hasSecondMode) {
        statsHtml += `
        <div class="equipamento-stats-grid" style="margin-top: 8px;">
            <div class="stat-item"><span class="stat-label">${traduzirTag('range')}</span><span class="stat-valor">${formatarAtributoSplit(equip.range, 1)}</span></div>
            <div class="stat-item"><span class="stat-label">${traduzirTag('dice')}</span><span class="stat-valor">${formatarAtributoSplit(equip.dice, 1)}</span></div>
            <div class="stat-item"><span class="stat-label">${traduzirTag('accuracy')}</span><span class="stat-valor">${formatarAtributoSplit(equip.accuracy, 1)}</span></div>
            <div class="stat-item"><span class="stat-label">${traduzirTag('damage')}</span><span class="stat-valor">${formatarAtributoSplit(equip.damage, 1)}</span></div>
        </div>
        `;
    }
    
    divResultados.innerHTML = `
        <div class="ficha-equipamento">
            <div class="equipamento-cabecalho">
                <h2>${nome}</h2>
                <div class="equipamento-set">${setFormatado}</div>
                <div class="equipamento-tags">${tagsEquipamento}</div>
            </div>
            ${imagemHtml}
            ${statsHtml}
            <div class="equipamento-stats-grid">
                <div class="stat-item"><span class="stat-label">${traduzirTag('danger')}</span><span class="stat-valor">${formatarETraduzir(equip.danger)}</span></div>
                <div class="stat-item"><span class="stat-label">${traduzirTag('dual')}</span><span class="stat-valor">${formatarETraduzir(equip.dual)}</span></div>
                <div class="stat-item"><span class="stat-label">${traduzirTag('noise')}</span><span class="stat-valor">${formatarETraduzir(equip.noise)}</span></div>
                <div class="stat-item"><span class="stat-label">${traduzirTag('door')}</span><span class="stat-valor">${formatarETraduzir(equip.door)}</span></div>
            </div>
            ${texto ? `<div class="equipamento-texto"><p>${texto}</p></div>` : ''}
        </div>
    `;
    divResultados.scrollIntoView({ behavior: 'smooth', block: 'start' });
}