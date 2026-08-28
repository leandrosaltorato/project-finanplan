import {
  GoogleAuthProvider,
  signInWithPopup,
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import { auth } from "./firebase.js";

const API_URL = "http://localhost:3000";

const loginForm = document.getElementById("login-form");
const googleLogin = document.getElementById("google-login");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value;

  if (!email || !senha) {
    alert("Preencha o e-mail e a senha.");
    return;
  }

  const botao = document.getElementById("botao-entrar");

  botao.disabled = true;
  botao.textContent = "Entrando...";

  try {
    const resposta = await fetch(`${API_URL}/usuarios/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        senha,
      }),
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      alert(dados.erro || "E-mail ou senha incorretos.");
      return;
    }

    localStorage.clear();

    localStorage.setItem("usuarioId", String(dados.usuario.id));
    localStorage.setItem("controleId", String(dados.controleId));
    localStorage.setItem("nomeUsuario", dados.usuario.nome);
    localStorage.setItem("tipoLogin", "normal");

    window.location.href = "dashboard.html";
  } catch (error) {
    console.error("Erro no login:", error);
    alert("Não foi possível conectar ao servidor.");
  } finally {
    botao.disabled = false;
    botao.textContent = "Entrar";
  }
});

googleLogin.addEventListener("click", async (event) => {
  event.preventDefault();

  googleLogin.disabled = true;

  try {
    const provider = new GoogleAuthProvider();

    provider.setCustomParameters({
      prompt: "select_account",
    });

    const resultado = await signInWithPopup(auth, provider);
    const usuario = resultado.user;
    const idToken = await usuario.getIdToken();

    const resposta = await fetch(`${API_URL}/usuarios/google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(dados.erro || "Erro ao entrar com Google");
    }

    localStorage.clear();

    localStorage.setItem("usuarioId", String(dados.usuario.id));
    localStorage.setItem("controleId", String(dados.controleId));
    localStorage.setItem(
      "nomeUsuario",
      dados.usuario.nome || usuario.displayName || "Usuário",
    );
    localStorage.setItem("tipoLogin", "google");
    localStorage.setItem("fotoPerfil", usuario.photoURL || "");

    window.location.href = "dashboard.html";
  } catch (erro) {
    console.error("Erro no Google:", erro);

    if (erro.code !== "auth/popup-closed-by-user") {
      alert(erro.message || "Erro ao entrar com Google.");
    }
  } finally {
    googleLogin.disabled = false;
  }
});

const registrar = document.getElementById("registrar");

if (registrar) {
  registrar.addEventListener("click", (event) => {
    event.preventDefault();
    window.location.href = "cadastro.html";
  });
}

const esqueciSenha = document.getElementById("esqueci-senha");

if (esqueciSenha) {
  esqueciSenha.addEventListener("click", (event) => {
    event.preventDefault();
    alert("A recuperação de senha será implementada.");
  });
}
