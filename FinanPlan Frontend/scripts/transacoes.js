let transacoes = [
    { id: 1,  nome: 'Salário',         obs: 'Pagamento mensal',         categoria: 'salario',     tipo: 'receita', valor: 8500,  data: '2025-03-01', metodo: 'TED/DOC'  },
    { id: 2,  nome: 'Freelance Web',   obs: 'Projeto de e-commerce',    categoria: 'freelance',   tipo: 'receita', valor: 2000,  data: '2025-03-02', metodo: 'PIX'      },
    { id: 3,  nome: 'Aluguel',         obs: 'Moradia mensal',           categoria: 'moradia',     tipo: 'despesa', valor: 2200,  data: '2025-03-02', metodo: 'TED/DOC'  },
    { id: 4,  nome: 'Supermercado',    obs: 'Compras da semana',        categoria: 'alimentacao', tipo: 'despesa', valor: 650,   data: '2025-03-03', metodo: 'Débito'   },
    { id: 5,  nome: 'Uber',            obs: 'Corridas do dia',          categoria: 'transporte',  tipo: 'despesa', valor: 130,   data: '2025-03-03', metodo: 'Crédito'  },
    { id: 6,  nome: 'Netflix + Spotify', obs: 'Assinaturas mensais',   categoria: 'assinatura',  tipo: 'despesa', valor: 89,    data: '2025-03-04', metodo: 'Crédito'  },
    { id: 7,  nome: 'Academia',        obs: 'Mensalidade',              categoria: 'saude',       tipo: 'despesa', valor: 120,   data: '2025-03-05', metodo: 'Débito'   },
    { id: 8,  nome: 'Restaurante',     obs: 'Jantar com amigos',        categoria: 'alimentacao', tipo: 'despesa', valor: 185,   data: '2025-03-07', metodo: 'Crédito'  },
    { id: 9,  nome: 'Farmácia',        obs: 'Remédios',                 categoria: 'saude',       tipo: 'despesa', valor: 67,    data: '2025-03-08', metodo: 'PIX'      },
    { id: 10, nome: 'Cinema',          obs: 'Lazer fim de semana',      categoria: 'lazer',       tipo: 'despesa', valor: 45,    data: '2025-03-09', metodo: 'Crédito'  },
    { id: 11, nome: 'Dividendos',      obs: 'Rendimentos de ações',     categoria: 'freelance',   tipo: 'receita', valor: 320,   data: '2025-03-10', metodo: 'TED/DOC'  },
    { id: 12, nome: 'Gasolina',        obs: 'Abastecimento',            categoria: 'transporte',  tipo: 'despesa', valor: 210,   data: '2025-03-11', metodo: 'Débito'   },
    { id: 13, nome: 'Mercado Livre',   obs: 'Compra online',            categoria: 'lazer',       tipo: 'despesa', valor: 148,   data: '2025-03-12', metodo: 'PIX'      },
    { id: 14, nome: 'Luz',             obs: 'Conta de energia',         categoria: 'moradia',     tipo: 'despesa', valor: 136,   data: '2025-03-13', metodo: 'Débito'   },
    { id: 15, nome: 'Internet',        obs: 'Plano fibra',              categoria: 'assinatura',  tipo: 'despesa', valor: 100,   data: '2025-03-14', metodo: 'Débito'   },
    { id: 16, nome: 'Venda de curso',  obs: 'Infoproduto',              categoria: 'freelance',   tipo: 'receita', valor: 450,   data: '2025-03-15', metodo: 'PIX'      },
    { id: 17, nome: 'Bar',             obs: 'Happy hour',               categoria: 'lazer',       tipo: 'despesa', valor: 75,    data: '2025-03-16', metodo: 'Crédito'  },
    { id: 18, nome: 'Dentista',        obs: 'Consulta de rotina',       categoria: 'saude',       tipo: 'despesa', valor: 200,   data: '2025-03-17', metodo: 'PIX'      },
    { id: 19, nome: 'Estacionamento',  obs: 'Shopping',                 categoria: 'transporte',  tipo: 'despesa', valor: 28,    data: '2025-03-18', metodo: 'Dinheiro' },
    { id: 20, nome: 'Condomínio',      obs: 'Taxa mensal',              categoria: 'moradia',     tipo: 'despesa', valor: 450,   data: '2025-03-19', metodo: 'Débito'   },
    { id: 21, nome: 'iFood',           obs: 'Delivery',                 categoria: 'alimentacao', tipo: 'despesa', valor: 95,    data: '2025-03-20', metodo: 'Crédito'  },
    { id: 22, nome: 'Reembolso',       obs: 'Empresa',                  categoria: 'salario',     tipo: 'receita', valor: 230,   data: '2025-03-21', metodo: 'PIX'      },
    { id: 23, nome: 'Roupa',           obs: 'Shopping',                 categoria: 'lazer',       tipo: 'despesa', valor: 250,   data: '2025-03-22', metodo: 'Crédito'  },
    { id: 24, nome: 'Livros',          obs: 'Amazon',                   categoria: 'lazer',       tipo: 'despesa', valor: 87,    data: '2025-03-24', metodo: 'Crédito'  },
];


