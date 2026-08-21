import {
  GoogleAuthProvider,
  signInWithPopup,
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import { auth } from "./firebase.js";

const googleLogin = document.getElementById("google-login");

let entrandoComGoogle = false;

googleLogin.addEventListener("click", async (event) => {
  event.preventDefault();

  if (entrandoComGoogle) {
    console.log("Login com Google já está em andamento.");
    return;
  }

  entrandoComGoogle = true;
  googleLogin.disabled = true;

  try {
    const provider = new GoogleAuthProvider();

    provider.setCustomParameters({
      prompt: "select_account",
    });

    console.log("Abrindo popup do Google...");

    const resultado = await signInWithPopup(auth, provider);

    const usuario = resultado.user;

    console.log("Login realizado!");
    console.log("Nome:", usuario.displayName);
    console.log("Email:", usuario.email);
    console.log("UID:", usuario.uid);

    window.location.href = "dashboard.html";
  } catch (erro) {
    console.error("Código do erro:", erro.code);
    console.error("Mensagem:", erro.message);

    if (erro.code === "auth/popup-closed-by-user") {
      console.log("Popup fechado pelo usuário.");
    } else if (erro.code === "auth/cancelled-popup-request") {
      console.log("Outra solicitação de popup foi iniciada.");
    } else {
      alert("Erro ao entrar com Google: " + erro.message);
    }
  } finally {
    entrandoComGoogle = false;
    googleLogin.disabled = false;
  }
});
