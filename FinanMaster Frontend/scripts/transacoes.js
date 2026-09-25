const API_URL = "http://localhost:3000";

document.addEventListener("DOMContentLoaded", () => {
  iniciarPagina();
});

let transacoes = [];
let paginaAtual = 1;
let transacaoParaExcluir = null;
let tipoAtual = "ENTRADA";

const itensPorPagina = 10;

let categoriasCarregadas = [];

const nomesMetodos = {
  pix: "PIX",
  debito: "Débito",
  credito: "Crédito",
  dinheiro: "Dinheiro",
  ted: "TED/DOC",
};

function iniciarPagina() {
  const usuarioId = localStorage.getItem("usuarioId");

  if (!usuarioId) {
    window.location.href = "index.html";
    return;
  }

  configurarSidebar();
  configurarEventos();
  carregarCategorias();
  carregarTransacoes();
}

function configurarSidebar() {
  const pagina = location.pathname.split("/").pop();

  document.querySelectorAll(".sidebar a").forEach((link) => {
    const href = link.getAttribute("href");

    if (href === pagina) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  const nomeUsuario = localStorage.getItem("nomeUsuario");
  const fotoPerfil = localStorage.getItem("fotoPerfil");
  const tipoLogin = localStorage.getItem("tipoLogin");

  const nomeElemento = document.getElementById("nome-usuario");
  const fotoElemento = document.getElementById("foto-perfil");
  const containerFoto = document.querySelector(".profile-photo");

  if (nomeElemento) {
    nomeElemento.textContent = nomeUsuario || "Usuário";
  }

  if (containerFoto && fotoElemento) {
    if (tipoLogin === "google" && fotoPerfil) {
      fotoElemento.src = fotoPerfil;
      containerFoto.style.display = "block";
    } else {
      fotoElemento.removeAttribute("src");
      containerFoto.style.display = "none";
    }
  }
}

function configurarEventos() {
  const btnNova = document.getElementById("btn-nova-transacao");
  const btnFecharModal = document.getElementById("modal-fechar");
  const btnCancelar = document.getElementById("btn-cancelar");

  const btnFecharExcluir = document.getElementById("excluir-fechar");
  const btnCancelarExcluir = document.getElementById("btn-cancelar-excluir");
  const btnConfirmarExcluir = document.getElementById("btn-confirmar-excluir");

  const btnSalvar = document.getElementById("btn-salvar");

  const modal = document.getElementById("modal-overlay");
  const modalExcluir = document.getElementById("modal-excluir");

  const filtroMes = document.getElementById("filtro-mes");
  const filtroTipo = document.getElementById("filtro-tipo");
  const filtroCategoria = document.getElementById("filtro-categoria");
  const buscaInput = document.getElementById("busca-input");
  const btnLimparFiltros = document.getElementById("btn-limpar-filtros");

  if (btnNova) {
    btnNova.addEventListener("click", abrirModal);
  }

  if (btnFecharModal) {
    btnFecharModal.addEventListener("click", fecharModal);
  }

  if (btnCancelar) {
    btnCancelar.addEventListener("click", fecharModal);
  }

  if (btnSalvar) {
    btnSalvar.addEventListener("click", salvarNovaTransacao);
  }

  if (btnFecharExcluir) {
    btnFecharExcluir.addEventListener("click", fecharModalExcluir);
  }

  if (btnCancelarExcluir) {
    btnCancelarExcluir.addEventListener("click", fecharModalExcluir);
  }

  if (btnConfirmarExcluir) {
    btnConfirmarExcluir.addEventListener("click", excluirTransacao);
  }

  if (modal) {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        fecharModal();
      }
    });
  }

  if (modalExcluir) {
    modalExcluir.addEventListener("click", (event) => {
      if (event.target === modalExcluir) {
        fecharModalExcluir();
      }
    });
  }

  document.querySelectorAll(".modal-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      tipoAtual = tab.dataset.tipo === "despesa" ? "SAIDA" : "ENTRADA";

      document.querySelectorAll(".modal-tab").forEach((item) => {
        item.classList.toggle("active", item === tab);
      });

      atualizarCategorias();
    });
  });

  document.querySelectorAll(".tab-btn").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach((item) => {
        item.classList.remove("active");
      });

      tab.classList.add("active");

      paginaAtual = 1;

      renderizarTransacoes();
    });
  });

  [filtroMes, filtroTipo, filtroCategoria].forEach((filtro) => {
    if (!filtro) return;

    filtro.addEventListener("change", () => {
      paginaAtual = 1;
      atualizarResumo();
      renderizarTransacoes();
    });
  });

  if (buscaInput) {
    buscaInput.addEventListener("input", () => {
      paginaAtual = 1;
      renderizarTransacoes();
    });
  }

  if (btnLimparFiltros) {
    btnLimparFiltros.addEventListener("click", limparFiltros);
  }

  const lista = document.getElementById("lista-transacoes");

  if (lista) {
    lista.addEventListener("click", (event) => {
      const botaoExcluir = event.target.closest(".acao-btn.excluir");

      if (!botaoExcluir) return;

      const id = botaoExcluir.dataset.id;

      const transacao = transacoes.find(
        (item) => String(item.id) === String(id),
      );

      if (transacao) {
        abrirModalExcluir(transacao);
      }
    });
  }

  const pagAnterior = document.getElementById("pag-anterior");
  const pagProximo = document.getElementById("pag-proximo");

  if (pagAnterior) {
    pagAnterior.addEventListener("click", () => {
      if (paginaAtual <= 1) return;

      paginaAtual--;
      renderizarTransacoes();
    });
  }

  if (pagProximo) {
    pagProximo.addEventListener("click", () => {
      const total = obterTransacoesFiltradas().length;
      const totalPaginas = Math.max(1, Math.ceil(total / itensPorPagina));

      if (paginaAtual >= totalPaginas) return;

      paginaAtual++;
      renderizarTransacoes();
    });
  }

  for (let i = 1; i <= 3; i++) {
    const botao = document.getElementById(`pag-${i}`);

    if (!botao) continue;

    botao.addEventListener("click", () => {
      const total = obterTransacoesFiltradas().length;
      const totalPaginas = Math.max(1, Math.ceil(total / itensPorPagina));

      if (i > totalPaginas) return;

      paginaAtual = i;
      renderizarTransacoes();
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    fecharModal();
    fecharModalExcluir();
  });
}

