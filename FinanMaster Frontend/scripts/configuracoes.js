import {
  getAuth,
  onAuthStateChanged,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import { app } from "../firebase.js";

const auth = getAuth(app);

const API_BASE = "http://localhost:3000";
const API_URL = `${API_BASE}/config`;

// Página de login: a mesma que as outras telas usam quando não há sessão
const PAGINA_LOGIN = "index.html";

const CHAVES_SESSAO = [
  "usuarioId",
  "controleId",
  "nomeUsuario",
  "emailUsuario",
  "tipoLogin",
  "fotoPerfil",
];

const NOMES_METODOS = {
  pix: "PIX",
  debito: "Débito",
  credito: "Crédito",
  dinheiro: "Dinheiro",
  ted: "TED/DOC",
};

const $ = (id) => document.getElementById(id);

// Perfil
const formPerfil = $("form-perfil");
const inputNome = $("nome");
const inputEmail = $("email");
const inputTelefone = $("telefone");
const btnSalvarPerfil = $("btn-salvar-perfil");

// Foto
const fotoConfig = $("foto-config");
const fotoIniciais = $("foto-iniciais");
const inputFoto = $("input-foto");
const btnAlterarFoto = $("btn-alterar-foto");
const btnRemoverFoto = $("btn-remover-foto");

// Preferências
const toggleTema = $("config-tema-toggle");
const toggleOcultar = $("config-ocultar-valores");
const selectTamanho = $("config-tamanho-texto");
const btnRestaurar = $("btn-restaurar-preferencias");

// Seus dados
const btnExportarCsv = $("btn-exportar-csv");
const btnExportarJson = $("btn-exportar-json");

// Segurança
const formSenha = $("form-senha");
const camposSenha = $("campos-senha");
const avisoSenha = $("aviso-senha");
const inputSenhaAtual = $("senha-atual");
const inputNovaSenha = $("nova-senha");
const inputConfirmarSenha = $("confirmar-senha");
const btnAtualizarSenha = $("btn-atualizar-senha");

// Exclusão de conta
const btnExcluirConta = $("btn-excluir-conta");
const modalExcluir = $("modal-excluir-conta");
const inputConfirmarExclusao = $("confirmar-exclusao");
const btnConfirmarExclusao = $("btn-confirmar-exclusao");
const btnCancelarExclusao = $("btn-cancelar-exclusao");

// Só libera "Salvar" depois que o perfil real foi carregado, para nunca
// gravar o texto provisório no lugar do nome/e-mail.
let perfilCarregado = false;

if (btnSalvarPerfil) {
  btnSalvarPerfil.disabled = true;
}

/* ================= Utilidades ================= */

function irParaLogin() {
  window.location.href = PAGINA_LOGIN;
}

function limparSessaoLocal() {
  CHAVES_SESSAO.forEach((chave) => localStorage.removeItem(chave));
}

function mostrarToast(mensagem, tipo = "sucesso") {
  let area = $("toast-area");

  if (!area) {
    area = document.createElement("div");
    area.id = "toast-area";
    area.setAttribute("aria-live", "polite");
    document.body.appendChild(area);
  }

  const toast = document.createElement("div");
  toast.className = `toast ${tipo}`;
  toast.setAttribute("role", tipo === "erro" ? "alert" : "status");

  const icone = document.createElement("span");
  icone.className = "material-icons";
  icone.textContent = tipo === "erro" ? "error" : "check_circle";

  const texto = document.createElement("span");
  texto.className = "toast-texto";
  texto.textContent = mensagem;

  toast.append(icone, texto);
  area.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("saindo");
    setTimeout(() => toast.remove(), 300);
  }, 3800);
}

// Desabilita o botão e mostra "carregando" enquanto a ação roda (evita clique duplo)
async function comCarregamento(botao, textoCarregando, acao) {
  if (!botao || botao.disabled) {
    return;
  }

  const htmlOriginal = botao.innerHTML;

  botao.disabled = true;
  botao.innerHTML = `<span class="material-icons girando">autorenew</span>${textoCarregando}`;

  try {
    await acao();
  } finally {
    botao.disabled = false;
    botao.innerHTML = htmlOriginal;
  }
}

async function obterToken() {
  const usuario = auth.currentUser;

  if (!usuario) {
    irParaLogin();
    return null;
  }

  return usuario.getIdToken();
}

