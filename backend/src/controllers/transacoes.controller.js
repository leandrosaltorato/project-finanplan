
const prisma = require("../data/prisma");

const calcularSaldoDisponivel = async (
  controleId,
  ignorarTransacaoId = null,
) => {
  const transacoes = await prisma.transacoes.findMany({
    where: {
      controleId,
      ...(ignorarTransacaoId !== null
        ? {
            id: {
              not: ignorarTransacaoId,
            },
          }
        : {}),
    },
    select: {
      valor: true,
      tipo: true,
    },
  });

  return transacoes.reduce((saldo, transacao) => {
    const valor = Number(transacao.valor);
    const tipo = String(transacao.tipo).toUpperCase();

    if (tipo === "ENTRADA") {
      return saldo + valor;
    }

    if (tipo === "SAIDA") {
      return saldo - valor;
    }

    return saldo;
  }, 0);
};

const cadastrar = async (req, res) => {
  try {
    const { descricao, tipo, categoriaId } = req.body;
    const valor = Number(req.body.valor);
    const controleId = Number(req.body.controleId || 1);
    const categoria = Number(categoriaId);

    if (
      typeof descricao !== "string" ||
      !descricao.trim() ||
      req.body.valor === "" ||
      req.body.valor === null ||
      req.body.valor === undefined ||
      !Number.isFinite(valor) ||
      valor <= 0 ||
      !["ENTRADA", "SAIDA"].includes(tipo) ||
      !Number.isInteger(categoria) ||
      categoria <= 0 ||
      !Number.isInteger(controleId) ||
      controleId <= 0
    ) {
      return res.status(400).json({
        erro: "Preencha os campos com valores válidos.",
      });
    }
    if (tipo === "SAIDA") {
      const saldoDisponivel =
        await calcularSaldoDisponivel(controleId);

      if (valor > saldoDisponivel) {
        return res.status(400).json({
          erro: "Saldo insuficiente para realizar esta transação.",
          saldoDisponivel: Math.max(0, saldoDisponivel),
        });
      }
    }

    const item = await prisma.transacoes.create({
      data: {
        descricao: descricao.trim(),
        valor,
        tipo,
        categoriaId: categoria,
        controleId,
        data: new Date(),
      },
      include: {
        categoria: true,
      },
    });

    return res.status(201).json(item);
  } catch (error) {
    console.error("Erro ao cadastrar transação:", error);

    return res.status(500).json({
      erro: "Erro ao cadastrar transação",
    });
  }
};

// Listar transações
const listar = async (req, res) => {
  try {
    const controleId = Number(req.query.controleId);

    const lista = await prisma.transacoes.findMany({
      where: Number.isInteger(controleId) && controleId > 0
        ? { controleId }
        : {},
      include: {
        categoria: true,
      },
      orderBy: {
        id: "desc",
      },
    });

    return res.status(200).json(lista);
  } catch (error) {
    console.error("Erro ao listar transações:", error);

    return res.status(500).json({
      erro: "Erro ao listar transações",
    });
  }
};

// Buscar transação por ID
const buscar = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        erro: "ID de transação inválido.",
      });
    }

    const item = await prisma.transacoes.findUnique({
      where: { id },
      include: {
        categoria: true,
      },
    });

    if (!item) {
      return res.status(404).json({
        erro: "Transação não encontrada",
      });
    }

    return res.status(200).json(item);
  } catch (error) {
    console.error("Erro ao buscar transação:", error);

    return res.status(500).json({
      erro: "Erro ao buscar transação",
    });
  }
};

// Atualizar transação
const atualizar = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { descricao, tipo, categoriaId } = req.body;
    const valor = Number(req.body.valor);
    const categoria = Number(categoriaId);
    const controleId = Number(req.body.controleId || 1);

    if (
      !Number.isInteger(id) ||
      id <= 0 ||
      typeof descricao !== "string" ||
      !descricao.trim() ||
      req.body.valor === "" ||
      req.body.valor === null ||
      req.body.valor === undefined ||
      !Number.isFinite(valor) ||
      valor <= 0 ||
      !["ENTRADA", "SAIDA"].includes(tipo) ||
      !Number.isInteger(categoria) ||
      categoria <= 0 ||
      !Number.isInteger(controleId) ||
      controleId <= 0
    ) {
      return res.status(400).json({
        erro: "Preencha os campos obrigatórios corretamente.",
      });
    }

    const transacaoAtual = await prisma.transacoes.findUnique({
      where: { id },
    });

    if (!transacaoAtual) {
      return res.status(404).json({
        erro: "Transação não encontrada",
      });
    }

    if (transacaoAtual.controleId !== controleId) {
      return res.status(400).json({
        erro: "A transação não pertence à conta informada.",
      });
    }

    // Ao editar uma despesa, não conta o valor antigo dela
    // no cálculo do saldo disponível.
    if (tipo === "SAIDA") {
      const saldoDisponivel = await calcularSaldoDisponivel(
        controleId,
        id,
      );

      if (valor > saldoDisponivel) {
        return res.status(400).json({
          erro: "Saldo insuficiente para realizar esta transação.",
          saldoDisponivel: Math.max(0, saldoDisponivel),
        });
      }
    }

    const item = await prisma.transacoes.update({
      where: { id },
      data: {
        descricao: descricao.trim(),
        valor,
        tipo,
        categoriaId: categoria,
        controleId,
      },
      include: {
        categoria: true,
      },
    });

    return res.status(200).json(item);
  } catch (error) {
    console.error("Erro ao atualizar transação:", error);

    return res.status(500).json({
      erro: "Erro ao atualizar transação",
    });
  }
};

// Excluir transação
const excluir = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        erro: "ID de transação inválido.",
      });
    }

    const item = await prisma.transacoes.delete({
      where: { id },
    });

    return res.status(200).json(item);
  } catch (error) {
    console.error("Erro ao excluir transação:", error);

    if (error.code === "P2025") {
      return res.status(404).json({
        erro: "Transação não encontrada",
      });
    }

    return res.status(500).json({
      erro: "Erro ao excluir transação",
    });
  }
};

module.exports = {
  cadastrar,
  listar,
  buscar,
  atualizar,
  excluir,
};
