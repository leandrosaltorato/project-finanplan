const MAX_HISTORICO = 20;
const MAX_CARACTERES = 4000;

const SYSTEM_PROMPT = `Você é o FinanBot, assistente financeiro do FinanPlan, aplicativo de planejamento financeiro pessoal.
Responda sempre em português do Brasil, de forma clara, simpática e objetiva.
Ajude com educação financeira, orçamento, formas de economizar, metas, dívidas e uso do sistema (receitas, despesas, categorias e metas).
Você não tem acesso aos dados financeiros do usuário (saldo, gastos ou metas). Se perguntarem por esses dados, diga que não consegue consultá-los e sugira ver a tela correspondente do sistema.
Não dê recomendações de investimento específicas nem prometa retorno. Para decisões importantes, sugira procurar um profissional.
Se não souber algo, diga que não sabe em vez de inventar.`;

function erroPublico(mensagem, status) {
  const erro = new Error(mensagem);
  erro.status = status;
  erro.publico = true;
  return erro;
}

function montarConteudo(historico, mensagem) {
  const anteriores = (Array.isArray(historico) ? historico : [])
    .filter(
      (m) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim(),
    )
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CARACTERES) }))
    .slice(-MAX_HISTORICO);

  while (anteriores.length && anteriores[0].role !== "user") anteriores.shift();

  return [...anteriores, { role: "user", content: mensagem }].map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
}

async function enviarMensagem({ mensagem, historico }) {
  const chave = process.env.GEMINI_API_KEY;
  if (!chave)
    throw erroPublico("O chat não está configurado no servidor.", 503);

  const modelo = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelo)}:generateContent`;

  let resposta;
  try {
    resposta = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": chave },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: montarConteudo(historico, mensagem),
        generationConfig: {
          maxOutputTokens: Number(process.env.CHAT_MAX_TOKENS || 1024),
        },
      }),
    });
  } catch (erro) {
    console.error("Erro de rede no chat:", erro.message);
    throw erroPublico(
      "Não foi possível falar com o assistente agora. Tente novamente.",
      502,
    );
  }

  if (!resposta.ok) {
    const detalhe = await resposta.text().catch(() => "");
    console.error("Erro no chat:", resposta.status, detalhe.slice(0, 300));
    if (resposta.status === 429) {
      throw erroPublico(
        "O chat atingiu o limite gratuito. Tente novamente em instantes.",
        429,
      );
    }
    throw erroPublico(
      "Não foi possível falar com o assistente agora. Tente novamente.",
      502,
    );
  }

  const dados = await resposta.json();
  const texto = (dados.candidates?.[0]?.content?.parts ?? [])
    .map((parte) => parte.text ?? "")
    .join("")
    .trim();

  return (
    texto || "Não consegui gerar uma resposta. Tente reformular a pergunta."
  );
}

module.exports = { enviarMensagem };