async function carregarTransacoes() {
  try {
    const controleId = localStorage.getItem("controleId");

    if (!controleId) {
      alert("Controle financeiro não encontrado. Faça login novamente.");
      window.location.href = "index.html";
      return;
    }

    const response = await fetch(
      `${API_URL}/transacoes/listar?controleId=${controleId}`,
    );

    const resultado = await response.json();

    if (!response.ok) {
      throw new Error(
        resultado.detalhes ||
          resultado.erro ||
          `Erro na API: ${response.status}`,
      );
    }

    transacoes = Array.isArray(resultado)
      ? resultado
      : resultado.transacoes || [];

    transacoes = transacoes.map(normalizarTransacao);

    atualizarResumo();
    renderizarTransacoes();
  } catch (error) {
    console.error("Erro ao carregar transações:", error);

    transacoes = [];

    atualizarResumo();
    renderizarTransacoes();

    alert("Não foi possível carregar as transações.");
  }
}

function normalizarTransacao(transacao) {
  return {
    ...transacao,

    tipo: String(transacao.tipo || "").toUpperCase(),

    valor: Number(transacao.valor || 0),

    categoria:
      typeof transacao.categoria === "object"
        ? transacao.categoria
        : {
            nome: transacao.categoria || "Sem categoria",
          },
  };
}

async function carregarCategorias() {
  try {
    const response = await fetch(`${API_URL}/categoria/listar`);

    const resultado = await response.json();

    if (!response.ok) {
      throw new Error(
        resultado.detalhes ||
          resultado.erro ||
          `Erro na API: ${response.status}`,
      );
    }

    const categorias = Array.isArray(resultado)
      ? resultado
      : resultado.categorias || [];

    categoriasCarregadas = categorias;

    preencherFiltroCategorias(categorias);
    atualizarCategorias();
  } catch (error) {
    console.error("Erro ao carregar categorias:", error);

    categoriasCarregadas = [];

    preencherFiltroCategorias([]);
    atualizarCategorias();
  }
}

function preencherFiltroCategorias(categorias) {
  const select = document.getElementById("filtro-categoria");

  if (!select) return;

  const valorAtual = select.value;

  select.innerHTML = `
    <option value="">Todas as categorias</option>
  `;

  categorias.forEach((categoria) => {
    const option = document.createElement("option");

    option.value = categoria.id;
    option.textContent = categoria.nome;

    select.appendChild(option);
  });

  if ([...select.options].some((option) => option.value === valorAtual)) {
    select.value = valorAtual;
  }
}