async function chamarApi(caminho, opcoes = {}) {
  const token = await obterToken();

  if (!token) {
    throw new Error("Sessão expirada. Faça login novamente.");
  }

  const headers = { Authorization: `Bearer ${token}` };

  if (opcoes.body) {
    headers["Content-Type"] = "application/json";
  }

  let resposta;

  try {
    resposta = await fetch(`${API_URL}${caminho}`, { ...opcoes, headers });
  } catch {
    throw new Error("Não foi possível conectar ao servidor.");
  }

  let dados = {};

  try {
    dados = await resposta.json();
  } catch {
    dados = {};
  }

  if (!resposta.ok) {
    throw new Error(
      dados.erro || dados.detalhes || `Erro inesperado (${resposta.status}).`,
    );
  }

  return dados;
}

/* ================= Perfil ================= */

function formatarTelefone(valor) {
  const d = String(valor || "")
    .replace(/\D/g, "")
    .slice(0, 11);

  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10)
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;

  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function carregarPerfil() {
  // Mostra o que já está salvo no navegador enquanto a API responde
  inputNome.value = localStorage.getItem("nomeUsuario") || "";
  inputEmail.value = localStorage.getItem("emailUsuario") || "";
  mostrarFoto();

  try {
    const dados = await chamarApi("/perfil");

    inputNome.value = dados.nome || "";
    inputEmail.value = dados.email || "";
    inputTelefone.value = formatarTelefone(dados.Telefone ?? dados.telefone);

    perfilCarregado = true;
    btnSalvarPerfil.disabled = false;

    mostrarFoto();
  } catch (erro) {
    mostrarToast(erro.message || "Não foi possível carregar o perfil.", "erro");
  }
}

async function salvarPerfil(evento) {
  evento.preventDefault();

  if (!perfilCarregado) {
    return;
  }

  const nome = inputNome.value.trim();
  const email = inputEmail.value.trim();
  const telefone = inputTelefone.value.trim();

  if (nome.length < 2) {
    mostrarToast("Digite seu nome completo.", "erro");
    inputNome.focus();
    return;
  }

  if (!emailValido(email)) {
    mostrarToast("Digite um e-mail válido.", "erro");
    inputEmail.focus();
    return;
  }

  const digitosTelefone = telefone.replace(/\D/g, "");

  if (telefone && digitosTelefone.length < 10) {
    mostrarToast("Telefone incompleto. Use DDD + número.", "erro");
    inputTelefone.focus();
    return;
  }

  await comCarregamento(btnSalvarPerfil, "Salvando...", async () => {
    try {
      const dados = await chamarApi("/perfil", {
        method: "PUT",
        body: JSON.stringify({ nome, email, telefone }),
      });

      localStorage.setItem("nomeUsuario", dados.nome ?? nome);
      localStorage.setItem("emailUsuario", dados.email ?? email);

      mostrarFoto();

      window.dispatchEvent(new CustomEvent("usuarioAtualizado"));

      mostrarToast("Perfil atualizado com sucesso!");
    } catch (erro) {
      mostrarToast(
        erro.message || "Não foi possível atualizar o perfil.",
        "erro",
      );
    }
  });
}

/* ================= Foto de perfil ================= */

function obterIniciais(nome) {
  const partes = String(nome || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (partes.length === 0) {
    return "?";
  }

  const primeira = partes[0][0];
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";

  return (primeira + ultima).toUpperCase();
}

function mostrarFoto() {
  const foto = localStorage.getItem("fotoPerfil");

  if (foto) {
    fotoConfig.src = foto;
    fotoConfig.hidden = false;
    fotoIniciais.hidden = true;
  } else {
    fotoConfig.removeAttribute("src");
    fotoConfig.hidden = true;
    fotoIniciais.hidden = false;
    fotoIniciais.textContent = obterIniciais(
      inputNome.value || localStorage.getItem("nomeUsuario"),
    );
  }

  btnRemoverFoto.hidden = !foto;
}

// Recorta no centro (quadrado) e reduz para 256 px: a foto cabe no localStorage
// mesmo quando o arquivo original tem vários MB.
function prepararImagem(arquivo, lado = 256) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(arquivo);
    const imagem = new Image();

    imagem.onload = () => {
      URL.revokeObjectURL(url);

      const menor = Math.min(imagem.width, imagem.height);
      const origemX = (imagem.width - menor) / 2;
      const origemY = (imagem.height - menor) / 2;

      const canvas = document.createElement("canvas");
      canvas.width = lado;
      canvas.height = lado;

      const contexto = canvas.getContext("2d");

      // Fundo branco: PNG com transparência não vira preto ao virar JPEG
      contexto.fillStyle = "#ffffff";
      contexto.fillRect(0, 0, lado, lado);
      contexto.drawImage(
        imagem,
        origemX,
        origemY,
        menor,
        menor,
        0,
        0,
        lado,
        lado,
      );

      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };

    imagem.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Não foi possível ler essa imagem."));
    };

    imagem.src = url;
  });
}

