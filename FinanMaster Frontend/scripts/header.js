const API_URL = "http://localhost:3000";

// Ações rápidas do dropdown: em qual página ficam e qual botão abre o modal
const ACOES_RAPIDAS = {
  "nova-transacao": { pagina: "transacoes.html", botao: "#btn-nova-transacao" },
  "nova-meta": { pagina: "metas.html", botao: ".btn-nova" },
  "novo-orcamento": { pagina: "orcamentos.html", botao: "#btn-novo-orcamento" },
};

/* ============ Preferências globais (tema, texto, ocultar valores) ============ */

// Valem para todas as páginas e ficam salvas no localStorage.
// A página de Configurações altera esses valores e dispara o evento
// "preferenciasAtualizadas"; o botão de tema do header faz o mesmo.

const TAMANHOS_TEXTO = {
  pequeno: "11px",
  normal: "", // vazio = volta ao tamanho definido no CSS da página
  grande: "14px",
};

// Elementos com valores em dinheiro que ficam desfocados em "Ocultar valores"
const ALVOS_VALORES = [
  ".cards .card h2",
  ".item-transacao .valor",
  ".transacao-valor",
  ".resumo-valor:not(#metas-ativas):not(#metas-concluidas):not(#qtd-transacoes)",
  "#total-economizado-sub",
  ".meta-card .valores",
  ".orcamento-valores",
  "#dropdown-saldo",
  "#dropdown-receitas",
  "#dropdown-despesas",
];

function lerPreferencia(chave) {
  try {
    return localStorage.getItem(chave);
  } catch {
    return null;
  }
}

function salvarPreferencia(chave, valor) {
  try {
    localStorage.setItem(chave, valor);
  } catch {
    // armazenamento indisponível: a preferência vale só até recarregar
  }
}

function injetarEstiloPreferencias() {
  if (document.getElementById("estilo-preferencias")) {
    return;
  }

  const desfocar = ALVOS_VALORES.map(
    (seletor) => `body.ocultar-valores ${seletor}`,
  );
  const revelar = desfocar.map((seletor) => `${seletor}:hover`);

  const estilo = document.createElement("style");

  estilo.id = "estilo-preferencias";
  estilo.textContent = `
    ${desfocar.join(",\n")} {
      filter: blur(7px);
      user-select: none;
      transition: filter 0.2s ease;
    }

    ${revelar.join(",\n")} {
      filter: none;
    }
  `;

  document.head.appendChild(estilo);
}

function aplicarPreferencias() {
  const escuro = lerPreferencia("tema") === "dark";

  document.body.classList.toggle("dark-theme", escuro);
  document.body.classList.toggle(
    "ocultar-valores",
    lerPreferencia("ocultarValores") === "1",
  );

  document.documentElement.style.fontSize =
    TAMANHOS_TEXTO[lerPreferencia("tamanhoTexto")] || "";

  // Mantém o botão de tema do header em sincronia
  const toggle = document.getElementById("theme-toggle");

  if (toggle) {
    toggle.checked = escuro;
  }
}

// Aplica já ao carregar o script, antes do header chegar (evita "piscar" claro → escuro)
injetarEstiloPreferencias();
aplicarPreferencias();

window.addEventListener("preferenciasAtualizadas", aplicarPreferencias);
window.addEventListener("storage", aplicarPreferencias); // outra aba mudou

document.addEventListener("DOMContentLoaded", async () => {
  await carregarHeader();

  iniciarPaginaAtiva();
  iniciarUsuario();
  iniciarTema();
  iniciarMenu();
  iniciarDropdown();
  iniciarPesquisa();
  executarAcaoDaURL();

  window.addEventListener("usuarioAtualizado", iniciarUsuario);
  window.addEventListener("fotoPerfilAtualizada", iniciarUsuario);
});

function obterPaginaAtual() {
  return location.pathname.split("/").pop() || "dashboard.html";
}

async function carregarHeader() {
  const header = document.getElementById("site-header");

  if (!header) {
    return;
  }

  try {
    const response = await fetch("components/header.html");

    if (!response.ok) {
      throw new Error("Não foi possível carregar o header.");
    }

    header.innerHTML = await response.text();
  } catch (error) {
    console.error("Erro ao carregar header:", error);
  }
}

