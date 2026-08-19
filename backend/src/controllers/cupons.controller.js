const fs = require("fs");

const prisma = require("../data/prisma");

const { executarTesseract } = require("../ocr/tesseract");
const { extrairTotal } = require("../ocr/extrairTotal");

const processarCupom = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        sucesso: false,
        erro: "Nenhuma imagem foi enviada",
      });
    }

    const { controleId, categoriaId, tipo } = req.body;

    if (!controleId || !categoriaId) {
      fs.unlinkSync(req.file.path);

      return res.status(400).json({
        sucesso: false,
        erro: "controleId e categoriaId são obrigatórios",
      });
    }

    if (tipo !== "ENTRADA" && tipo !== "SAIDA") {
      fs.unlinkSync(req.file.path);

      return res.status(400).json({
        sucesso: false,
        erro: "tipo deve ser ENTRADA ou SAIDA",
      });
    }

    const texto = await executarTesseract(req.file.path);
    const valor = extrairTotal(texto);

    if (valor === null || valor === undefined) {
      fs.unlinkSync(req.file.path);

      return res.status(400).json({
        sucesso: false,
        erro: "Não foi possível identificar o valor do cupom",
        texto: texto,
      });
    }

    const controleIdNumero = Number(controleId);
    const categoriaIdNumero = Number(categoriaId);

    const controle = await prisma.controle.findUnique({
      where: {
        id: controleIdNumero,
      },
    });

    if (!controle) {
      fs.unlinkSync(req.file.path);

      return res.status(404).json({
        sucesso: false,
        erro: "Controle não encontrado",
      });
    }

    const categoria = await prisma.categoria.findUnique({
      where: {
        id: categoriaIdNumero,
      },
    });

    if (!categoria) {
      fs.unlinkSync(req.file.path);

      return res.status(404).json({
        sucesso: false,
        erro: "Categoria não encontrada",
      });
    }

    const resultado = await prisma.$transaction(async (tx) => {
      const transacao = await tx.transacoes.create({
        data: {
          data: new Date(),
          valor: valor,
          tipo: tipo,
          descricao: "Compra via cupom fiscal",
          controleId: controleIdNumero,
          categoriaId: categoriaIdNumero,
          autoCategoria: true,
        },
      });

      const novoControle = await tx.controle.update({
        where: {
          id: controleIdNumero,
        },
        data: {
          saldo:
            tipo === "ENTRADA"
              ? {
                  increment: valor,
                }
              : {
                  decrement: valor,
                },
        },
      });

      return {
        transacao,
        controle: novoControle,
      };
    });

    fs.unlinkSync(req.file.path);

    return res.status(201).json({
      sucesso: true,
      valor: valor,
      transacao: resultado.transacao,
      saldoAtual: resultado.controle.saldo,
    });
  } catch (error) {
    console.error("Erro no processamento do cupom:", error);

    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (erroArquivo) {
        console.error("Erro ao remover arquivo:", erroArquivo);
      }
    }

    return res.status(500).json({
      sucesso: false,
      erro: "Erro ao processar o cupom",
    });
  }
};

module.exports = {
  processarCupom,
};