/// ==========================================
// 1. BANCOS DE DADOS E ESTADO GERAL
// ==========================================
let habilidadesBase = [];
let sobreviventesBase = [];
let inimigosBase = [];
let equipamentosBase = [];
let auxBase = []; // <-- Substituiu o antigo tagsBase
let priorityBpGhBase = [];
let priorityWdBase = [];
let idiomaAtual = 'pt';

// (Mantenha o seu const i18nUI = { ... } intacto aqui no meio)

Promise.all([
    fetch('skills.json').then(res => res.json()).catch(() => []),
    fetch('survivors.json').then(res => res.json()).catch(() => []),
    fetch('enemies.json').then(res => res.json()).catch(() => []),
    fetch('equipment.json').then(res => res.json()).catch(() => []),
    fetch('aux.json').then(res => res.json()).catch(() => []),
    fetch('prioritybpgh.json').then(res => res.json()).catch(() => []),
    fetch('prioritywd.json').then(res => res.json()).catch(() => [])
]).then(results => {
    habilidadesBase = results[0];
    sobreviventesBase = results[1];
    inimigosBase = results[2];
    equipamentosBase = results[3];
    auxBase = results[4];
    priorityBpGhBase = results[5];
    priorityWdBase = results[6];
    
    configurarBuscas();
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
    // 1. Troca o idioma no estado do aplicativo
    idiomaAtual = idiomaAtual === 'pt' ? 'en' : 'pt';
    
    // 2. Traduz os textos fixos da interface (HTML)
    atualizarIdiomaInterface();

    // 3. Atualiza a tabela de prioridades em tempo real para o novo idioma
    renderizarTabelasPrioridade();

    // 4. Limpa as pesquisas ativas para forçar o usuário a buscar novamente no novo idioma
    // (Evita que fichas fiquem com metades em PT e metades em EN)
    limparTelasEBuscas();
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
function sugerirPersonagens(termo) {
    const dropdown = document.getElementById('characters-dropdown');
    dropdown.innerHTML = '';

    if (!termo.trim()) {
        dropdown.classList.add('hidden');
        return;
    }

    dropdown.classList.remove('hidden');
    const termoMin = termo.toLowerCase();

    // 1. Busca Caixas (Sets) que batem com o termo
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

    // 2. Busca Personagens que batem com o termo
    const filtrados = sobreviventesBase.filter(s => s.name.toLowerCase().includes(termoMin));

    filtrados.forEach(s => {
        const item = document.createElement('div');
        item.className = 'item-sugestao-lista';
        item.innerHTML = `<strong>${s.name}</strong> <span class="sub-sugestao">${s.set}</span>`;
        
        item.onclick = () => {
            renderizarFichaPersonagem(s);
            dropdown.classList.add('hidden');
            document.getElementById('search-characters').value = '';
        };
        dropdown.appendChild(item);
    });
}

// Renderiza todos os personagens de uma caixa (set) específica
function listarPersonagensDaCaixa(caixaNome) {
    const divResultados = document.getElementById('characters-results-foco');
    divResultados.innerHTML = '';

    const boxDiv = document.createElement('div');
    boxDiv.className = 'bloco-caixa';
    boxDiv.innerHTML = `<h3 style="color:#ff4747; border-bottom:1px solid #383840; margin-bottom:10px;">📦 ${caixaNome}</h3>`;
    
    const lista = sobreviventesBase.filter(s => s.set === caixaNome);
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
        if (!porCaixa[s.set]) porCaixa[s.set] = [];
        porCaixa[s.set].push(s);
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
    
    // 1. Injeção Condicional da Imagem
    let imagemHtml = '';
    if (sobrevivente.image && sobrevivente.image.trim() !== '') {
        imagemHtml = `
            <div class="sobrevivente-imagem-container">
                <img src="${sobrevivente.image}" alt="${sobrevivente.name}" class="sobrevivente-img" loading="lazy" onerror="this.style.display='none'">
            </div>
        `;
    }

    // 2. Injeção Condicional do Body (Equipamento de Corpo)
    const labelBody = idiomaAtual === 'pt' ? 'Equipamento de Corpo:' : 'Body Equipment:';
    let bodyHtml = '';
    if (sobrevivente.body && sobrevivente.body.trim() !== '') {
        bodyHtml = `
            <div class="sobrevivente-body-container">
                <span class="label-body">${labelBody}</span> ${sobrevivente.body}
            </div>
        `;
    }

    // 3. Montagem da Interface Completa (com 'set' ao invés de 'box')
    divResultados.innerHTML = `
        <div class="ficha-sobrevivente">
            <div class="ficha-cabecalho">
                <h2>${sobrevivente.name} <span class="divisor-caixa">|</span> <span class="texto-caixa">${sobrevivente.set}</span></h2>
            </div>
            ${imagemHtml}
            ${bodyHtml}
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
// ==========================================
// 6. INIMIGOS
// ==========================================

function buscarInimigos(termo) {
    const dropdown = document.getElementById('enemies-dropdown');
    dropdown.innerHTML = '';
    
    if (!termo.trim()) {
        dropdown.classList.add('hidden');
        return;
    }

    dropdown.classList.remove('hidden');
    const termoMin = termo.toLowerCase();
    
    const filtrados = inimigosBase.filter(i => {
        const pt = (i.name_pt || "").toLowerCase();
        const en = (i.name_en || "").toLowerCase();
        return pt.includes(termoMin) || en.includes(termoMin);
    });

    filtrados.forEach(inimigo => {
        const nomeVisivel = idiomaAtual === 'pt' ? inimigo.name_pt : inimigo.name_en;
        const sub = inimigo.set || '';

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

function renderizarFichaInimigo(inimigo) {
    const divResultados = document.getElementById('enemies-results-foco'); 
    if (!divResultados) return;

    const nome = idiomaAtual === 'pt' ? inimigo.name_pt : inimigo.name_en;
    const regras = idiomaAtual === 'pt' ? inimigo.rules_pt : inimigo.rules_en;

    const labels = {
        acoes: idiomaAtual === 'pt' ? 'Ações' : 'Actions',
        alcance: idiomaAtual === 'pt' ? 'Alcance' : 'Range',
        dano: idiomaAtual === 'pt' ? 'Dano' : 'Damage',
        movimento: idiomaAtual === 'pt' ? 'Mov.' : 'Move',
        letal: idiomaAtual === 'pt' ? 'Letal' : 'Lethal',
        pa: idiomaAtual === 'pt' ? 'PA' : 'AP'
    };

    let imagemHtml = '';
    if (inimigo.image && inimigo.image.trim() !== '') {
        imagemHtml = `
            <div class="inimigo-imagem-container">
                <img src="${inimigo.image}" alt="${nome}" class="inimigo-img" loading="lazy" onerror="this.style.display='none'">
            </div>
        `;
    }
    function listarInimigosPorCaixas() {
    const divResultados = document.getElementById('enemies-results-foco');
    document.getElementById('enemies-dropdown').classList.add('hidden');
    divResultados.innerHTML = '';

    const porCaixa = {};
    inimigosBase.forEach(i => {
        const caixa = i.set || 'Sem Caixa';
        if (!porCaixa[caixa]) porCaixa[caixa] = [];
        porCaixa[caixa].push(i);
    });

    for (const [caixa, lista] of Object.entries(porCaixa)) {
        const boxDiv = document.createElement('div');
        boxDiv.className = 'bloco-caixa';
        boxDiv.innerHTML = `<h3 style="color:#ff4747; border-bottom:1px solid #383840; margin-bottom:10px;">📦 ${caixa}</h3>`;
        
        lista.forEach(i => {
            const li = document.createElement('div');
            li.className = 'item-sugestao-lista';
            li.textContent = idiomaAtual === 'pt' ? i.name_pt : i.name_en;
            li.onclick = () => renderizarFichaInimigo(i);
            boxDiv.appendChild(li);
        });
        divResultados.appendChild(boxDiv);
    }
    }

    divResultados.innerHTML = `
        <div class="ficha-inimigo">
            <div class="inimigo-cabecalho">
                <h2>${nome}</h2>
                <div class="inimigo-subtitulo">${inimigo.class} | ${inimigo.set}</div>
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

    // Busca as traduções dos cabeçalhos no aux.json
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
        // Usa a nossa função inteligente para traduzir o nome do zumbi buscando no aux.json
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

    // Atualiza o visual dos botões de alternância
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

function buscarEquipamentos(termo) {
    const dropdown = document.getElementById('equipment-dropdown');
    dropdown.innerHTML = '';
    
    if (!termo.trim()) {
        dropdown.classList.add('hidden');
        return;
    }

    dropdown.classList.remove('hidden');
    const termoMin = termo.toLowerCase();
    
    const filtrados = equipamentosBase.filter(e => {
        const pt = (e.name_pt || "").toLowerCase();
        const en = (e.name_en || "").toLowerCase();
        return pt.includes(termoMin) || en.includes(termoMin);
    });

    filtrados.forEach(equip => {
        const nomeVisivel = idiomaAtual === 'pt' ? equip.name_pt : equip.name_en;
        // Substitui o ; por / na sugestão da barra de pesquisa
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

function renderizarFichaEquipamento(equip) {
    const divResultados = document.getElementById('equipment-results-foco'); 
    if (!divResultados) return;

    const nome = idiomaAtual === 'pt' ? equip.name_pt : equip.name_en;
    // Apontando para as chaves corretas do seu JSON
    const texto = idiomaAtual === 'pt' ? equip.effect_pt : equip.effect_en;
    // Substitui o ; por / na ficha final
    const setFormatado = equip.set ? equip.set.replace(/;/g, ' / ') : ''; 

    // Helper para garantir que o '0' não desapareça
    const formatarAtributo = (valor) => {
        if (valor === 0 || valor === '0') return valor;
        return valor ? valor : '-';
    };

    let deckFormatado = equip.deck ? traduzirTag(equip.deck) : null;
    if (deckFormatado) {
        deckFormatado = deckFormatado.replace(/;/g, ' / ');
    }

    const tagsEquipamento = [
        deckFormatado,
        equip.class ? traduzirTag(equip.class) : null,
        equip.type ? traduzirTag(equip.type) : null
    ].filter(Boolean).join(' | ');

    let imagemHtml = '';
    if (equip.image && equip.image.trim() !== '') {
        imagemHtml = `
            <div class="equipamento-imagem-container">
                <img src="${equip.image}" alt="${nome}" class="equipamento-img" loading="lazy" onerror="this.style.display='none'">
            </div>
        `;
    }
    function listarEquipamentosPorCaixas() {
    const divResultados = document.getElementById('equipment-results-foco');
    document.getElementById('equipment-dropdown').classList.add('hidden');
    divResultados.innerHTML = '';

    const porCaixa = {};

    equipamentosBase.forEach(e => {
        if (!e.set) {
            // Se não tiver caixa, joga em um grupo padrão
            const caixaPadrao = 'Sem Caixa';
            if (!porCaixa[caixaPadrao]) porCaixa[caixaPadrao] = [];
            porCaixa[caixaPadrao].push(e);
            return;
        }

        // Separa o set por ';' ou '/' para lidar com itens que pertencem a múltiplas caixas
        const caixasDoItem = e.set.split(/[;/]/).map(c => c.trim()).filter(Boolean);

        caixasDoItem.forEach(caixaOriginal => {
            // Formata o nome da caixa trocando eventuais separadores internos por barra se necessário
            const caixaFormatada = caixaOriginal.replace(/;/g, ' / ');

            if (!porCaixa[caixaFormatada]) {
                porCaixa[caixaFormatada] = [];
            }
            // Adiciona o equipamento na lista desta caixa específica
            porCaixa[caixaFormatada].push(e);
        });
    });

    // Ordena os nomes das caixas alfabeticamente para ficar organizado na tela
    const caixasOrdenadas = Object.keys(porCaixa).sort();

    caixasOrdenadas.forEach(caixa => {
        const boxDiv = document.createElement('div');
        boxDiv.className = 'bloco-caixa';
        boxDiv.innerHTML = `<h3 style="color:#4da6ff; border-bottom:1px solid #383840; margin-bottom:10px;">📦 ${caixa}</h3>`;
        
        // Ordena os equipamentos dentro da caixa alfabeticamente pelo nome no idioma atual
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

    
    
    divResultados.innerHTML = `
        <div class="ficha-equipamento">
            <div class="equipamento-cabecalho">
                <h2>${nome}</h2>
                <div class="equipamento-set">${setFormatado}</div>
                <div class="equipamento-tags">${tagsEquipamento}</div>
            </div>
            
            ${imagemHtml}
            
            <div class="equipamento-stats-grid">
                <div class="stat-item"><span class="stat-label">${traduzirTag('range')}</span><span class="stat-valor">${formatarAtributo(equip.range)}</span></div>
                <div class="stat-item"><span class="stat-label">${traduzirTag('dice')}</span><span class="stat-valor">${formatarAtributo(equip.dice)}</span></div>
                <div class="stat-item"><span class="stat-label">${traduzirTag('accuracy')}</span><span class="stat-valor">${formatarAtributo(equip.accuracy)}</span></div>
                <div class="stat-item"><span class="stat-label">${traduzirTag('damage')}</span><span class="stat-valor">${formatarAtributo(equip.damage)}</span></div>
            </div>

            <div class="equipamento-stats-grid">
                <div class="stat-item"><span class="stat-label">${traduzirTag('danger')}</span><span class="stat-valor">${formatarAtributo(equip.danger)}</span></div>
                <div class="stat-item"><span class="stat-label">${traduzirTag('dual')}</span><span class="stat-valor">${formatarAtributo(equip.dual)}</span></div>
                <div class="stat-item"><span class="stat-label">${traduzirTag('noise')}</span><span class="stat-valor">${formatarAtributo(equip.noise)}</span></div>
                <div class="stat-item"><span class="stat-label">${traduzirTag('door')}</span><span class="stat-valor">${formatarAtributo(equip.door)}</span></div>
            </div>
            
            ${texto ? `<div class="equipamento-texto"><p>${texto}</p></div>` : ''}
        </div>
    `;
}
