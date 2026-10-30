const { enviarMensagem } = require("../services/chat.service");

const MAX_MENSAGEM = 2000;

async function conversar(req, res) {
  const { mensagem, historico } = req.body ?? {};

  if (typeof mensagem !== "string" || !mensagem.trim()) {
    return res
      .status(400)
      .json({ mensagem: "Envie o campo 'mensagem' com o texto da pergunta." });
  }
  if (mensagem.length > MAX_MENSAGEM) {
    return res
      .status(400)
      .json({
        mensagem: `A mensagem pode ter no máximo ${MAX_MENSAGEM} caracteres.`,
      });
  }

  try {
    const resposta = await enviarMensagem({
      mensagem: mensagem.trim(),
      historico,
    });
    return res.json({ resposta });
  } catch (erro) {
    if (erro.publico) {
      return res.status(erro.status).json({ mensagem: erro.message });
    }
    console.error(erro);
    return res.status(500).json({ mensagem: "Erro interno." });
  }
}

module.exports = { conversar };
