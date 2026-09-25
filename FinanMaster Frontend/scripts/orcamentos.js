const API_URL = "http://localhost:3000";

document.addEventListener("DOMContentLoaded", () => {
  iniciarPagina();
});

let categorias = [];
let orcamentos = [];
let grafico = null;

const PALETA_CORES = [
  "#1aaf6c",
  "#eab507",
  "#3b82f6",
  "#ef4444",
  "#a855f7",
  "#f97316",
  "#14b8a6",
  "#ec4899",
  "#6366f1",
  "#84cc16",
];

function obterCorCategoria(categoriaId) {
  const hash = hashTexto(String(categoriaId));

  return PALETA_CORES[hash % PALETA_CORES.length];
}

function hashTexto(texto) {
  let hash = 0;

  for (let i = 0; i < texto.length; i++) {
    hash = (hash << 5) - hash + texto.charCodeAt(i);
    hash |= 0;
  }

  return Math.abs(hash);
}

function iniciarPagina() {
  const usuarioId = localStorage.getItem("usuarioId");

  if (!usuarioId) {
    window.location.href = "index.html";
    return;
  }

  configurarEventos();
  carregarCategorias();
  carregarOrcamentos();
}

function configurarEventos() {
  const btnNovo = document.getElementById("btn-novo-orcamento");
  const btnFechar = document.getElementById("modal-orcamento-fechar");
  const btnCancelar = document.getElementById("btn-cancelar-orcamento");
  const modal = document.getElementById("modal-orcamento");
  const form = document.getElementById("form-orcamento");
  const lista = document.getElementById("orcamentos-lista");

  if (btnNovo) {
    btnNovo.addEventListener("click", abrirModal);
  }

  if (btnFechar) {
    btnFechar.addEventListener("click", fecharModal);
  }

  if (btnCancelar) {
    btnCancelar.addEventListener("click", fecharModal);
  }

  if (modal) {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        fecharModal();
      }
    });
  }

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      salvarOrcamento();
    });
  }

  if (lista) {
    lista.addEventListener("click", (event) => {
      const botaoExcluir = event.target.closest(".orcamento-excluir");

      if (!botaoExcluir) return;

      excluirOrcamento(botaoExcluir.dataset.id);
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      fecharModal();
    }
  });
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

    categorias = Array.isArray(resultado)
      ? resultado
      : resultado.categorias || [];

    preencherSelectCategorias();
  } catch (error) {
    console.error("Erro ao carregar categorias:", error);

    categorias = [];
  }
}

function preencherSelectCategorias() {
  const select = document.getElementById("orcamento-categoria");

  if (!select) return;

  const categoriasComOrcamento = new Set(
    orcamentos.map((orcamento) => orcamento.categoriaId),
  );

  select.innerHTML = `
    <option value="">Selecione uma categoria</option>
  `;

  categorias
    .filter((categoria) => !categoriasComOrcamento.has(categoria.id))
    .forEach((categoria) => {
      const option = document.createElement("option");

      option.value = categoria.id;
      option.textContent = categoria.nome;

      select.appendChild(option);
    });
}

async function carregarOrcamentos() {
  try {
    const controleId = localStorage.getItem("controleId");

    if (!controleId) {
      alert("Controle financeiro não encontrado. Faça login novamente.");
      window.location.href = "index.html";
      return;
    }

    const response = await fetch(
      `${API_URL}/orcamentos/listar?controleId=${controleId}`,
    );

    const resultado = await response.json();

    if (!response.ok) {
      throw new Error(
        resultado.detalhes ||
          resultado.erro ||
          `Erro na API: ${response.status}`,
      );
    }

    orcamentos = Array.isArray(resultado)
      ? resultado
      : resultado.orcamentos || [];

    preencherSelectCategorias();
    atualizarResumo();
    renderizarLista();
    renderizarGrafico();
  } catch (error) {
    console.error("Erro ao carregar orçamentos:", error);

    orcamentos = [];

    atualizarResumo();
    renderizarLista();
    renderizarGrafico();

    alert("Não foi possível carregar os orçamentos.");
  }
}

function atualizarResumo() {
  const total = orcamentos.reduce(
    (soma, orcamento) => soma + Number(orcamento.limite || 0),
    0,
  );

  const gasto = orcamentos.reduce(
    (soma, orcamento) => soma + Number(orcamento.gasto || 0),
    0,
  );

  const restante = total - gasto;

  atualizarElemento("orcamento-total", formatarMoeda(total));
  atualizarElemento("orcamento-gasto", formatarMoeda(gasto));
  atualizarElemento("orcamento-restante", formatarMoeda(restante));
}

