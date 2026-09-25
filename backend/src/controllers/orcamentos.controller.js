const prisma = require("../data/prisma");

function obterIntervaloMesAtual() {
  const hoje = new Date();

  const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 1);

  return { inicio, fim };
}

const cadastrar = async (req, res) => {
  try {
    const { categoriaId, limite } = req.body;
    const controleId = Number(req.body.controleId || 1);

    if (!categoriaId || !limite) {
      return res.status(400).json({
        erro: "Preencha todos os campos",
      });
    }

    const existente = await prisma.orcamento.findFirst({
      where: {
        controleId,
        categoriaId: Number(categoriaId),
      },
    });

    if (existente) {
      return res.status(409).json({
        erro: "Já existe um orçamento cadastrado para essa categoria",
      });
    }

    const item = await prisma.orcamento.create({
      data: {
        limite: Number(limite),
        categoriaId: Number(categoriaId),
        controleId,
      },
      include: {
        categoria: true,
      },
    });

    return res.status(201).json(item);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      erro: "Erro ao cadastrar orçamento",
      detalhes: error.message,
    });
  }
};

const listar = async (req, res) => {
  try {
    const controleId = Number(req.query.controleId || 1);

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

    const { inicio, fim } = obterIntervaloMesAtual();

    const resultado = await Promise.all(
      orcamentos.map(async (orcamento) => {
        const agregado = await prisma.transacoes.aggregate({
          where: {
            controleId,
            categoriaId: orcamento.categoriaId,
            tipo: "SAIDA",
            data: {
              gte: inicio,
              lt: fim,
            },
          },
          _sum: {
            valor: true,
          },
        });

        return {
          ...orcamento,
          gasto: agregado._sum.valor || 0,
        };
      }),
    );

    return res.status(200).json(resultado);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      erro: "Erro ao listar orçamentos",
      detalhes: error.message,
    });
  }
};

const excluir = async (req, res) => {
  try {
    const item = await prisma.orcamento.delete({
      where: {
        id: Number(req.params.id),
      },
    });

    return res.status(200).json(item);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      erro: "Erro ao excluir orçamento",
      detalhes: error.message,
    });
  }
};

module.exports = {
  cadastrar,
  listar,
  excluir,
};