function atualizarCategorias() {
  const select = document.getElementById("nova-categoria");

  if (!select) return;

  const valorAtual = select.value;

  select.innerHTML = `
    <option value="">Selecione uma categoria</option>
  `;

  categoriasCarregadas.forEach((categoria) => {
    const option = document.createElement("option");

    option.value = categoria.id;
    option.textContent = categoria.nome;

    select.appendChild(option);
  });

  if ([...select.options].some((option) => option.value === valorAtual)) {
    select.value = valorAtual;
  }
}

async function salvarNovaTransacao() {
  const descricao = document.getElementById("nova-descricao")?.value.trim();

  const valor = Number(document.getElementById("nova-valor")?.value);

  const data = document.getElementById("nova-data")?.value;

  const categoriaId = Number(document.getElementById("nova-categoria")?.value);

  const metodo = document.getElementById("nova-metodo")?.value || null;

  const observacao = document.getElementById("nova-obs")?.value.trim() || null;

  const controleId = Number(localStorage.getItem("controleId"));

  if (!controleId) {
    alert("Controle financeiro não encontrado. Faça login novamente.");
    return;
  }

  if (!descricao) {
    alert("Digite a descrição da transação.");
    return;
  }

  if (!valor || valor <= 0) {
    alert("Digite um valor válido.");
    return;
  }

  if (!data) {
    alert("Selecione a data da transação.");
    return;
  }

  if (!categoriaId) {
    alert("Selecione uma categoria.");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/transacoes/cadastrar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        descricao,
        valor,
        data,
        tipo: tipoAtual,
        categoriaId,
        controleId,
        metodo,
        observacao,
      }),
    });

    const resultado = await response.json();

    if (!response.ok) {
      alert(
        resultado.detalhes || resultado.erro || "Erro ao cadastrar transação.",
      );
      return;
    }

    fecharModal();

    limparFormulario();

    await carregarTransacoes();

    alert("Transação cadastrada com sucesso!");
  } catch (error) {
    console.error("Erro ao cadastrar transação:", error);
    alert("Não foi possível conectar ao servidor.");
  }
}

async function excluirTransacao() {
  if (!transacaoParaExcluir) return;

  try {
    const response = await fetch(
      `${API_URL}/transacoes/excluir/${transacaoParaExcluir.id}`,
      {
        method: "DELETE",
      },
    );

    const resultado = await response.json();

    if (!response.ok) {
      alert(
        resultado.detalhes || resultado.erro || "Erro ao excluir transação.",
      );
      return;
    }

    fecharModalExcluir();

    await carregarTransacoes();

    alert("Transação excluída com sucesso!");
  } catch (error) {
    console.error("Erro ao excluir transação:", error);
    alert("Não foi possível conectar ao servidor.");
  }
}