function renderizarLista() {
  const lista = document.getElementById("orcamentos-lista");

  if (!lista) return;

  lista.innerHTML = "";

  if (orcamentos.length === 0) {
    lista.innerHTML = `
      <div class="orcamentos-vazio">
        Nenhum orçamento cadastrado ainda.
      </div>
    `;

    return;
  }

  orcamentos.forEach((orcamento) => {
    const limite = Number(orcamento.limite || 0);
    const gasto = Number(orcamento.gasto || 0);
    const percentual = limite > 0 ? Math.min((gasto / limite) * 100, 100) : 0;

    let classeBarra = "";

    if (gasto > limite) {
      classeBarra = "excedido";
    } else if (percentual >= 80) {
      classeBarra = "alerta";
    }

    const card = document.createElement("div");

    card.className = "orcamento-card";

    card.innerHTML = `
      <div class="orcamento-topo">
        <span
          class="orcamento-cor"
          style="background:${obterCorCategoria(orcamento.categoriaId)}"
        ></span>

        <span class="orcamento-nome">
          ${escaparHTML(orcamento.categoria?.nome || "Categoria")}
        </span>

        <button
          class="orcamento-excluir"
          type="button"
          data-id="${orcamento.id}"
          title="Excluir"
        >
          <span class="material-icons">delete</span>
        </button>
      </div>

      <div class="orcamento-valores">
        <span>${formatarMoeda(gasto)} gastos</span>
        <strong>de ${formatarMoeda(limite)}</strong>
      </div>

      <div class="barra">
        <div class="progresso ${classeBarra}" style="width:${percentual}%"></div>
      </div>

      <div class="orcamento-porcentagem">${percentual.toFixed(0)}%</div>
    `;

    lista.appendChild(card);
  });
}

function renderizarGrafico() {
  const canvas = document.getElementById("grafico-orcamento");
  const vazio = document.getElementById("grafico-vazio");

  if (!canvas) return;

  const comGasto = orcamentos.filter(
    (orcamento) => Number(orcamento.gasto || 0) > 0,
  );

  if (comGasto.length === 0) {
    canvas.style.display = "none";

    if (vazio) vazio.style.display = "block";

    if (grafico) {
      grafico.destroy();
      grafico = null;
    }

    return;
  }

  canvas.style.display = "block";

  if (vazio) vazio.style.display = "none";

  const labels = comGasto.map(
    (orcamento) => orcamento.categoria?.nome || "Categoria",
  );

  const valores = comGasto.map((orcamento) => Number(orcamento.gasto || 0));

  const cores = comGasto.map((orcamento) =>
    obterCorCategoria(orcamento.categoriaId),
  );

  if (grafico) {
    grafico.data.labels = labels;
    grafico.data.datasets[0].data = valores;
    grafico.data.datasets[0].backgroundColor = cores;
    grafico.update();
    return;
  }

  grafico = new Chart(canvas.getContext("2d"), {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          data: valores,
          backgroundColor: cores,
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
        },
      },
    },
  });
}

function abrirModal() {
  const modal = document.getElementById("modal-orcamento");

  if (!modal) return;

  const form = document.getElementById("form-orcamento");

  if (form) form.reset();

  preencherSelectCategorias();

  modal.classList.add("aberto");
}

function fecharModal() {
  const modal = document.getElementById("modal-orcamento");

  if (modal) {
    modal.classList.remove("aberto");
  }
}

async function salvarOrcamento() {
  const categoriaId = Number(
    document.getElementById("orcamento-categoria")?.value,
  );

  const limite = Number(document.getElementById("orcamento-valor")?.value);

  const controleId = Number(localStorage.getItem("controleId"));

  if (!controleId) {
    alert("Controle financeiro não encontrado. Faça login novamente.");
    return;
  }

  if (!categoriaId) {
    alert("Selecione uma categoria.");
    return;
  }

  if (!limite || limite <= 0) {
    alert("Digite um limite válido.");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/orcamentos/cadastrar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        categoriaId,
        limite,
        controleId,
      }),
    });

    const resultado = await response.json();

    if (!response.ok) {
      alert(
        resultado.detalhes || resultado.erro || "Erro ao cadastrar orçamento.",
      );
      return;
    }

    fecharModal();

    await carregarOrcamentos();
  } catch (error) {
    console.error("Erro ao cadastrar orçamento:", error);
    alert("Não foi possível conectar ao servidor.");
  }
}

async function excluirOrcamento(id) {
  if (!confirm("Tem certeza que deseja excluir este orçamento?")) return;

  try {
    const response = await fetch(`${API_URL}/orcamentos/excluir/${id}`, {
      method: "DELETE",
    });

    const resultado = await response.json();

    if (!response.ok) {
      alert(
        resultado.detalhes || resultado.erro || "Erro ao excluir orçamento.",
      );
      return;
    }

    await carregarOrcamentos();
  } catch (error) {
    console.error("Erro ao excluir orçamento:", error);
    alert("Não foi possível conectar ao servidor.");
  }
}

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
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
