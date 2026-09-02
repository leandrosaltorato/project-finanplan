const API_URL = "http://localhost:3000";
const CONTROLE_ID = 1;

let transacoes = [];
let categorias = [];

let paginaAtual = 1;
const porPagina = 8;

let filtroTipo = "";
let filtroMes = "";
let filtroCategoria = "";
let buscaTexto = "";

let tipoNova = "receita";
let idExcluir = null;
let idEditando = null;

const iconeCategoria = {
  ALIMENTACAO: "restaurant",
  LAZER: "sports_esports",
  EDUCACAO: "school",
  TRANSPORTE: "directions_car",
  SAUDE: "favorite",
  OUTROS: "receipt",
  SALARIO: "work",
  FREELANCE: "laptop",
  MORADIA: "home",
  ASSINATURA: "subscriptions",
};

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatarData(data) {
  if (!data) return "";

  const dataObj = new Date(data);

  if (Number.isNaN(dataObj.getTime())) return "";

  const meses = [
    "jan",
    "fev",
    "mar",
    "abr",
    "mai",
    "jun",
    "jul",
    "ago",
    "set",
    "out",
    "nov",
    "dez",
  ];

  return `${String(dataObj.getDate()).padStart(2, "0")} de ${meses[dataObj.getMonth()]}.`;
}

function nomeCategoria(categoria) {
  return String(categoria?.nome || categoria?.tipo || "Outros");
}

function chaveCategoria(categoria) {
  return nomeCategoria(categoria).toUpperCase();
}

function converterTransacao(transacao) {
  return {
    ...transacao,
    nome: transacao.descricao || "",
    tipo: transacao.tipo === "ENTRADA" ? "receita" : "despesa",
    categoriaId: transacao.categoriaId,
    categoria: transacao.categoria || null,
  };
}

async function carregarCategorias() {
  try {
    const resposta = await fetch(`${API_URL}/categoria/listar`);

    if (!resposta.ok) {
      throw new Error("Erro ao buscar categorias");
    }

    categorias = await resposta.json();

    preencherCategorias();
  } catch (error) {
    console.error("Erro ao carregar categorias:", error);
  }
}

function preencherCategorias() {
  const select = document.getElementById("nova-categoria");
  const filtro = document.getElementById("filtro-categoria");

  if (select) {
    select.innerHTML = `<option value="">Selecione uma categoria</option>`;

    categorias.forEach((categoria) => {
      const option = document.createElement("option");
      option.value = categoria.id;
      option.textContent = nomeCategoria(categoria);
      select.appendChild(option);
    });
  }

  if (filtro) {
    filtro.innerHTML = `<option value="">Todas as categorias</option>`;

    categorias.forEach((categoria) => {
      const option = document.createElement("option");
      option.value = categoria.id;
      option.textContent = nomeCategoria(categoria);
      filtro.appendChild(option);
    });
  }
}

async function carregarTransacoes() {
  try {
    const resposta = await fetch(`${API_URL}/transacoes/listar`);

    if (!resposta.ok) {
      throw new Error("Erro ao buscar transações");
    }

    const dados = await resposta.json();

    transacoes = Array.isArray(dados) ? dados.map(converterTransacao) : [];

    paginaAtual = 1;

    renderizarLista();
    atualizarResumo();
  } catch (error) {
    console.error(error);

    const lista = document.getElementById("lista-transacoes");

    if (lista) {
      lista.innerHTML = `
        <div class="lista-vazia">
          <div class="material-icons">error</div>
          <p>Não foi possível carregar as transações.</p>
        </div>
      `;
    }
  }
}

function filtrarTransacoes() {
  const busca = buscaTexto.trim().toLowerCase();

  return transacoes.filter((t) => {
    const data = new Date(t.data);
    const mes = String(data.getMonth() + 1).padStart(2, "0");

    return (
      (filtroMes === "" || mes === filtroMes) &&
      (filtroTipo === "" || t.tipo === filtroTipo) &&
      (filtroCategoria === "" ||
        String(t.categoriaId) === String(filtroCategoria)) &&
      (busca === "" ||
        String(t.nome || "")
          .toLowerCase()
          .includes(busca))
    );
  });
}