async function trocarFoto() {
  const arquivo = inputFoto.files[0];

  if (!arquivo) {
    return;
  }

  inputFoto.value = "";

  if (!["image/png", "image/jpeg"].includes(arquivo.type)) {
    mostrarToast("Escolha uma imagem JPG ou PNG.", "erro");
    return;
  }

  if (arquivo.size > 10 * 1024 * 1024) {
    mostrarToast("A imagem é muito grande (máximo 10 MB).", "erro");
    return;
  }

  try {
    const foto = await prepararImagem(arquivo);

    localStorage.setItem("fotoPerfil", foto);

    mostrarFoto();

    window.dispatchEvent(new CustomEvent("fotoPerfilAtualizada"));

    mostrarToast("Foto atualizada com sucesso!");
  } catch (erro) {
    mostrarToast(erro.message || "Não foi possível salvar a foto.", "erro");
  }
}

function removerFoto() {
  localStorage.removeItem("fotoPerfil");

  mostrarFoto();

  window.dispatchEvent(new CustomEvent("fotoPerfilAtualizada"));

  mostrarToast("Foto removida.");
}

/* ================= Preferências ================= */

// O header.js aplica estas preferências em todas as páginas
// quando recebe o evento "preferenciasAtualizadas".
function notificarPreferencias() {
  window.dispatchEvent(new CustomEvent("preferenciasAtualizadas"));
}

function sincronizarPreferencias() {
  toggleTema.checked = localStorage.getItem("tema") === "dark";
  toggleOcultar.checked = localStorage.getItem("ocultarValores") === "1";

  const tamanho = localStorage.getItem("tamanhoTexto");

  selectTamanho.value = ["pequeno", "normal", "grande"].includes(tamanho)
    ? tamanho
    : "normal";
}

toggleTema?.addEventListener("change", () => {
  localStorage.setItem("tema", toggleTema.checked ? "dark" : "light");
  document.body.classList.toggle("dark-theme", toggleTema.checked);
  notificarPreferencias();
});

toggleOcultar?.addEventListener("change", () => {
  localStorage.setItem("ocultarValores", toggleOcultar.checked ? "1" : "0");
  notificarPreferencias();
});

selectTamanho?.addEventListener("change", () => {
  localStorage.setItem("tamanhoTexto", selectTamanho.value);
  notificarPreferencias();
});

btnRestaurar?.addEventListener("click", () => {
  localStorage.setItem("tema", "light");
  localStorage.setItem("ocultarValores", "0");
  localStorage.setItem("tamanhoTexto", "normal");

  document.body.classList.remove("dark-theme");

  sincronizarPreferencias();
  notificarPreferencias();

  mostrarToast("Preferências restauradas para o padrão.");
});

// Se o tema for trocado pelo botão do header (ou em outra aba), acompanha
window.addEventListener("preferenciasAtualizadas", sincronizarPreferencias);
window.addEventListener("storage", sincronizarPreferencias);

/* ================= Exportação de dados ================= */