function obterTransacoesFiltradas() {
  const filtroMes = document.getElementById("filtro-mes");
  const filtroTipo = document.getElementById("filtro-tipo");
  const filtroCategoria = document.getElementById("filtro-categoria");
  const buscaInput = document.getElementById("busca-input");

  const mes = filtroMes?.value || "";
  const tipo = filtroTipo?.value || "";
  const categoria = filtroCategoria?.value || "";
  const busca = buscaInput?.value.trim().toLowerCase() || "";

  const tabAtiva =
    document.querySelector(".tab-btn.active")?.dataset.tab || "todas";

  return transacoes
    .filter((transacao) => {
      if (mes) {
        if (!transacao.data) {
          return false;
        }

        const data = new Date(transacao.data);

        if (Number.isNaN(data.getTime())) {
          return false;
        }

        const mesTransacao = String(data.getMonth() + 1).padStart(2, "0");

        if (mesTransacao !== String(mes).padStart(2, "0")) {
          return false;
        }
      }

      if (tipo && transacao.tipo !== tipo) {
        return false;
      }

      if (categoria) {
        const categoriaTransacao =
          transacao.categoria?.id || transacao.categoriaId || "";

        if (String(categoriaTransacao) !== String(categoria)) {
          return false;
        }
      }

      if (tabAtiva === "receitas" && transacao.tipo !== "ENTRADA") {
        return false;
      }

      if (tabAtiva === "despesas" && transacao.tipo !== "SAIDA") {
        return false;
      }

      if (busca) {
        const texto = `
          ${transacao.descricao || ""}
          ${transacao.categoria?.nome || ""}
          ${transacao.metodo || ""}
          ${transacao.observacao || ""}
        `.toLowerCase();

        if (!texto.includes(busca)) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      return new Date(b.data).getTime() - new Date(a.data).getTime();
    });
}

function renderizarTransacoes() {
  const lista = document.getElementById("lista-transacoes");
  const pagInfo = document.getElementById("pag-info");

  if (!lista) return;

  const filtradas = obterTransacoesFiltradas();

  const totalPaginas = Math.max(
    1,
    Math.ceil(filtradas.length / itensPorPagina),
  );

  if (paginaAtual > totalPaginas) {
    paginaAtual = totalPaginas;
  }

  const inicio = (paginaAtual - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;

  const pagina = filtradas.slice(inicio, fim);

  lista.innerHTML = "";

  if (pagina.length === 0) {
    lista.innerHTML = `
      <div class="lista-vazia">
        <span class="material-icons">receipt_long</span>
        <p>Nenhuma transação encontrada.</p>
      </div>
    `;

    if (pagInfo) {
      pagInfo.textContent = "Nenhuma transação";
    }

    atualizarPaginacao(0);

    return;
  }

  pagina.forEach((transacao) => {
    const entrada = transacao.tipo === "ENTRADA";

    const categoria =
      transacao.categoria?.nome || transacao.categoriaNome || "Sem categoria";

    const row = document.createElement("div");

    row.className = "transacao-row";

    row.innerHTML = `
      <div class="transacao-desc">
        <div class="transacao-icone ${entrada ? "receita" : "despesa"}">
          <span class="material-icons">
            ${entrada ? "arrow_upward" : "arrow_downward"}
          </span>
        </div>

        <div>
          <div class="transacao-nome">
            ${escaparHTML(transacao.descricao)}
          </div>
        </div>
      </div>

      <div>
        <span class="categoria-badge">
          ${escaparHTML(categoria)}
        </span>
      </div>

      <div class="transacao-data">
        ${formatarData(transacao.data)}
      </div>

      <div>
        <span class="metodo-badge">
          ${escaparHTML(
            nomesMetodos[transacao.metodo] || transacao.metodo || "-",
          )}
        </span>
      </div>

      <div class="transacao-valor ${entrada ? "receita" : "despesa"}">
        ${entrada ? "+" : "-"} ${formatarMoeda(transacao.valor)}
      </div>

      <div class="transacao-acoes">
        <button
          class="acao-btn excluir"
          type="button"
          data-id="${transacao.id}"
          title="Excluir"
        >
          <span class="material-icons">delete</span>
        </button>
      </div>
    `;

    lista.appendChild(row);
  });

  const primeiro = inicio + 1;
  const ultimo = Math.min(fim, filtradas.length);

  if (pagInfo) {
    pagInfo.textContent = `Mostrando ${primeiro}-${ultimo} de ${filtradas.length}`;
  }

  atualizarPaginacao(totalPaginas);
}

function atualizarPaginacao(totalPaginas) {
  const pagAnterior = document.getElementById("pag-anterior");
  const pagProximo = document.getElementById("pag-proximo");

  if (pagAnterior) {
    pagAnterior.disabled = paginaAtual <= 1;
  }

  if (pagProximo) {
    pagProximo.disabled = paginaAtual >= totalPaginas;
  }

  for (let i = 1; i <= 3; i++) {
    const botao = document.getElementById(`pag-${i}`);

    if (!botao) continue;

    botao.style.display = i <= totalPaginas ? "flex" : "none";

    botao.classList.toggle("active", i === paginaAtual);

    botao.disabled = i > totalPaginas;
  }
}

function atualizarResumo() {
  const filtroMes = document.getElementById("filtro-mes");
  const mesSelecionado = filtroMes?.value || "";

  let dados = transacoes;

  if (mesSelecionado) {
    dados = dados.filter((transacao) => {
      if (!transacao.data) {
        return false;
      }

      const data = new Date(transacao.data);

      if (Number.isNaN(data.getTime())) {
        return false;
      }

      const mes = String(data.getMonth() + 1).padStart(2, "0");

      return mes === String(mesSelecionado).padStart(2, "0");
    });
  }

  const receitas = dados.filter((transacao) => transacao.tipo === "ENTRADA");

  const despesas = dados.filter((transacao) => transacao.tipo === "SAIDA");

  const valorReceitas = receitas.reduce(
    (total, transacao) => total + Number(transacao.valor || 0),
    0,
  );

  const valorDespesas = despesas.reduce(
    (total, transacao) => total + Number(transacao.valor || 0),
    0,
  );

  const saldo = valorReceitas - valorDespesas;

  atualizarElemento("total-receitas", formatarMoeda(valorReceitas));

  atualizarElemento("total-despesas", formatarMoeda(valorDespesas));

  atualizarElemento("saldo-mes", formatarMoeda(saldo));

  atualizarElemento("total-transacoes", dados.length);

  const subReceitas = document.getElementById("sub-receitas");
  const subDespesas = document.getElementById("sub-despesas");
  const subTransacoes = document.getElementById("sub-transacoes");

  if (subReceitas) {
    subReceitas.textContent = `${receitas.length} ${
      receitas.length === 1 ? "receita" : "receitas"
    }`;
  }

  if (subDespesas) {
    const percentual =
      valorReceitas > 0 ? (valorDespesas / valorReceitas) * 100 : 0;

    subDespesas.textContent = `${percentual.toFixed(0)}% da receita`;
  }

  if (subTransacoes) {
    subTransacoes.textContent = `${receitas.length} receitas · ${despesas.length} despesas`;
  }
}

function abrirModal() {
  const modal = document.getElementById("modal-overlay");

  if (!modal) return;

  limparFormulario();

  tipoAtual = "ENTRADA";

  document.querySelectorAll(".modal-tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.tipo === "receita");
  });

  const inputData = document.getElementById("nova-data");

  if (inputData) {
    const hoje = new Date();

    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(hoje.getDate()).padStart(2, "0");

    inputData.value = `${ano}-${mes}-${dia}`;
  }

  modal.classList.add("aberto");

  atualizarCategorias();

  const inputDescricao = document.getElementById("nova-descricao");

  if (inputDescricao) {
    setTimeout(() => inputDescricao.focus(), 100);
  }
}

function fecharModal() {
  const modal = document.getElementById("modal-overlay");

  if (modal) {
    modal.classList.remove("aberto");
  }
}

function abrirModalExcluir(transacao) {
  transacaoParaExcluir = transacao;

  const nome = document.getElementById("excluir-nome-transacao");

  if (nome) {
    nome.textContent = transacao.descricao || "";
  }

  const modal = document.getElementById("modal-excluir");

  if (modal) {
    modal.classList.add("aberto");
  }
}

function fecharModalExcluir() {
  const modal = document.getElementById("modal-excluir");

  if (modal) {
    modal.classList.remove("aberto");
  }

  transacaoParaExcluir = null;
}

function limparFormulario() {
  const campos = ["nova-descricao", "nova-valor", "nova-data", "nova-obs"];

  campos.forEach((id) => {
    const elemento = document.getElementById(id);

    if (elemento) {
      elemento.value = "";
    }
  });

  const metodo = document.getElementById("nova-metodo");

  if (metodo) {
    metodo.value = "";
  }
}

function limparFiltros() {
  const filtroMes = document.getElementById("filtro-mes");
  const filtroTipo = document.getElementById("filtro-tipo");
  const filtroCategoria = document.getElementById("filtro-categoria");
  const buscaInput = document.getElementById("busca-input");

  if (filtroMes) filtroMes.value = "";
  if (filtroTipo) filtroTipo.value = "";
  if (filtroCategoria) filtroCategoria.value = "";
  if (buscaInput) buscaInput.value = "";

  document.querySelectorAll(".tab-btn").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.tab === "todas");
  });

  paginaAtual = 1;

  atualizarResumo();
  renderizarTransacoes();
}

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatarData(data) {
  if (!data) {
    return "-";
  }

  const valor = String(data);

  if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    const [ano, mes, dia] = valor.split("-");

    return `${dia}/${mes}/${ano}`;
  }

  const dataObj = new Date(data);

  if (Number.isNaN(dataObj.getTime())) {
    return valor;
  }

  return dataObj.toLocaleDateString("pt-BR");
}

function atualizarElemento(id, valor) {
  const elemento = document.getElementById(id);

  if (elemento) {
    elemento.textContent = valor;
  }
}

function escaparHTML(texto) {
  if (texto === null || texto === undefined) {
    return "";
  }

  return String(texto)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