function iniciarPaginaAtiva() {
  const paginaAtual = obterPaginaAtual();

  document.querySelectorAll("#sidebar .sidebar a").forEach((link) => {
    const href = link.getAttribute("href");

    if (href === paginaAtual) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

function iniciarUsuario() {
  const usuarioId = localStorage.getItem("usuarioId");
  const nomeUsuario = localStorage.getItem("nomeUsuario");
  const fotoPerfil = localStorage.getItem("fotoPerfil");
  const emailUsuario = localStorage.getItem("emailUsuario");

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
    if (fotoPerfil) {
      fotoElemento.src = fotoPerfil;
      containerFoto.style.display = "block";
    } else {
      fotoElemento.removeAttribute("src");
      containerFoto.style.display = "none";
    }
  }

  atualizarCartaoUsuario(nomeUsuario, fotoPerfil);

  const emailElemento = document.getElementById("dropdown-email");

  if (emailElemento) {
    emailElemento.textContent = emailUsuario || "E-mail não informado";
    emailElemento.hidden = false;
  }
}

// Cartão do topo do dropdown: avatar (foto ou inicial), nome e e-mail
function atualizarCartaoUsuario(nome, foto) {
  const nomeEl = document.getElementById("dropdown-nome");
  const emailEl = document.getElementById("dropdown-email");
  const avatar = document.getElementById("dropdown-avatar");

  const nomeFinal = nome || "Usuário";
  const email = localStorage.getItem("emailUsuario");

  if (nomeEl) {
    nomeEl.textContent = nomeFinal;
  }

  if (emailEl) {
    emailEl.textContent = email || "";
    emailEl.hidden = !email;
  }

  if (avatar) {
    if (foto) {
      avatar.style.backgroundImage = `url(${JSON.stringify(foto)})`;
      avatar.textContent = "";
    } else {
      avatar.style.backgroundImage = "";
      avatar.textContent = nomeFinal.trim().charAt(0).toUpperCase();
    }
  }
}

function iniciarTema() {
  const toggle = document.getElementById("theme-toggle");

  if (!toggle) {
    return;
  }

  toggle.checked = lerPreferencia("tema") === "dark";

  toggle.addEventListener("change", () => {
    salvarPreferencia("tema", toggle.checked ? "dark" : "light");

    // aplica o tema e avisa a página de Configurações (se estiver aberta)
    window.dispatchEvent(new CustomEvent("preferenciasAtualizadas"));
  });
}

function iniciarMenu() {
  const menuBtn = document.getElementById("menu-btn");
  const closeBtn = document.getElementById("close-btn");
  const sidebar = document.getElementById("sidebar");

  if (!menuBtn || !closeBtn || !sidebar) {
    return;
  }

  menuBtn.addEventListener("click", () => {
    sidebar.classList.add("active");
  });

  closeBtn.addEventListener("click", () => {
    sidebar.classList.remove("active");
  });

  document.querySelectorAll("#sidebar .sidebar a").forEach((link) => {
    link.addEventListener("click", () => {
      sidebar.classList.remove("active");
    });
  });
}

/* ===================== Dropdown do perfil ===================== */

function iniciarDropdown() {
  const dropdown = document.getElementById("profile-dropdown");
  const profileBtn = document.getElementById("profile-btn");
  const menu = document.getElementById("profile-menu");
  const btnSair = document.getElementById("btn-sair");

  if (!dropdown || !profileBtn || !menu) {
    return;
  }

  // "Saldo de outubro"
  const tituloMes = document.getElementById("dropdown-mes");

  if (tituloMes) {
    const mes = new Date().toLocaleDateString("pt-BR", { month: "long" });
    tituloMes.textContent = `Saldo de ${mes}`;
  }

  const itens = () => [...menu.querySelectorAll("a, button")];

  function setDropdown(open, { focarPrimeiro = false } = {}) {
    dropdown.classList.toggle("open", open);
    profileBtn.setAttribute("aria-expanded", String(open));

    if (open) {
      carregarResumoDropdown();

      if (focarPrimeiro) {
        itens()[0]?.focus();
      }
    }
  }

  profileBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    setDropdown(!dropdown.classList.contains("open"));
  });

  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target)) {
      setDropdown(false);
    }
  });

  // Teclado: Esc fecha, setas navegam entre os itens
  document.addEventListener("keydown", (e) => {
    const aberto = dropdown.classList.contains("open");

    if (e.key === "Escape" && aberto) {
      setDropdown(false);
      profileBtn.focus();
      return;
    }

    if (!aberto && e.target === profileBtn && e.key === "ArrowDown") {
      e.preventDefault();
      setDropdown(true, { focarPrimeiro: true });
      return;
    }

    if (aberto && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      e.preventDefault();

      const lista = itens();
      const atual = lista.indexOf(document.activeElement);
      let proximo;

      if (atual === -1) {
        proximo = e.key === "ArrowDown" ? 0 : lista.length - 1;
      } else if (e.key === "ArrowDown") {
        proximo = (atual + 1) % lista.length;
      } else {
        proximo = (atual - 1 + lista.length) % lista.length;
      }

      lista[proximo]?.focus();
    }
  });

  // Ações rápidas (Transação, Meta, Orçamento)
  menu.addEventListener("click", (e) => {
    const botao = e.target.closest("[data-acao]");

    if (!botao) {
      return;
    }

    setDropdown(false);
    executarAcaoRapida(botao.dataset.acao);
  });

  if (btnSair) {
    btnSair.addEventListener("click", async () => {
      // Encerra a sessão do Firebase (no-op se o usuário não logou por ele)
      // (import dinâmico: se o caminho falhar, não quebra o resto do header)
      try {
        const { getAuth, signOut } =
          await import("https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js");
        const { app } = await import("../firebase.js");

        await signOut(getAuth(app));
      } catch (error) {
        console.error("Erro ao encerrar sessão:", error);
      }

      // Remove só os dados de sessão, preservando preferências como o tema
      [
        "usuarioId",
        "controleId",
        "nomeUsuario",
        "emailUsuario",
        "tipoLogin",
        "fotoPerfil",
      ].forEach((chave) => localStorage.removeItem(chave));

      window.location.href = "index.html";
    });
  }
}

