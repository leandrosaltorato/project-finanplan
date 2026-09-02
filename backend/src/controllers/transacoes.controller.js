const prisma = require("../data/prisma");

const cadastrar = async (req, res) => {
  try {
    const { descricao, valor, tipo, categoriaId } = req.body;
    const controleId = Number(req.body.controleId || 1);

    if (!descricao || !valor || !tipo || !categoriaId) {
      return res.status(400).json({
        erro: "Preencha todos os campos",
      });
    }

    const item = await prisma.transacoes.create({
      data: {
        descricao,
        valor: Number(valor),
        tipo,
        categoriaId: Number(categoriaId),
        controleId,
        data: new Date(),
      },
      include: {
        categoria: true,
      },
    });

    return res.status(201).json(item);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      erro: "Erro ao cadastrar transação",
      detalhes: error.message,
    });
  }
};

const listar = async (req, res) => {
  try {
    const lista = await prisma.transacoes.findMany({
      include: {
        categoria: true,
      },
      orderBy: {
        id: "desc",
      },
    });

    return res.status(200).json(lista);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      erro: "Erro ao listar transações",
      detalhes: error.message,
    });
  }
};

const buscar = async (req, res) => {
  try {
    const item = await prisma.transacoes.findUnique({
      where: {
        id: Number(req.params.id),
      },
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
    console.error(error);

    return res.status(500).json({
      erro: "Erro ao buscar transação",
      detalhes: error.message,
    });
  }
};

const atualizar = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { descricao, tipo } = req.body;
    const valor = Number(req.body.valor);
    const categoriaId = Number(req.body.categoriaId);
    const controleId = Number(req.body.controleId || 1);

    if (!descricao || !valor || !tipo || !categoriaId) {
      return res.status(400).json({
        erro: "Preencha todos os campos obrigatórios",
      });
    }

    const item = await prisma.transacoes.update({
      where: {
        id,
      },
      data: {
        descricao,
        valor,
        tipo,
        categoriaId,
        controleId,
      },
      include: {
        categoria: true,
      },
    });

    return res.status(200).json(item);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      erro: "Erro ao atualizar transação",
      detalhes: error.message,
    });
  }
};

const excluir = async (req, res) => {
  try {
    const item = await prisma.transacoes.delete({
      where: {
        id: Number(req.params.id),
      },
    });

    return res.status(200).json(item);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      erro: "Erro ao excluir transação",
      detalhes: error.message,
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
