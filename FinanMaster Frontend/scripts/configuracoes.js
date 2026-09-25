import {
  getAuth,
  onAuthStateChanged,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import { app } from "../firebase.js";

const auth = getAuth(app);

const API_URL = "http://localhost:3000/config";

const inputNome = document.getElementById("nome");
const inputEmail = document.getElementById("email");
const inputTelefone = document.getElementById("telefone");

const inputSenhaAtual = document.getElementById("senha-atual");
const inputNovaSenha = document.getElementById("nova-senha");
const inputConfirmarSenha = document.getElementById("confirmar-senha");

const btnSalvarPerfil = document.getElementById("btn-salvar-perfil");
const btnAtualizarSenha = document.getElementById("btn-atualizar-senha");
const btnExcluirConta = document.getElementById("btn-excluir-conta");

const btnAlterarFoto = document.getElementById("btn-alterar-foto");
const inputFoto = document.getElementById("input-foto");
const fotoConfig = document.getElementById("foto-config");

const toggleTema = document.getElementById("config-tema-toggle");

if (toggleTema) {
  const temaSalvo = localStorage.getItem("tema");

  if (temaSalvo === "dark") {
    document.body.classList.add("dark-theme");
    toggleTema.checked = true;
  }

  toggleTema.addEventListener("change", () => {
    if (toggleTema.checked) {
      document.body.classList.add("dark-theme");
      localStorage.setItem("tema", "dark");
    } else {
      document.body.classList.remove("dark-theme");
      localStorage.setItem("tema", "light");
    }
  });
}

async function obterToken() {
  const usuario = auth.currentUser;

  if (!usuario) {
    window.location.href = "login.html";
    return null;
  }

  return usuario.getIdToken();
}

async function carregarPerfil() {
  const token = await obterToken();
  if (!token) return;

  const resposta = await fetch(`${API_URL}/perfil`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const dados = await resposta.json();

  if (resposta.ok) {
    inputNome.value = dados.nome || "";
    inputEmail.value = dados.email || "";
    inputTelefone.value = dados.Telefone || "";
  } else {
    alert(dados.erro || "Não foi possível carregar o perfil.");
  }
}

async function salvarPerfil() {
  const token = await obterToken();
  if (!token) return;

  const resposta = await fetch(`${API_URL}/perfil`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      nome: inputNome.value,
      email: inputEmail.value,
      telefone: inputTelefone.value,
    }),
  });

  const dados = await resposta.json();

  if (resposta.ok) {
    localStorage.setItem("nomeUsuario", dados.nome);
    localStorage.setItem("emailUsuario", dados.email);

    alert("Perfil atualizado com sucesso!");

    window.dispatchEvent(new CustomEvent("usuarioAtualizado"));
  } else {
    alert(dados.erro || "Não foi possível atualizar o perfil.");
  }
}

async function atualizarSenha() {
  if (inputNovaSenha.value !== inputConfirmarSenha.value) {
    alert("A nova senha e a confirmação não coincidem.");
    return;
  }

  if (inputNovaSenha.value.length < 6) {
    alert("A nova senha deve ter pelo menos 6 caracteres.");
    return;
  }

  try {
    const credencial = EmailAuthProvider.credential(
      auth.currentUser.email,
      inputSenhaAtual.value,
    );
    await reauthenticateWithCredential(auth.currentUser, credencial);
  } catch (erro) {
    alert("Senha atual incorreta.");
    return;
  }

  const token = await obterToken();
  if (!token) return;

  const resposta = await fetch(`${API_URL}/senha`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ novaSenha: inputNovaSenha.value }),
  });

  const dados = await resposta.json();

  if (resposta.ok) {
    alert("Senha atualizada com sucesso!");
    inputSenhaAtual.value = "";
    inputNovaSenha.value = "";
    inputConfirmarSenha.value = "";
  } else {
    alert(dados.erro || "Não foi possível atualizar a senha.");
  }
}

function carregarFotoPerfil() {
  const foto = localStorage.getItem("fotoPerfil");

  if (fotoConfig && foto) {
    fotoConfig.src = foto;
  }
}

btnAlterarFoto?.addEventListener("click", () => {
  inputFoto?.click();
});

inputFoto?.addEventListener("change", () => {
  const arquivo = inputFoto.files[0];

  if (!arquivo) {
    return;
  }

  if (!arquivo.type.startsWith("image/")) {
    alert("Selecione uma imagem.");
    return;
  }

  const leitor = new FileReader();

  leitor.onload = () => {
    const foto = leitor.result;

    localStorage.setItem("fotoPerfil", foto);

    if (fotoConfig) {
      fotoConfig.src = foto;
    }

    window.dispatchEvent(new CustomEvent("fotoPerfilAtualizada"));

    alert("Foto atualizada com sucesso!");
  };

  leitor.readAsDataURL(arquivo);
});


async function excluirConta() {
  const confirmar = confirm(
    "Tem certeza que deseja excluir sua conta? Essa ação não pode ser desfeita.",
  );
  if (!confirmar) return;

  const token = await obterToken();
  if (!token) return;

  const resposta = await fetch(`${API_URL}/conta`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (resposta.ok) {
    await auth.signOut();
    window.location.href = "login.html";
  } else {
    const dados = await resposta.json();
    alert(dados.erro || "Não foi possível excluir a conta.");
  }
}

carregarFotoPerfil();

onAuthStateChanged(auth, (usuario) => {
  if (usuario) {
    carregarPerfil();
  } else {
    window.location.href = "login.html";
  }
});

btnSalvarPerfil?.addEventListener("click", salvarPerfil);
btnAtualizarSenha?.addEventListener("click", atualizarSenha);
btnExcluirConta?.addEventListener("click", excluirConta);