const iconeCategoria = {
    salario:     'work',
    freelance:   'laptop',
    moradia:     'home',
    alimentacao: 'restaurant',
    transporte:  'directions_car',
    lazer:       'sports_esports',
    saude:       'favorite',
    assinatura:  'subscriptions',
    outro:       'receipt',
};

const nomeCategoria = {
    salario:     'Salário',
    freelance:   'Freelance',
    moradia:     'Moradia',
    alimentacao: 'Alimentação',
    transporte:  'Transporte',
    lazer:       'Lazer',
    saude:       'Saúde',
    assinatura:  'Assinatura',
    outro:       'Outro',
};

let paginaAtual = 1;
const porPagina = 8;
let filtroTipo = '';
let filtroMes = '03';
let filtroCategoria = '';
let buscaTexto = '';
let tipoNova = 'receita';
let idExcluir = null;
let proximoId = transacoes.length + 1;


function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarData(dataStr) {
    const [ano, mes, dia] = dataStr.split('-');
    const meses = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
    return `${dia} de ${meses[parseInt(mes) - 1]}.`;
}

function filtrarTransacoes() {
    return transacoes.filter(t => {
        const mesT = t.data.split('-')[1];
        const matchMes = filtroMes === '' || mesT === filtroMes;
        const matchTipo = filtroTipo === '' || t.tipo === filtroTipo;
        const matchCat = filtroCategoria === '' || t.categoria === filtroCategoria;
        const matchBusca = buscaTexto === '' ||
            t.nome.toLowerCase().includes(buscaTexto.toLowerCase()) ||
            (t.obs || '').toLowerCase().includes(buscaTexto.toLowerCase());
        return matchMes && matchTipo && matchCat && matchBusca;
    });
}

function renderizarLista() {
    const lista = document.getElementById('lista-transacoes');
    const filtradas = filtrarTransacoes();
    const total = filtradas.length;
    const inicio = (paginaAtual - 1) * porPagina;
    const fim = Math.min(inicio + porPagina, total);
    const pagina = filtradas.slice(inicio, fim);

    lista.innerHTML = '';

    if (pagina.length === 0) {
        lista.innerHTML = `
            <div class="lista-vazia">
                <div class="material-icons">search_off</div>
                <p>Nenhuma transação encontrada com os filtros aplicados.</p>
            </div>`;
        document.getElementById('pag-info').textContent = 'Nenhuma transação';
        return;
    }

    pagina.forEach(t => {
        const icone = iconeCategoria[t.categoria] || 'receipt';
        const cat = nomeCategoria[t.categoria] || t.categoria;

        const row = document.createElement('div');
        row.className = 'transacao-row';
        row.innerHTML = `
            <div class="transacao-desc">
                <div class="transacao-icone ${t.tipo}">
                    <span class="material-icons">${icone}</span>
                </div>
                <div>
                    <div class="transacao-nome">${t.nome}</div>
                    <div class="transacao-obs">${t.obs || ''}</div>
                </div>
            </div>
            <div>
                <span class="categoria-badge">
                    <span class="material-icons" style="font-size:13px">${icone}</span>
                    ${cat}
                </span>
            </div>
            <div class="transacao-data">${formatarData(t.data)}</div>
            <div>
                <span class="metodo-badge">${t.metodo}</span>
            </div>
            <div class="transacao-valor ${t.tipo}">
                ${t.tipo === 'receita' ? '+' : '-'} ${formatarMoeda(t.valor)}
            </div>
            <div class="transacao-acoes">
                <button class="acao-btn editar" title="Editar" onclick="abrirEditar(${t.id})">
                    <span class="material-icons">edit</span>
                </button>
                <button class="acao-btn excluir" title="Excluir" onclick="confirmarExcluir(${t.id})">
                    <span class="material-icons">delete</span>
                </button>
            </div>
        `;
        lista.appendChild(row);
    });

    document.getElementById('pag-info').textContent =
        `Mostrando ${inicio + 1}–${fim} de ${total}`;

    atualizarPaginacao(total);
}

