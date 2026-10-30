const prisma = require("../data/prisma");

function obterIntervaloMesAtual() {
  const hoje = new Date();

  const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

  const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 1);

  return { inicio, fim };
}

const cadastrar = async (req, res) => {
  try {
    const categoriaId = Number(req.body.categoriaId);
    const limite = Number(req.body.limite);
    const controleId = Number(req.body.controleId);

    if (
      !Number.isInteger(categoriaId) ||
      categoriaId <= 0 ||
      !Number.isFinite(limite) ||
      limite <= 0 ||
      !Number.isInteger(controleId) ||
      controleId <= 0
    ) {
      return res.status(400).json({
        erro: "Informe uma categoria, um limite válido e um controle financeiro.",
      });
    }

    const categoria = await prisma.categoria.findUnique({
      where: { id: categoriaId },
    });

    if (!categoria) {
      return res.status(404).json({
        erro: "Categoria não encontrada.",
      });
    }

    const controle = await prisma.controle.findUnique({
      where: { id: controleId },
    });

    if (!controle) {
      return res.status(404).json({
        erro: "Controle financeiro não encontrado.",
      });
    }

    const existente = await prisma.orcamento.findFirst({
      where: {
        controleId,
        categoriaId,
      },
    });

    if (existente) {
      return res.status(409).json({
        erro: "Já existe um orçamento cadastrado para essa categoria.",
      });
    }

    const item = await prisma.orcamento.create({
      data: {
        limite,
        categoriaId,
        controleId,
      },
      include: {
        categoria: true,
      },
    });

    return res.status(201).json({
      ...item,
      gasto: 0,
    });
  } catch (error) {
    console.error("Erro ao cadastrar orçamento:", error);

    return res.status(500).json({
      erro: "Erro ao cadastrar orçamento.",
      detalhes: error.message,
    });
  }
};

const listar = async (req, res) => {
  try {
    const controleId = Number(req.query.controleId);

    if (!Number.isInteger(controleId) || controleId <= 0) {
      return res.status(400).json({
        erro: "Informe um controle financeiro válido.",
      });
    }

    const { inicio, fim } = obterIntervaloMesAtual();

    const orcamentos = await prisma.orcamento.findMany({
      where: {
        controleId,
      },
      include: {
        categoria: true,
      },
      orderBy: {
        id: "desc",
      },
    });

    const resultado = await Promise.all(
      orcamentos.map(async (orcamento) => {
        const transacoes = await prisma.transacoes.findMany({
          where: {
            controleId,
            categoriaId: orcamento.categoriaId,
            tipo: "SAIDA",
            data: {
              gte: inicio,
              lt: fim,
            },
          },
          select: {
            id: true,
            valor: true,
            categoriaId: true,
            controleId: true,
            tipo: true,
            data: true,
          },
        });

        const gasto = transacoes.reduce((total, transacao) => {
          const valor = Number(transacao.valor);

          return total + (Number.isFinite(valor) ? valor : 0);
        }, 0);

        return {
          ...orcamento,
          gasto,
        };
      }),
    );

    return res.status(200).json(resultado);
  } catch (error) {
    console.error("Erro ao listar orçamentos:", error);

    return res.status(500).json({
      erro: "Erro ao listar orçamentos.",
      detalhes: error.message,
    });
  }
};

const excluir = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        erro: "ID do orçamento inválido.",
      });
    }

    const item = await prisma.orcamento.delete({
      where: { id },
    });

    return res.status(200).json(item);
  } catch (error) {
    console.error("Erro ao excluir orçamento:", error);

    if (error.code === "P2025") {
      return res.status(404).json({
        erro: "Orçamento não encontrado.",
      });
    }

    return res.status(500).json({
      erro: "Erro ao excluir orçamento.",
      detalhes: error.message,
    });
  }
};

module.exports = {
  cadastrar,
  listar,
  excluir,
};