function renderizarLista() {
  const lista = document.getElementById("lista-transacoes");

  if (!lista) return;

  const filtradas = filtrarTransacoes();
  const total = filtradas.length;
  const inicio = (paginaAtual - 1) * porPagina;
  const fim = Math.min(inicio + porPagina, total);
  const pagina = filtradas.slice(inicio, fim);

  lista.innerHTML = "";

  if (!pagina.length) {
    lista.innerHTML = `
      <div class="lista-vazia">
        <div class="material-icons">search_off</div>
        <p>Nenhuma transação encontrada.</p>
      </div>
    `;

    const pagInfo = document.getElementById("pag-info");

    if (pagInfo) {
      pagInfo.textContent = "Nenhuma transação";
    }

    atualizarPaginacao(0);
    return;
  }

  pagina.forEach((t) => {
    const categoria = t.categoria || {};
    const icone = iconeCategoria[chaveCategoria(categoria)] || "receipt";

    const row = document.createElement("div");

    row.className = "transacao-row";

    row.innerHTML = `
      <div class="transacao-desc">
        <div class="transacao-icone ${t.tipo}">
          <span class="material-icons">${icone}</span>
        </div>

        <div>
          <div class="transacao-nome">${t.nome}</div>
        </div>
      </div>

      <div>
        <span class="categoria-badge">
          <span class="material-icons" style="font-size:13px">
            ${icone}
          </span>
          ${nomeCategoria(categoria)}
        </span>
      </div>

      <div class="transacao-data">
        ${formatarData(t.data)}
      </div>

      <div>
        <span class="metodo-badge">
          ${t.tipo === "receita" ? "Entrada" : "Saída"}
        </span>
      </div>

      <div class="transacao-valor ${t.tipo}">
        ${t.tipo === "receita" ? "+" : "-"}
        ${formatarMoeda(t.valor)}
      </div>

      <div class="transacao-acoes">
        <button
          type="button"
          class="acao-btn editar"
          title="Editar"
          onclick="abrirEditar(${t.id})"
        >
          <span class="material-icons">edit</span>
        </button>

        <button
          type="button"
          class="acao-btn excluir"
          title="Excluir"
          onclick="confirmarExcluir(${t.id})"
        >
          <span class="material-icons">delete</span>
        </button>
      </div>
    `;

    lista.appendChild(row);
  });

  const pagInfo = document.getElementById("pag-info");

  if (pagInfo) {
    pagInfo.textContent = `Mostrando ${inicio + 1}–${fim} de ${total}`;
  }

  atualizarPaginacao(total);
}

function atualizarPaginacao(total) {
  const totalPaginas = Math.ceil(total / porPagina);

  ["pag-1", "pag-2", "pag-3"].forEach((id) => {
    const btn = document.getElementById(id);

    if (!btn) return;

    const numero = Number(id.split("-")[1]);

    btn.style.display = numero <= totalPaginas ? "flex" : "none";
    btn.classList.toggle("active", numero === paginaAtual);
    btn.textContent = numero;
  });

  const anterior = document.getElementById("pag-anterior");
  const proximo = document.getElementById("pag-proximo");

  if (anterior) {
    anterior.disabled = paginaAtual <= 1;
  }

  if (proximo) {
    proximo.disabled = totalPaginas === 0 || paginaAtual >= totalPaginas;
  }
}

document.getElementById("pag-anterior")?.addEventListener("click", () => {
  if (paginaAtual > 1) {
    paginaAtual--;
    renderizarLista();
  }
});

document.getElementById("pag-proximo")?.addEventListener("click", () => {
  const totalPaginas = Math.ceil(filtrarTransacoes().length / porPagina);

  if (paginaAtual < totalPaginas) {
    paginaAtual++;
    renderizarLista();
  }
});

["pag-1", "pag-2", "pag-3"].forEach((id) => {
  document.getElementById(id)?.addEventListener("click", (e) => {
    paginaAtual = Number(e.target.textContent);
    renderizarLista();
  });
});

