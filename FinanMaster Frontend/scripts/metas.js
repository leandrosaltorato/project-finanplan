const API_URL = "http://localhost:3000";

document.addEventListener("DOMContentLoaded", () => {
  iniciarPagina();
});

let metas = [];

function iniciarPagina() {
  const usuarioId = localStorage.getItem("usuarioId");

  if (!usuarioId) {
    window.location.href = "index.html";
    return;
  }

  configurarEventos();
  carregarMetas();
}

function configurarEventos() {
  const btnNova = document.querySelector(".btn-nova");
  const btnFechar = document.getElementById("modal-meta-fechar");
  const btnCancelar = document.getElementById("btn-cancelar-meta");
  const modal = document.getElementById("modal-meta");
  const form = document.getElementById("form-meta");
  const grid = document.getElementById("metas-grid");

  if (btnNova) {
    btnNova.addEventListener("click", abrirModal);
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
    form.addEventListener("submit", cadastrarMeta);
  }

  if (grid) {
    grid.addEventListener("click", (event) => {
      const botaoDeposito = event.target.closest("[data-valor]");
      const botaoExcluir = event.target.closest(".meta-excluir");

      if (botaoDeposito) {
        const id = Number(botaoDeposito.dataset.id);
        const valor = Number(botaoDeposito.dataset.valor);

        depositar(id, valor);
        return;
      }

      if (botaoExcluir) {
        const id = Number(botaoExcluir.dataset.id);

        excluirMeta(id);
      }
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      fecharModal();
    }
  });
}

async function carregarMetas() {
  try {
    const controleId = localStorage.getItem("controleId");

    if (!controleId) {
      alert("Controle financeiro não encontrado. Faça login novamente.");
      window.location.href = "index.html";
      return;
    }

    const response = await fetch(
      `${API_URL}/metas/listar?controleId=${controleId}`,
    );

    const resultado = await response.json();

    if (!response.ok) {
      throw new Error(
        resultado.erro ||
          resultado.detalhes ||
          `Erro na API: ${response.status}`,
      );
    }

    metas = Array.isArray(resultado) ? resultado : [];

    atualizarResumo();
    renderizarMetas();
  } catch (error) {
    console.error("Erro ao carregar metas:", error);

    metas = [];

    atualizarResumo();
    renderizarMetas();

    alert("Não foi possível carregar as metas.");
  }
}

function atualizarResumo() {
  const totalEconomizado = metas.reduce(
    (total, meta) => total + Number(meta.valorAtual),
    0,
  );

  const totalAlvo = metas.reduce(
    (total, meta) => total + Number(meta.valorAlvo),
    0,
  );

  const concluidas = metas.filter(
    (meta) => Number(meta.valorAtual) >= Number(meta.valorAlvo),
  ).length;

  const ativas = metas.length - concluidas;

  atualizarElemento("total-economizado", formatarMoeda(totalEconomizado));
  atualizarElemento("total-economizado-sub", `de ${formatarMoeda(totalAlvo)}`);
  atualizarElemento("metas-ativas", ativas);
  atualizarElemento("metas-concluidas", concluidas);
}

function renderizarMetas() {
  const grid = document.getElementById("metas-grid");

  if (!grid) {
    return;
  }

  grid.innerHTML = "";

  if (metas.length === 0) {
    grid.innerHTML = `<p class="metas-vazio">Nenhuma meta cadastrada ainda.</p>`;
    return;
  }

  metas.forEach((meta) => {
    grid.appendChild(criarCardMeta(meta));
  });
}

