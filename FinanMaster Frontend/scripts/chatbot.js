// FinanBot: liga a página do assistente (chatbot.html) ao backend de IA.
// Usa os elementos que já existem no HTML: #chat-mensagens, #chat-form, #chat-input,
// #btn-enviar, #chat-sugestoes (.sugestao) e #btn-nova-conversa.
(function () {
  "use strict";

  const API_URL = "http://localhost:3000/chat/mensagem";
  const MAX_HISTORICO = 20; // mensagens anteriores enviadas à IA
  const TIMEOUT_MS = 30000;
  const BOAS_VINDAS =
    "Olá! Eu sou o FinanBot, seu assistente financeiro. Como posso ajudar hoje?";

  // Classes CSS das mensagens (estilizadas em styles/chatbot-whatsapp.css).
  const CLASSES = {
    base: "mensagem",
    usuario: "mensagem-usuario",
    bot: "mensagem-bot",
    primeira: "primeira", // primeira mensagem de uma sequência (ganha o "bico" do balão)
    digitando: "digitando",
    erro: "mensagem-erro",
  };

  const lista = document.getElementById("chat-mensagens");
  const form = document.getElementById("chat-form");
  const campo = document.getElementById("chat-input");
  const botaoEnviar = document.getElementById("btn-enviar");
  const sugestoes = document.getElementById("chat-sugestoes");
  const botaoNova = document.getElementById("btn-nova-conversa");
  if (!lista || !form || !campo) return;

  let historico = []; // { role: 'user' | 'assistant', content }
  let enviando = false;
  let conversa = 0; // muda a cada "Nova conversa" para ignorar respostas antigas
  let ultimoPapel = null;

  const hora = () =>
    new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

  // Deixa o texto da IA mais legível: **negrito** e listas com "•".
  // Tudo entra como texto (nunca como HTML), então é seguro.
  function preencherTexto(el, texto) {
    const limpo = texto.replace(/^[ \t]*[*-][ \t]+/gm, "• ");
    limpo.split(/(\*\*[^*\n]+\*\*)/g).forEach((parte) => {
      if (!parte) return;
      if (/^\*\*[^*\n]+\*\*$/.test(parte)) {
        const forte = document.createElement("strong");
        forte.textContent = parte.slice(2, -2);
        el.appendChild(forte);
      } else {
        el.appendChild(document.createTextNode(parte));
      }
    });
  }

  function adicionarDia() {
    const dia = document.createElement("div");
    dia.className = "chat-dia";
    dia.textContent = "Hoje";
    lista.appendChild(dia);
  }

  function adicionar(papel, texto, extra) {
    const bolha = document.createElement("div");
    const primeira = papel !== ultimoPapel;
    bolha.className = [
      CLASSES.base,
      papel === "usuario" ? CLASSES.usuario : CLASSES.bot,
      primeira ? CLASSES.primeira : "",
      extra,
    ]
      .filter(Boolean)
      .join(" ");
    ultimoPapel = papel;

    const conteudo = document.createElement("span");
    conteudo.className = "mensagem-texto";
    if (papel === "usuario") conteudo.textContent = texto;
    else preencherTexto(conteudo, texto);
    bolha.appendChild(conteudo);

    const info = document.createElement("span");
    info.className = "mensagem-hora";
    info.textContent = hora();
    if (papel === "usuario") {
      const check = document.createElement("span");
      check.className = "mensagem-check";
      check.textContent = "✓";
      info.appendChild(check);
      bolha.check = check;
    }
    bolha.appendChild(info);

    lista.appendChild(bolha);
    lista.scrollTop = lista.scrollHeight;
    return bolha;
  }

  // Balão com três pontinhos animados, enquanto a IA responde.
  function adicionarDigitando() {
    const bolha = document.createElement("div");
    bolha.className = [
      CLASSES.base,
      CLASSES.bot,
      ultimoPapel !== "bot" ? CLASSES.primeira : "",
      CLASSES.digitando,
    ]
      .filter(Boolean)
      .join(" ");
    bolha.setAttribute("aria-label", "Digitando");
    for (let i = 0; i < 3; i += 1)
      bolha.appendChild(document.createElement("span"));
    lista.appendChild(bolha);
    lista.scrollTop = lista.scrollHeight;
    return bolha;
  }

  async function pedirResposta(mensagem) {
    const controle = new AbortController();
    const timer = setTimeout(() => controle.abort(), TIMEOUT_MS);
    try {
      const resposta = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mensagem,
          historico: historico.slice(-MAX_HISTORICO),
        }),
        signal: controle.signal,
      });
      let dados = null;
      try {
        dados = await resposta.json();
      } catch {
        /* resposta sem JSON */
      }
      if (!resposta.ok)
        throw new Error(
          dados?.mensagem || "Não foi possível falar com o assistente.",
        );
      return dados?.resposta || "";
    } catch (erro) {
      if (erro.name === "AbortError")
        throw new Error("O assistente demorou para responder. Tente de novo.");
      if (erro instanceof TypeError)
        throw new Error("Não foi possível conectar ao servidor.");
      throw erro;
    } finally {
      clearTimeout(timer);
    }
  }

  async function enviar(texto) {
    texto = texto.trim();
    if (!texto || enviando) return;

    const minha = conversa;
    enviando = true;
    botaoEnviar.disabled = true;
    campo.value = "";
    if (sugestoes) sugestoes.style.display = "none";
    const minhaBolha = adicionar("usuario", texto);
    const digitando = adicionarDigitando();

    try {
      const resposta = await pedirResposta(texto);
      if (minha !== conversa) return;
      digitando.remove();
      minhaBolha.check.className = "mensagem-check lido";
      adicionar("bot", resposta || "Não consegui responder agora.");
      historico.push(
        { role: "user", content: texto },
        { role: "assistant", content: resposta },
      );
    } catch (erro) {
      if (minha !== conversa) return;
      digitando.remove();
      adicionar("bot", erro.message, CLASSES.erro);
    } finally {
      if (minha === conversa) {
        enviando = false;
        botaoEnviar.disabled = false;
        campo.focus();
      }
    }
  }

  function iniciarConversa() {
    ultimoPapel = null;
    adicionarDia();
    adicionar("bot", BOAS_VINDAS);
  }

  function novaConversa() {
    conversa += 1;
    historico = [];
    enviando = false;
    botaoEnviar.disabled = false;
    lista.innerHTML = "";
    campo.value = "";
    if (sugestoes) sugestoes.style.display = "";
    iniciarConversa();
    campo.focus();
  }

  form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    enviar(campo.value);
  });

  if (sugestoes) {
    sugestoes.addEventListener("click", (ev) => {
      const botao = ev.target.closest(".sugestao");
      if (botao) enviar(botao.textContent);
    });
  }

  if (botaoNova) botaoNova.addEventListener("click", novaConversa);

  iniciarConversa();
})();