function atualizarResumo() {
  const filtradas = filtrarTransacoes();

  const receitas = filtradas
    .filter((t) => t.tipo === "receita")
    .reduce((total, t) => total + Number(t.valor || 0), 0);

  const despesas = filtradas
    .filter((t) => t.tipo === "despesa")
    .reduce((total, t) => total + Number(t.valor || 0), 0);

  const qtdReceitas = filtradas.filter((t) => t.tipo === "receita").length;

  const qtdDespesas = filtradas.filter((t) => t.tipo === "despesa").length;

  const cards = document.querySelectorAll(".resumo-valor");
  const subs = document.querySelectorAll(".resumo-sub");

  if (cards[0]) cards[0].textContent = formatarMoeda(receitas);
  if (cards[1]) cards[1].textContent = formatarMoeda(despesas);
  if (cards[2]) cards[2].textContent = formatarMoeda(receitas - despesas);
  if (cards[3]) cards[3].textContent = filtradas.length;

  if (subs[1]) {
    subs[1].textContent =
      receitas > 0
        ? `${Math.round((despesas / receitas) * 100)}% da receita`
        : "0% da receita";
  }

  if (subs[3]) {
    subs[3].textContent = `${qtdReceitas} receitas · ${qtdDespesas} despesas`;
  }
}

document.getElementById("filtro-mes")?.addEventListener("change", (e) => {
  filtroMes = e.target.value;
  paginaAtual = 1;
  renderizarLista();
  atualizarResumo();
});

document.getElementById("filtro-tipo")?.addEventListener("change", (e) => {
  filtroTipo = e.target.value;
  paginaAtual = 1;
  renderizarLista();
  atualizarResumo();
});

document.getElementById("filtro-categoria")?.addEventListener("change", (e) => {
  filtroCategoria = e.target.value;
  paginaAtual = 1;
  renderizarLista();
  atualizarResumo();
});

document.getElementById("busca-input")?.addEventListener("input", (e) => {
  buscaTexto = e.target.value;
  paginaAtual = 1;
  renderizarLista();
  atualizarResumo();
});

document.getElementById("btn-limpar-filtros")?.addEventListener("click", () => {
  filtroTipo = "";
  filtroMes = "";
  filtroCategoria = "";
  buscaTexto = "";
  paginaAtual = 1;

  document.getElementById("filtro-mes").value = "";
  document.getElementById("filtro-tipo").value = "";
  document.getElementById("filtro-categoria").value = "";
  document.getElementById("busca-input").value = "";

  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  document.querySelector('.tab-btn[data-tab="todas"]')?.classList.add("active");

  renderizarLista();
  atualizarResumo();
});

document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach((b) => {
      b.classList.remove("active");
    });

    btn.classList.add("active");

    const tab = btn.dataset.tab;

    filtroTipo =
      tab === "todas" ? "" : tab === "receitas" ? "receita" : "despesa";

    document.getElementById("filtro-tipo").value = filtroTipo;

    paginaAtual = 1;
    renderizarLista();
    atualizarResumo();
  });
});

function abrirModal() {
  idEditando = null;

  document.querySelector("#modal-overlay h2").textContent = "Nova Transação";

  document.getElementById("btn-salvar").innerHTML = `
    <span class="material-icons">check</span>
    Salvar Transação
  `;

  document.getElementById("modal-overlay").classList.add("aberto");

  document.getElementById("nova-data").value = new Date()
    .toISOString()
    .split("T")[0];
}

function fecharModal() {
  document.getElementById("modal-overlay").classList.remove("aberto");
  idEditando = null;
  limparFormulario();
}

function limparFormulario() {
  document.getElementById("nova-descricao").value = "";
  document.getElementById("nova-valor").value = "";
  document.getElementById("nova-data").value = "";
  document.getElementById("nova-categoria").value = "";

  tipoNova = "receita";

  document.querySelectorAll(".modal-tab").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tipo === "receita");
  });
}

document
  .getElementById("btn-nova-transacao")
  ?.addEventListener("click", abrirModal);

document.getElementById("modal-fechar")?.addEventListener("click", fecharModal);

document.getElementById("btn-cancelar")?.addEventListener("click", fecharModal);

document.getElementById("modal-overlay")?.addEventListener("click", (e) => {
  if (e.target.id === "modal-overlay") {
    fecharModal();
  }
});

document.querySelectorAll(".modal-tab").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".modal-tab").forEach((b) => {
      b.classList.remove("active");
    });

    btn.classList.add("active");
    tipoNova = btn.dataset.tipo;
  });
});