// Resumo do mês atual (saldo, receitas, despesas) mostrado no dropdown
async function carregarResumoDropdown() {
  const controleId = localStorage.getItem("controleId");

  const saldoEl = document.getElementById("dropdown-saldo");
  const receitasEl = document.getElementById("dropdown-receitas");
  const despesasEl = document.getElementById("dropdown-despesas");

  if (!controleId || !saldoEl || !receitasEl || !despesasEl) {
    return;
  }

  try {
    const response = await fetch(
      `${API_URL}/transacoes/listar?controleId=${controleId}`,
    );

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }

    const resultado = await response.json();
    const lista = Array.isArray(resultado)
      ? resultado
      : resultado.transacoes || [];

    // Compara "AAAA-MM" direto na string da data (evita erro de fuso horário)
    const hoje = new Date();
    const mesAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;

    let receitas = 0;
    let despesas = 0;

    lista.forEach((transacao) => {
      if (String(transacao.data || "").slice(0, 7) !== mesAtual) {
        return;
      }

      const valor = Number(transacao.valor || 0);
      const tipo = String(transacao.tipo || "").toUpperCase();

      if (tipo === "ENTRADA") {
        receitas += valor;
      } else if (tipo === "SAIDA") {
        despesas += valor;
      }
    });

    const saldo = receitas - despesas;

    saldoEl.textContent = formatarMoedaMenu(saldo);
    saldoEl.classList.toggle("dd-positivo", saldo >= 0);
    saldoEl.classList.toggle("dd-negativo", saldo < 0);

    receitasEl.textContent = formatarMoedaMenu(receitas);
    despesasEl.textContent = formatarMoedaMenu(despesas);
  } catch (error) {
    console.error("Erro ao carregar resumo do menu:", error);
  }
}

