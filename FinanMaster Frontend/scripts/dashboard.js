const API_URL = "http://localhost:3000";

document.addEventListener("DOMContentLoaded", () => {
  const paginaAtual = location.pathname.split("/").pop();

  document.querySelectorAll(".sidebar a").forEach((link) => {
    const href = link.getAttribute("href");

    if (href === paginaAtual) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  const btnAbrirModal = document.getElementById("btn-abrir-modal");
  const btnFecharModal = document.querySelector(".fechar-modal");
  const form = document.getElementById("form-transacao");
  const modal = document.getElementById("modal");

  if (btnAbrirModal) {
    btnAbrirModal.addEventListener("click", abrirModal);
  }

  if (btnFecharModal) {
    btnFecharModal.addEventListener("click", fecharModal);
  }

  if (form) {
    form.addEventListener("submit", cadastrarTransacao);
  }

  if (modal) {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        fecharModal();
      }
    });
  }

  iniciarDashboard();
  carregarCategorias();
});

function iniciarDashboard() {
  const usuarioId = localStorage.getItem("usuarioId");
  const nomeUsuario = localStorage.getItem("nomeUsuario");
  const tipoLogin = localStorage.getItem("tipoLogin");
  const fotoPerfil = localStorage.getItem("fotoPerfil");

  if (!usuarioId) {
    window.location.href = "index.html";
    return;
  }

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

  carregarDashboard();
}

async function carregarDashboard() {
  try {
    const controleId = localStorage.getItem("controleId");

    if (!controleId) {
      throw new Error("Controle financeiro não encontrado");
    }

    const response = await fetch(
      `${API_URL}/transacoes/listar?controleId=${controleId}`,
    );

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }

    const transacoes = await response.json();

    calcularDashboard(transacoes);
    mostrarTransacoesRecentes(transacoes);
  } catch (error) {
    console.error("Erro ao carregar dashboard:", error);
  }
}

function calcularDashboard(transacoes) {
  const receitas = transacoes
    .filter((transacao) => transacao.tipo === "ENTRADA")
    .reduce((total, transacao) => total + Number(transacao.valor), 0);

  const despesas = transacoes
    .filter((transacao) => transacao.tipo === "SAIDA")
    .reduce((total, transacao) => total + Number(transacao.valor), 0);

  const saldo = receitas - despesas;
  const metaEconomia = saldo * 0.3;

  atualizarElemento("saldo-total", formatarMoeda(saldo));
  atualizarElemento("receitas", formatarMoeda(receitas));
  atualizarElemento("despesas", formatarMoeda(despesas));
  atualizarElemento("meta-economia", formatarMoeda(metaEconomia));
}

function mostrarTransacoesRecentes(transacoes) {
  const container = document.getElementById("transacoes-recentes");

  if (!container) {
    return;
  }

  container.innerHTML = "";

  transacoes.slice(0, 5).forEach((transacao) => {
    const entrada = transacao.tipo === "ENTRADA";
    const categoria = transacao.categoria?.nome || "Sem categoria";

    const elemento = document.createElement("div");

    elemento.className = "item-transacao";

    elemento.innerHTML = `
      <div class="lado-esquerdo">
        <div class="icone ${entrada ? "positivo" : "negativo"}">
          <span class="material-icons">
            ${entrada ? "north_east" : "south_east"}
          </span>
        </div>

        <div class="info">
          <h4>${escaparHTML(transacao.descricao)}</h4>
          <small>
            ${escaparHTML(categoria)} · ${formatarData(transacao.data)}
          </small>
        </div>
      </div>

      <div class="valor ${entrada ? "positivo" : "negativo"}">
        ${entrada ? "+" : "-"} ${formatarMoeda(transacao.valor)}
      </div>
    `;

    container.appendChild(elemento);
  });
}

async function carregarCategorias() {
  try {
    const response = await fetch(`${API_URL}/categoria/listar`);

    if (!response.ok) {
      throw new Error(`Erro ao buscar categorias: ${response.status}`);
    }

    const categorias = await response.json();

    const select = document.getElementById("categoria");

    if (!select) {
      return;
    }

    select.innerHTML = `
      <option value="">Selecione uma categoria</option>
    `;

    categorias.forEach((categoria) => {
      const option = document.createElement("option");

      option.value = categoria.id;
      option.textContent = categoria.nome;

      select.appendChild(option);
    });
  } catch (error) {
    console.error("Erro ao carregar categorias:", error);
  }
}

async function cadastrarTransacao(event) {
  event.preventDefault();

  const descricao = document.getElementById("descricao").value.trim();
  const valor = Number(document.getElementById("valor").value);
  const tipo = document.getElementById("tipo").value;
  const categoriaId = Number(document.getElementById("categoria").value);
  const controleId = Number(localStorage.getItem("controleId"));

  if (!controleId) {
    alert("controle financeiro não encontrado faça login novamente");
    return;
  }

  if (!descricao || valor <= 0 || !categoriaId) {
    alert("Preencha todos os campos corretamente.");
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
        tipo,
        categoriaId,
        controleId,
      }),
    });

    const resultado = await response.json();

    if (!response.ok) {
      alert(
        resultado.detalhes || resultado.erro || "Erro ao cadastrar transação",
      );
      return;
    }

    document.getElementById("form-transacao").reset();

    fecharModal();

    await carregarDashboard();

    alert("Transação cadastrada com sucesso!");
  } catch (error) {
    console.error("Erro ao cadastrar transação:", error);
    alert("Não foi possível conectar ao servidor");
  }
}

function abrirModal() {
  const modal = document.getElementById("modal");

  if (modal) {
    modal.style.display = "flex";
  }
}

function fecharModal() {
  const modal = document.getElementById("modal");

  if (modal) {
    modal.style.display = "none";
  }
}

function formatarMoeda(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatarData(data) {
  if (!data) {
    return "";
  }

  return new Date(data).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
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