function criarCardMeta(meta) {
  const valorAtual = Number(meta.valorAtual);
  const valorAlvo = Number(meta.valorAlvo);

  const porcentagem =
    valorAlvo > 0
      ? Math.min(100, Math.round((valorAtual / valorAlvo) * 100))
      : 0;

  const card = document.createElement("div");

  card.className = "meta-card";

  card.innerHTML = `
    <div class="meta-topo">
      <div class="meta-icon-box">
        <span class="material-icons">${escaparHTML(meta.icone || "flag")}</span>
      </div>

      <div class="meta-titulo">
        <h2>${escaparHTML(meta.titulo)}</h2>
        <p>${calcularPrazo(meta.dataLimite)}</p>
      </div>

      <button type="button" class="meta-excluir" data-id="${meta.id}" aria-label="Excluir meta">
        <span class="material-icons">delete</span>
      </button>
    </div>

    <div class="valores">
      <strong>${formatarMoeda(valorAtual)}</strong>
      <span>${formatarMoeda(valorAlvo)}</span>
    </div>

    <div class="barra">
      <div class="progresso" style="width: ${porcentagem}%;"></div>
    </div>

    <div class="porcentagem">${porcentagem}%</div>

    <div class="botoes">
      <button type="button" data-id="${meta.id}" data-valor="100">+R$100</button>
      <button type="button" data-id="${meta.id}" data-valor="500">+R$500</button>
      <button type="button" data-id="${meta.id}" data-valor="1000">+R$1000</button>
    </div>
  `;

  return card;
}

function calcularPrazo(dataLimite) {
  if (!dataLimite) {
    return "Sem prazo definido";
  }

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const data = new Date(dataLimite);
  data.setHours(0, 0, 0, 0);

  const dias = Math.ceil((data - hoje) / (1000 * 60 * 60 * 24));

  if (dias < 0) {
    return "Prazo encerrado";
  }

  if (dias === 0) {
    return "Vence hoje";
  }

  return `${dias} dias restantes`;
}

async function cadastrarMeta(event) {
  event.preventDefault();

  const titulo = document.getElementById("meta-titulo").value.trim();
  const descricao = document.getElementById("meta-descricao").value.trim();
  const icone = document.getElementById("meta-icone").value.trim();
  const valorAlvo = Number(document.getElementById("meta-valor-alvo").value);
  const valorAtual =
    Number(document.getElementById("meta-valor-atual").value) || 0;
  const dataLimite = document.getElementById("meta-data-limite").value;
  const controleId = Number(localStorage.getItem("controleId"));

  if (!controleId) {
    alert("Controle financeiro não encontrado. Faça login novamente.");
    return;
  }

  if (!titulo || !valorAlvo || valorAlvo <= 0) {
    alert("Preencha ao menos o título e o valor alvo.");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/metas/cadastrar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        titulo,
        descricao: descricao || null,
        icone: icone || "flag",
        valorAlvo,
        valorAtual,
        dataLimite: dataLimite || null,
        controleId,
      }),
    });

    const resultado = await response.json();

    if (!response.ok) {
      alert(resultado.erro || resultado.detalhes || "Erro ao cadastrar meta.");
      return;
    }

    fecharModal();

    await carregarMetas();
  } catch (error) {
    console.error("Erro ao cadastrar meta:", error);
    alert("Não foi possível conectar ao servidor.");
  }
}

async function depositar(id, valor) {
  try {
    const response = await fetch(`${API_URL}/metas/depositar/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ valor }),
    });

    const resultado = await response.json();

    if (!response.ok) {
      alert(
        resultado.erro || resultado.detalhes || "Erro ao depositar na meta.",
      );
      return;
    }

    await carregarMetas();
  } catch (error) {
    console.error("Erro ao depositar na meta:", error);
    alert("Não foi possível conectar ao servidor.");
  }
}

async function excluirMeta(id) {
  const confirmar = confirm("Tem certeza que deseja excluir esta meta?");

  if (!confirmar) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/metas/excluir/${id}`, {
      method: "DELETE",
    });

    const resultado = await response.json();

    if (!response.ok) {
      alert(resultado.erro || resultado.detalhes || "Erro ao excluir meta.");
      return;
    }

    await carregarMetas();
  } catch (error) {
    console.error("Erro ao excluir meta:", error);
    alert("Não foi possível conectar ao servidor.");
  }
}

function abrirModal() {
  const modal = document.getElementById("modal-meta");
  const form = document.getElementById("form-meta");

  if (!modal) {
    return;
  }

  if (form) {
    form.reset();
  }

  modal.classList.add("aberto");
}

function fecharModal() {
  const modal = document.getElementById("modal-meta");

  if (modal) {
    modal.classList.remove("aberto");
  }
}

function formatarMoeda(valor) {
  return Number(valor).toLocaleString("pt-BR", {
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
