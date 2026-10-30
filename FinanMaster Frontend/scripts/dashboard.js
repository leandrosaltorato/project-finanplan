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

  iniciarDashboard();
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

  if (!Array.isArray(transacoes) || transacoes.length === 0) {
    container.innerHTML = `
      <div class="transacoes-vazio">
        <span class="material-icons">receipt_long</span>
        <h4>Nenhuma transação ainda</h4>
        <p>Cadastre sua primeira movimentação na página Transações.</p>
      </div>
    `;

    return;
  }

  transacoes.slice(0, 5).forEach((transacao, indice) => {
    const entrada = transacao.tipo === "ENTRADA";
    const categoria = transacao.categoria?.nome || "Sem categoria";

    const elemento = document.createElement("div");

    elemento.className = `item-transacao ${entrada ? "entrada" : "saida"}`;

    // Atraso da animação de entrada: um item após o outro
    elemento.style.setProperty("--i", indice);

    elemento.innerHTML = `
      <div class="lado-esquerdo">
        <div class="icone ${entrada ? "positivo" : "negativo"}">
          <span class="material-icons">
            ${entrada ? "north_east" : "south_east"}
          </span>
        </div>

        <div class="info">
          <h4>${escaparHTML(transacao.descricao)}</h4>

          <div class="info-meta">
            <span class="categoria-pill">${escaparHTML(categoria)}</span>
            <small>${formatarData(transacao.data)}</small>
          </div>
        </div>
      </div>

      <div class="lado-direito">
        <div class="valor ${entrada ? "positivo" : "negativo"}">
          ${entrada ? "+" : "-"} ${formatarMoeda(transacao.valor)}
        </div>

        <small class="valor-tipo">${entrada ? "Entrada" : "Saída"}</small>
      </div>
    `;

    container.appendChild(elemento);
  });
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

  // Datas "YYYY-MM-DD..." viram data LOCAL (new Date(string) interpretaria
  // como UTC e, no Brasil, mostraria o dia anterior).
  const partes = String(data).match(/^(\d{4})-(\d{2})-(\d{2})/);

  const dataObj = partes
    ? new Date(Number(partes[1]), Number(partes[2]) - 1, Number(partes[3]))
    : new Date(data);

  if (Number.isNaN(dataObj.getTime())) {
    return "";
  }

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const dia = new Date(dataObj);
  dia.setHours(0, 0, 0, 0);

  const diferenca = Math.round((hoje - dia) / (1000 * 60 * 60 * 24));

  if (diferenca === 0) {
    return "Hoje";
  }

  if (diferenca === 1) {
    return "Ontem";
  }

  return dataObj
    .toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
    .replace(".", "")
    .replace(" de ", " ");
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