function formatarMoedaMenu(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

// Já está na página da ação? Abre o modal na hora. Senão, navega até ela.
function executarAcaoRapida(chave) {
  const acao = ACOES_RAPIDAS[chave];

  if (!acao) {
    return;
  }

  if (obterPaginaAtual() === acao.pagina) {
    document.querySelector(acao.botao)?.click();
  } else {
    window.location.href = `${acao.pagina}?acao=${chave}`;
  }
}

// Chegou por uma ação rápida (?acao=nova-meta): abre o modal e limpa a URL
function executarAcaoDaURL() {
  const chave = new URLSearchParams(location.search).get("acao");
  const acao = ACOES_RAPIDAS[chave];

  if (!acao || acao.pagina !== obterPaginaAtual()) {
    return;
  }

  history.replaceState(null, "", location.pathname);
  document.querySelector(acao.botao)?.click();
}

/* ========================== Pesquisa ========================== */

// Elementos pesquisáveis em cada página (seletores CSS)
const PESQUISA_POR_PAGINA = {
  "dashboard.html": [".cards .card", "#transacoes-recentes > *"],
  "orcamentos.html": [".resumo-card", "#orcamentos-lista > *"],
  "metas.html": [".resumo-card", "#metas-grid > *"],
  "configuracoes.html": [".config-card"],
};

function normalizarTexto(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // ignora acentos: "orcamento" acha "Orçamento"
    .trim();
}

// Texto que o usuário enxerga no elemento: ignora o nome dos ícones
// (Material Icons escrevem "delete", "flag" etc. como texto) e inclui
// o valor dos campos preenchidos (nome, e-mail, telefone...).
function textoPesquisavel(elemento) {
  const copia = elemento.cloneNode(true);

  copia.querySelectorAll(".material-icons").forEach((icone) => icone.remove());

  const valores = [
    ...elemento.querySelectorAll(
      "input:not([type=password]):not([type=checkbox]):not([type=file]), textarea",
    ),
  ].map((campo) => campo.value);

  return `${copia.textContent} ${valores.join(" ")}`;
}

function iniciarPesquisa() {
  const input =
    document.getElementById("search-input") ||
    document.querySelector(".search-bar input");

  if (!input) {
    console.warn("[pesquisa] campo de pesquisa não encontrado no header.");
    return;
  }

  // Estilos da pesquisa injetados aqui: não dependem do header.css
  if (!document.getElementById("estilo-pesquisa")) {
    const estilo = document.createElement("style");

    estilo.id = "estilo-pesquisa";
    estilo.textContent = `
      .pesquisa-oculto { display: none !important; }
      .pesquisa-vazio { padding: 24px; text-align: center; opacity: 0.7; }
    `;

    document.head.appendChild(estilo);
  }

  const pagina = obterPaginaAtual();

  // Transações já tem busca própria (com filtros e paginação):
  // a barra do header só repassa o texto para ela.
  if (pagina === "transacoes.html") {
    input.addEventListener("input", () => {
      const buscaPagina = document.getElementById("busca-input");

      if (!buscaPagina) {
        return;
      }

      buscaPagina.value = input.value;
      buscaPagina.dispatchEvent(new Event("input", { bubbles: true }));
    });

    // O botão "Limpar" da página zera a busca dela: zera a do header também
    document
      .getElementById("btn-limpar-filtros")
      ?.addEventListener("click", () => {
        input.value = "";
      });

    return;
  }

  const seletores = PESQUISA_POR_PAGINA[pagina];

  if (!seletores) {
    return;
  }

  const main = document.querySelector("main");

  // Mensagem de "nenhum resultado"
  const vazio = document.createElement("p");
  vazio.className = "pesquisa-vazio pesquisa-oculto";
  main?.appendChild(vazio);

  function filtrar() {
    const termo = normalizarTexto(input.value);
    let visiveis = 0;

    document.querySelectorAll(seletores.join(",")).forEach((item) => {
      const combina =
        !termo || normalizarTexto(textoPesquisavel(item)).includes(termo);

      item.classList.toggle("pesquisa-oculto", !combina);

      if (combina) {
        visiveis++;
      }
    });

    // Só troca o texto se mudou: mexer nele dispara o MutationObserver
    // abaixo e causaria um loop infinito.
    const mensagem = `Nenhum resultado para "${input.value.trim()}" nesta página.`;

    if (vazio.textContent !== mensagem) {
      vazio.textContent = mensagem;
    }

    vazio.classList.toggle("pesquisa-oculto", !termo || visiveis > 0);
  }

  input.addEventListener("input", filtrar);

  // Listas renderizadas depois (vindas da API): reaplica o filtro quando mudarem
  if (main) {
    new MutationObserver(() => {
      if (input.value.trim()) {
        filtrar();
      }
    }).observe(main, { childList: true, subtree: true });
  }

  // Esc limpa a pesquisa
  input.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      input.value = "";
      filtrar();
    }
  });
}
