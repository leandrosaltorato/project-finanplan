import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import { auth } from "../firebase.js";

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
});

onAuthStateChanged(auth, (usuario) => {
  if (!usuario) {
    window.location.href = "index.html";
    return;
  }

  const nomeUsuario = document.getElementById("nome-usuario");
  const fotoPerfil = document.getElementById("foto-perfil");

  if (nomeUsuario) {
    nomeUsuario.textContent = usuario.displayName || "Usuário";
  }

  if (fotoPerfil) {
    if (usuario.photoURL) {
      fotoPerfil.src = usuario.photoURL;
    } else {
      fotoPerfil.src =
        "https://ui-avatars.com/api/?name=" +
        encodeURIComponent(usuario.displayName || "Usuário");
    }
  }
});

function abrirModal() {
  document.getElementById("modal").style.display = "block";
}

window.abrirModal = abrirModal;
