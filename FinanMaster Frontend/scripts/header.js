document.addEventListener("DOMContentLoaded", async () => {
  await carregarHeader();

  iniciarPaginaAtiva();
  iniciarUsuario();
  iniciarTema();
  iniciarMenu();

  window.addEventListener("usuarioAtualizado", iniciarUsuario);
  window.addEventListener("fotoPerfilAtualizada", iniciarUsuario);
});

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
  const paginaAtual = location.pathname.split("/").pop() || "dashboard.html";

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
    if (fotoPerfil) {
      fotoElemento.src = fotoPerfil;
      containerFoto.style.display = "block";
    } else {
      fotoElemento.removeAttribute("src");
      containerFoto.style.display = "none";
    }
  }
}

function iniciarTema() {
  const toggle = document.getElementById("theme-toggle");

  if (!toggle) {
    return;
  }

  const temaSalvo = localStorage.getItem("tema");

  if (temaSalvo === "dark") {
    document.body.classList.add("dark-theme");
    toggle.checked = true;
  }

  toggle.addEventListener("change", () => {
    if (toggle.checked) {
      document.body.classList.add("dark-theme");
      localStorage.setItem("tema", "dark");
    } else {
      document.body.classList.remove("dark-theme");
      localStorage.setItem("tema", "light");
    }
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
