const prisma = require("../data/prisma")

async function listar(req, res) {
  try {
    const controleId = Number(req.query.controleId);

    if (!controleId) {
      return res.status(400).json({ erro: "controleId é obrigatório." });
    }

    const metas = await prisma.meta.findMany({
      where: { controleId },
      orderBy: { criadoEm: "desc" },
    });

    return res.json(metas);
  } catch (error) {
    console.error("Erro ao listar metas:", error);

    return res.status(500).json({
      erro: "Erro ao listar metas",
      detalhes: error.message,
    });
  }
}

async function cadastrar(req, res) {
  try {
    const {
      titulo,
      descricao,
      icone,
      valorAlvo,
      valorAtual,
      dataLimite,
      controleId,
    } = req.body;

    if (!titulo || !valorAlvo || !controleId) {
      return res.status(400).json({
        erro: "Preencha título, valor alvo e controleId.",
      });
    }

    const meta = await prisma.meta.create({
      data: {
        titulo,
        descricao: descricao || null,
        icone: icone || "flag",
        valorAlvo: Number(valorAlvo),
        valorAtual: Number(valorAtual) || 0,
        dataLimite: dataLimite ? new Date(dataLimite) : null,
        controleId: Number(controleId),
      },
    });

    return res.status(201).json(meta);
  } catch (error) {
    console.error("Erro ao cadastrar meta:", error);

    return res.status(500).json({
      erro: "Erro ao cadastrar meta",
      detalhes: error.message,
    });
  }
}

async function atualizar(req, res) {
  try {
    const id = Number(req.params.id);
    const { titulo, descricao, icone, valorAlvo, valorAtual, dataLimite } =
      req.body;

    const metaExistente = await prisma.meta.findUnique({ where: { id } });

    if (!metaExistente) {
      return res.status(404).json({ erro: "Meta não encontrada." });
    }

    const meta = await prisma.meta.update({
      where: { id },
      data: {
        ...(titulo !== undefined && { titulo }),
        ...(descricao !== undefined && { descricao }),
        ...(icone !== undefined && { icone }),
        ...(valorAlvo !== undefined && { valorAlvo: Number(valorAlvo) }),
        ...(valorAtual !== undefined && { valorAtual: Number(valorAtual) }),
        ...(dataLimite !== undefined && {
          dataLimite: dataLimite ? new Date(dataLimite) : null,
        }),
      },
    });

    return res.json(meta);
  } catch (error) {
    console.error("Erro ao atualizar meta:", error);

    return res.status(500).json({
      erro: "Erro ao atualizar meta",
      detalhes: error.message,
    });
  }
}

async function depositar(req, res) {
  try {
    const id = Number(req.params.id);
    const valor = Number(req.body.valor);

    if (!id || !valor || valor <= 0) {
      return res.status(400).json({
        erro: "Informe um valor válido para o depósito.",
      });
    }

    const metaExistente = await prisma.meta.findUnique({ where: { id } });

    if (!metaExistente) {
      return res.status(404).json({ erro: "Meta não encontrada." });
    }

    const novoValorAtual = Number(metaExistente.valorAtual) + valor;

    const meta = await prisma.meta.update({
      where: { id },
      data: { valorAtual: novoValorAtual },
    });

    return res.json(meta);
  } catch (error) {
    console.error("Erro ao depositar na meta:", error);

    return res.status(500).json({
      erro: "Erro ao depositar na meta",
      detalhes: error.message,
    });
  }
}

async function excluir(req, res) {
  try {
    const id = Number(req.params.id);

    const metaExistente = await prisma.meta.findUnique({ where: { id } });

    if (!metaExistente) {
      return res.status(404).json({ erro: "Meta não encontrada." });
    }

    await prisma.meta.delete({ where: { id } });

    return res.json({ mensagem: "Meta excluída com sucesso." });
  } catch (error) {
    console.error("Erro ao excluir meta:", error);

    return res.status(500).json({
      erro: "Erro ao excluir meta",
      detalhes: error.message,
    });
  }
}

module.exports = {
  listar,
  cadastrar,
  atualizar,
  depositar,
  excluir,
};