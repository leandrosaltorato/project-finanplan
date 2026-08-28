const prisma = require("../data/prisma");

const cadastrar = async (req, res) => {
  try {
    const { descricao, valor, tipo, categoriaId } = req.body;

    if (!descricao || !valor || !tipo || !categoriaId) {
      return res.status(400).json({
        erro: "Preencha todos os campos"
      });
    }

    const controleId = req.body.controleId || 1;

    const item = await prisma.transacoes.create({
      data: {
        descricao,
        valor: Number(valor),
        tipo,
        categoriaId: Number(categoriaId),
        controleId: Number(controleId),
        data: new Date()
      },
      include: {
        categoria: true
      }
    });

    res.status(201).json(item);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      erro: "Erro ao cadastrar transação",
      detalhes: error.message
    });
  }
};

const listar = async (req, res) => {
  try {
    const lista = await prisma.transacoes.findMany({
      include: {
        categoria: true
      },
      orderBy: {
        data: "desc"
      }
    });

    res.status(200).json(lista);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      erro: "Erro ao buscar transações"
    });
  }
};

const buscar = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await prisma.transacoes.findUnique({
      where: {
        id: Number(id)
      },
      include: {
        categoria: true
      }
    });

    res.status(200).json(item);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      erro: "Erro ao buscar transação"
    });
  }
};

const atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const dados = req.body;

    const item = await prisma.transacoes.update({
      where: {
        id: Number(id)
      },
      data: dados
    });

    res.status(200).json(item);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      erro: "Erro ao atualizar transação"
    });
  }
};

const excluir = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await prisma.transacoes.delete({
      where: {
        id: Number(id)
      }
    });

    res.status(200).json(item);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      erro: "Erro ao excluir transação"
    });
  }
};

module.exports = {
  cadastrar,
  listar,
  buscar,
  atualizar,
  excluir
};