function baixarArquivo(nome, conteudo, tipo) {
  const blob = new Blob([conteudo], { type: tipo });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = nome;

  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function dataDeHoje() {
  const agora = new Date();
  const p = (n) => String(n).padStart(2, "0");

  return `${agora.getFullYear()}-${p(agora.getMonth() + 1)}-${p(agora.getDate())}`;
}

async function buscarLista(caminho) {
  const controleId = localStorage.getItem("controleId");

  if (!controleId) {
    throw new Error(
      "Controle financeiro não encontrado. Faça login novamente.",
    );
  }

  let resposta;

  try {
    resposta = await fetch(
      `${API_BASE}${caminho}?controleId=${encodeURIComponent(controleId)}`,
    );
  } catch {
    throw new Error("Não foi possível conectar ao servidor.");
  }

  let dados = null;

  try {
    dados = await resposta.json();
  } catch {
    dados = null;
  }

  if (!resposta.ok) {
    throw new Error(
      dados?.erro || dados?.detalhes || `Erro inesperado (${resposta.status}).`,
    );
  }

  if (Array.isArray(dados)) {
    return dados;
  }

  return dados?.transacoes || dados?.metas || dados?.orcamentos || [];
}

// Aspas duplicadas + proteção contra "injeção de fórmula" no Excel
// (texto que começa com = + - @ viraria uma fórmula).
function celulaCsv(valor) {
  let texto = String(valor ?? "");

  if (/^[=+\-@\t\r]/.test(texto)) {
    texto = `'${texto}`;
  }

  return `"${texto.replace(/"/g, '""')}"`;
}

function dataParaCsv(data) {
  const partes = String(data || "").match(/^(\d{4})-(\d{2})-(\d{2})/);

  return partes ? `${partes[3]}/${partes[2]}/${partes[1]}` : "";
}

function nomeDaCategoria(transacao) {
  if (transacao.categoria && typeof transacao.categoria === "object") {
    return transacao.categoria.nome || "";
  }

  return transacao.categoria || "";
}

async function exportarCsv() {
  await comCarregamento(btnExportarCsv, "Gerando...", async () => {
    try {
      const transacoes = await buscarLista("/transacoes/listar");

      if (transacoes.length === 0) {
        mostrarToast("Você ainda não tem transações para exportar.", "erro");
        return;
      }

      const ordenadas = [...transacoes].sort((a, b) =>
        String(b.data).localeCompare(String(a.data)),
      );

      const cabecalho = [
        "Data",
        "Descrição",
        "Tipo",
        "Categoria",
        "Método",
        "Valor (R$)",
        "Observação",
      ];

      const linhas = ordenadas.map((t) =>
        [
          dataParaCsv(t.data),
          t.descricao,
          String(t.tipo).toUpperCase() === "ENTRADA" ? "Receita" : "Despesa",
          nomeDaCategoria(t),
          NOMES_METODOS[t.metodo] || t.metodo || "",
          Number(t.valor || 0)
            .toFixed(2)
            .replace(".", ","),
          t.observacao || "",
        ]
          .map(celulaCsv)
          .join(";"),
      );

      // BOM + ";" + vírgula decimal: abre certo no Excel em português
      const conteudo = `﻿${[cabecalho.map(celulaCsv).join(";"), ...linhas].join("\r\n")}`;

      baixarArquivo(
        `finanplan-transacoes-${dataDeHoje()}.csv`,
        conteudo,
        "text/csv;charset=utf-8",
      );

      mostrarToast(`${ordenadas.length} transações exportadas.`);
    } catch (erro) {
      mostrarToast(erro.message || "Não foi possível exportar.", "erro");
    }
  });
}

async function exportarJson() {
  await comCarregamento(btnExportarJson, "Gerando...", async () => {
    try {
      const [transacoes, metas, orcamentos] = await Promise.all([
        buscarLista("/transacoes/listar"),
        buscarLista("/metas/listar"),
        buscarLista("/orcamentos/listar"),
      ]);

      const backup = {
        exportadoEm: new Date().toISOString(),
        usuario: {
          nome: localStorage.getItem("nomeUsuario") || "",
          email: localStorage.getItem("emailUsuario") || "",
        },
        transacoes,
        orcamentos,
        metas,
      };

      baixarArquivo(
        `finanplan-backup-${dataDeHoje()}.json`,
        JSON.stringify(backup, null, 2),
        "application/json",
      );

      mostrarToast("Backup gerado com sucesso!");
    } catch (erro) {
      mostrarToast(erro.message || "Não foi possível gerar o backup.", "erro");
    }
  });
}

/* ================= Segurança ================= */

// Quem entrou com o Google não tem senha do FinanPlan para trocar
function configurarSeguranca(usuario) {
  const temSenha = usuario.providerData.some(
    (provedor) => provedor.providerId === "password",
  );

  camposSenha.hidden = !temSenha;
  avisoSenha.hidden = temSenha;
}

async function atualizarSenha(evento) {
  evento.preventDefault();

  const atual = inputSenhaAtual.value;
  const nova = inputNovaSenha.value;
  const confirmacao = inputConfirmarSenha.value;

  if (!atual) {
    mostrarToast("Digite sua senha atual.", "erro");
    inputSenhaAtual.focus();
    return;
  }

  if (nova.length < 6) {
    mostrarToast("A nova senha deve ter pelo menos 6 caracteres.", "erro");
    inputNovaSenha.focus();
    return;
  }

  if (nova !== confirmacao) {
    mostrarToast("A nova senha e a confirmação não coincidem.", "erro");
    inputConfirmarSenha.focus();
    return;
  }

  if (nova === atual) {
    mostrarToast("A nova senha deve ser diferente da atual.", "erro");
    inputNovaSenha.focus();
    return;
  }

  await comCarregamento(btnAtualizarSenha, "Atualizando...", async () => {
    try {
      const credencial = EmailAuthProvider.credential(
        auth.currentUser.email,
        atual,
      );

      await reauthenticateWithCredential(auth.currentUser, credencial);
    } catch (erro) {
      if (erro?.code === "auth/too-many-requests") {
        mostrarToast(
          "Muitas tentativas. Aguarde alguns minutos e tente de novo.",
          "erro",
        );
      } else if (erro?.code === "auth/network-request-failed") {
        mostrarToast("Sem conexão com a internet.", "erro");
      } else {
        mostrarToast("Senha atual incorreta.", "erro");
      }

      return;
    }

    try {
      await chamarApi("/senha", {
        method: "PUT",
        body: JSON.stringify({ novaSenha: nova }),
      });

      inputSenhaAtual.value = "";
      inputNovaSenha.value = "";
      inputConfirmarSenha.value = "";

      mostrarToast("Senha atualizada com sucesso!");
    } catch (erro) {
      mostrarToast(
        erro.message || "Não foi possível atualizar a senha.",
        "erro",
      );
    }
  });
}

let focoAnterior = null;

function abrirModalExcluir() {
  focoAnterior = document.activeElement;

  inputConfirmarExclusao.value = "";
  btnConfirmarExclusao.disabled = true;

  modalExcluir.classList.add("aberto");

  setTimeout(() => inputConfirmarExclusao.focus(), 50);
}

function fecharModalExcluir() {
  modalExcluir.classList.remove("aberto");

  focoAnterior?.focus?.();
}

function confirmacaoDigitada() {
  return inputConfirmarExclusao.value.trim().toUpperCase() === "EXCLUIR";
}

async function excluirConta() {
  if (!confirmacaoDigitada()) {
    return;
  }

  await comCarregamento(btnConfirmarExclusao, "Excluindo...", async () => {
    try {
      await chamarApi("/conta", { method: "DELETE" });
    } catch (erro) {
      mostrarToast(erro.message || "Não foi possível excluir a conta.", "erro");
      return;
    }

    try {
      await auth.signOut();
    } catch {
    }

    limparSessaoLocal();
    irParaLogin();
  });
}


formPerfil?.addEventListener("submit", salvarPerfil);
formSenha?.addEventListener("submit", atualizarSenha);

inputTelefone?.addEventListener("input", () => {
  inputTelefone.value = formatarTelefone(inputTelefone.value);
});

btnAlterarFoto?.addEventListener("click", () => inputFoto.click());
inputFoto?.addEventListener("change", trocarFoto);
btnRemoverFoto?.addEventListener("click", removerFoto);

btnExportarCsv?.addEventListener("click", exportarCsv);
btnExportarJson?.addEventListener("click", exportarJson);

btnExcluirConta?.addEventListener("click", abrirModalExcluir);
btnCancelarExclusao?.addEventListener("click", fecharModalExcluir);
btnConfirmarExclusao?.addEventListener("click", excluirConta);

inputConfirmarExclusao?.addEventListener("input", () => {
  btnConfirmarExclusao.disabled = !confirmacaoDigitada();
});

inputConfirmarExclusao?.addEventListener("keydown", (evento) => {
  if (evento.key === "Enter") {
    evento.preventDefault();
    excluirConta();
  }
});

modalExcluir?.addEventListener("click", (evento) => {
  if (evento.target === modalExcluir) {
    fecharModalExcluir();
  }
});

document.addEventListener("keydown", (evento) => {
  if (evento.key === "Escape" && modalExcluir.classList.contains("aberto")) {
    fecharModalExcluir();
  }
});


sincronizarPreferencias();
mostrarFoto();

onAuthStateChanged(auth, (usuario) => {
  if (!usuario) {
    irParaLogin();
    return;
  }

  configurarSeguranca(usuario);
  carregarPerfil();
});