function atualizarPaginacao(total) {
    const totalPaginas = Math.ceil(total / porPagina);
    const botoes = document.querySelectorAll('.pag-btn[id^="pag-"]');

    botoes.forEach(btn => {
        const num = parseInt(btn.id.split('-')[1]);
        if (!isNaN(num)) {
            if (num <= totalPaginas) {
                btn.style.display = 'flex';
                btn.textContent = num;
                btn.classList.toggle('active', num === paginaAtual);
            } else {
                btn.style.display = 'none';
            }
        }
    });

    document.getElementById('pag-anterior').disabled = paginaAtual <= 1;
    document.getElementById('pag-proximo').disabled = paginaAtual >= totalPaginas;
}

document.getElementById('pag-anterior').addEventListener('click', () => {
    if (paginaAtual > 1) { paginaAtual--; renderizarLista(); }
});
document.getElementById('pag-proximo').addEventListener('click', () => {
    const total = Math.ceil(filtrarTransacoes().length / porPagina);
    if (paginaAtual < total) { paginaAtual++; renderizarLista(); }
});
['pag-1', 'pag-2', 'pag-3'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', () => {
        paginaAtual = parseInt(btn.textContent);
        renderizarLista();
    });
});

function atualizarResumo() {
    const filtradas = filtrarTransacoes();
    const receitas = filtradas.filter(t => t.tipo === 'receita').reduce((s, t) => s + t.valor, 0);
    const despesas = filtradas.filter(t => t.tipo === 'despesa').reduce((s, t) => s + t.valor, 0);
    const saldo = receitas - despesas;
    const qtdReceitas = filtradas.filter(t => t.tipo === 'receita').length;
    const qtdDespesas = filtradas.filter(t => t.tipo === 'despesa').length;

    const cards = document.querySelectorAll('.resumo-valor');
    const subs = document.querySelectorAll('.resumo-sub');

    if (cards[0]) cards[0].textContent = formatarMoeda(receitas);
    if (cards[1]) cards[1].textContent = formatarMoeda(despesas);
    if (cards[2]) cards[2].textContent = formatarMoeda(saldo);
    if (cards[3]) cards[3].textContent = filtradas.length;

    if (subs[1]) subs[1].textContent = receitas > 0
        ? `${Math.round((despesas / receitas) * 100)}% da receita`
        : '0% da receita';
    if (subs[3]) subs[3].textContent = `${qtdReceitas} receitas · ${qtdDespesas} despesas`;
}


document.getElementById('filtro-mes').addEventListener('change', e => {
    filtroMes = e.target.value;
    paginaAtual = 1;
    renderizarLista();
    atualizarResumo();
});

document.getElementById('filtro-tipo').addEventListener('change', e => {
    filtroTipo = e.target.value;
    paginaAtual = 1;
    renderizarLista();
    atualizarResumo();
});

document.getElementById('filtro-categoria').addEventListener('change', e => {
    filtroCategoria = e.target.value;
    paginaAtual = 1;
    renderizarLista();
    atualizarResumo();
});

document.getElementById('busca-input').addEventListener('input', e => {
    buscaTexto = e.target.value;
    paginaAtual = 1;
    renderizarLista();
    atualizarResumo();
});

document.getElementById('btn-limpar-filtros').addEventListener('click', () => {
    filtroTipo = '';
    filtroMes = '';
    filtroCategoria = '';
    buscaTexto = '';
    document.getElementById('filtro-mes').value = '';
    document.getElementById('filtro-tipo').value = '';
    document.getElementById('filtro-categoria').value = '';
    document.getElementById('busca-input').value = '';
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.tab-btn[data-tab="todas"]').classList.add('active');
    paginaAtual = 1;
    renderizarLista();
    atualizarResumo();
});

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tab = btn.dataset.tab;
        filtroTipo = tab === 'todas' ? '' : tab === 'receitas' ? 'receita' : 'despesa';
        document.getElementById('filtro-tipo').value = filtroTipo;
        paginaAtual = 1;
        renderizarLista();
        atualizarResumo();
    });
});


function abrirModal() {
    document.getElementById('modal-overlay').classList.add('aberto');
    document.getElementById('nova-data').value = new Date().toISOString().split('T')[0];
}

function fecharModal() {
    document.getElementById('modal-overlay').classList.remove('aberto');
    limparFormulario();
}

function limparFormulario() {
    document.getElementById('nova-descricao').value = '';
    document.getElementById('nova-valor').value = '';
    document.getElementById('nova-data').value = '';
    document.getElementById('nova-categoria').value = '';
    document.getElementById('nova-metodo').value = 'pix';
    document.getElementById('nova-obs').value = '';
}