document
  .getElementById("btn-salvar")
  ?.addEventListener("click", salvarTransacao);

async function salvarTransacao() {
  const descricao = document.getElementById("nova-descricao").value.trim();

  const valor = Number(document.getElementById("nova-valor").value);

  const data = document.getElementById("nova-data").value;

  const categoriaId = Number(document.getElementById("nova-categoria").value);

  if (!descricao || !valor || !data || !categoriaId) {
    alert("Preencha todos os campos obrigatórios.");
    return;
  }

  const dados = {
    descricao,
    valor,
    tipo: tipoNova === "receita" ? "ENTRADA" : "SAIDA",
    categoriaId,
    controleId: CONTROLE_ID,
  };

  try {
    const url =
      idEditando !== null
        ? `${API_URL}/transacoes/atualizar/${idEditando}`
        : `${API_URL}/transacoes/cadastrar`;

    const resposta = await fetch(url, {
      method: idEditando !== null ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dados),
    });

    const texto = await resposta.text();

    let resultado = {};

    try {
      resultado = JSON.parse(texto);
    } catch {}

    if (!resposta.ok) {
      throw new Error(
        resultado.erro || resultado.detalhes || "Erro ao salvar transação",
      );
    }

    fecharModal();
    await carregarTransacoes();
  } catch (error) {
    console.error("Erro ao salvar:", error);
    alert("Erro ao salvar transação: " + error.message);
  }
}

function abrirEditar(id) {
  const transacao = transacoes.find((t) => Number(t.id) === Number(id));

  if (!transacao) return;

  idEditando = Number(id);
  tipoNova = transacao.tipo;

  document.querySelectorAll(".modal-tab").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tipo === transacao.tipo);
  });

  document.getElementById("nova-descricao").value = transacao.nome || "";

  document.getElementById("nova-valor").value = transacao.valor || "";

  document.getElementById("nova-data").value = transacao.data
    ? new Date(transacao.data).toISOString().split("T")[0]
    : "";

  document.getElementById("nova-categoria").value = transacao.categoriaId || "";

  document.querySelector("#modal-overlay h2").textContent = "Editar Transação";

  document.getElementById("btn-salvar").innerHTML = `
    <span class="material-icons">check</span>
    Salvar Alterações
  `;

  document.getElementById("modal-overlay").classList.add("aberto");
}

function confirmarExcluir(id) {
  idExcluir = Number(id);

  const transacao = transacoes.find((t) => Number(t.id) === Number(id));

  document.getElementById("excluir-nome-transacao").textContent =
    transacao?.nome || "";

  document.getElementById("modal-excluir").classList.add("aberto");
}

function fecharExcluir() {
  document.getElementById("modal-excluir").classList.remove("aberto");
  idExcluir = null;
}

document
  .getElementById("excluir-fechar")
  ?.addEventListener("click", fecharExcluir);

document
  .getElementById("btn-cancelar-excluir")
  ?.addEventListener("click", fecharExcluir);

document
  .getElementById("btn-confirmar-excluir")
  ?.addEventListener("click", async () => {
    if (idExcluir === null) return;

    try {
      const resposta = await fetch(
        `${API_URL}/transacoes/excluir/${idExcluir}`,
        {
          method: "DELETE",
        },
      );

      const texto = await resposta.text();

      let resultado = {};

      try {
        resultado = JSON.parse(texto);
      } catch {}

      if (!resposta.ok) {
        throw new Error(
          resultado.erro || resultado.detalhes || "Erro ao excluir",
        );
      }

      fecharExcluir();
      await carregarTransacoes();
    } catch (error) {
      console.error(error);
      alert("Erro ao excluir: " + error.message);
    }
  });

const menuBtn = document.querySelector(".menu-btn");
const aside = document.querySelector("aside");
const closeBtn = document.getElementById("close-btn");

menuBtn?.addEventListener("click", () => {
  aside?.classList.add("aberta");
});

closeBtn?.addEventListener("click", () => {
  aside?.classList.remove("aberta");
});

async function iniciar() {
  await carregarCategorias();
  await carregarTransacoes();
}

iniciar();