document.getElementById('btn-nova-transacao').addEventListener('click', abrirModal);
document.getElementById('modal-fechar').addEventListener('click', fecharModal);
document.getElementById('btn-cancelar').addEventListener('click', fecharModal);

document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modal-overlay')) fecharModal();
});

document.querySelectorAll('.modal-tab').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.modal-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        tipoNova = btn.dataset.tipo;
    });
});


document.getElementById('btn-salvar').addEventListener('click', () => {
    const nome = document.getElementById('nova-descricao').value.trim();
    const valor = parseFloat(document.getElementById('nova-valor').value);
    const data = document.getElementById('nova-data').value;
    const categoria = document.getElementById('nova-categoria').value;
    const metodo = document.getElementById('nova-metodo').value;
    const obs = document.getElementById('nova-obs').value.trim();

    if (!nome || !valor || !data || !categoria) {
        alert('Por favor preencha todos os campos obrigatórios.');
        return;
    }

    const metodoLabel = {
        pix: 'PIX', debito: 'Débito', credito: 'Crédito',
        dinheiro: 'Dinheiro', ted: 'TED/DOC'
    };

    transacoes.unshift({
        id: proximoId++,
        nome,
        obs,
        categoria,
        tipo: tipoNova,
        valor,
        data,
        metodo: metodoLabel[metodo] || metodo,
    });

    fecharModal();
    paginaAtual = 1;
    renderizarLista();
    atualizarResumo();
});


function abrirEditar(id) {
    const t = transacoes.find(x => x.id === id);
    if (!t) return;

    tipoNova = t.tipo;
    document.querySelectorAll('.modal-tab').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tipo === t.tipo);
    });

    document.getElementById('nova-descricao').value = t.nome;
    document.getElementById('nova-valor').value = t.valor;
    document.getElementById('nova-data').value = t.data;
    document.getElementById('nova-categoria').value = t.categoria;
    document.getElementById('nova-obs').value = t.obs || '';

    const metodoMap = { 'PIX': 'pix', 'Débito': 'debito', 'Crédito': 'credito', 'Dinheiro': 'dinheiro', 'TED/DOC': 'ted' };
    document.getElementById('nova-metodo').value = metodoMap[t.metodo] || 'pix';

    document.getElementById('modal-overlay').classList.add('aberto');

    const btnSalvar = document.getElementById('btn-salvar');
    btnSalvar.onclick = () => {
        t.nome = document.getElementById('nova-descricao').value.trim();
        t.valor = parseFloat(document.getElementById('nova-valor').value);
        t.data = document.getElementById('nova-data').value;
        t.categoria = document.getElementById('nova-categoria').value;
        t.obs = document.getElementById('nova-obs').value.trim();
        t.tipo = tipoNova;

        const metodoLabel = {
            pix: 'PIX', debito: 'Débito', credito: 'Crédito',
            dinheiro: 'Dinheiro', ted: 'TED/DOC'
        };
        t.metodo = metodoLabel[document.getElementById('nova-metodo').value];

        fecharModal();
        renderizarLista();
        atualizarResumo();

        btnSalvar.onclick = null;
        btnSalvar.addEventListener('click', salvarNova);
    };
}

function salvarNova() {} 


function confirmarExcluir(id) {
    idExcluir = id;
    const t = transacoes.find(x => x.id === id);
    document.getElementById('excluir-nome-transacao').textContent = t ? t.nome : '';
    document.getElementById('modal-excluir').classList.add('aberto');
}

document.getElementById('excluir-fechar').addEventListener('click', () => {
    document.getElementById('modal-excluir').classList.remove('aberto');
    idExcluir = null;
});

document.getElementById('btn-cancelar-excluir').addEventListener('click', () => {
    document.getElementById('modal-excluir').classList.remove('aberto');
    idExcluir = null;
});

document.getElementById('btn-confirmar-excluir').addEventListener('click', () => {
    if (idExcluir !== null) {
        transacoes = transacoes.filter(t => t.id !== idExcluir);
        idExcluir = null;
        document.getElementById('modal-excluir').classList.remove('aberto');
        paginaAtual = 1;
        renderizarLista();
        atualizarResumo();
    }
});


const menuBtn = document.querySelector('.menu-btn');
const aside = document.querySelector('aside');
const closeBtn = document.getElementById('close-btn');

if (menuBtn) {
    menuBtn.addEventListener('click', () => aside.classList.add('aberta'));
}

if (closeBtn) {
    closeBtn.addEventListener('click', () => aside.classList.remove('aberta'));
}

renderizarLista();
atualizarResumo();