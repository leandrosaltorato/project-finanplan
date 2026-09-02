const fs = require("fs");

const prisma = require("../data/prisma");

const { executarTesseract } = require("../ocr/tesseract");
const { extrairTotal } = require("../ocr/extrairTotal");

const removerArquivo = async (caminho) => {
  try {
    if (caminho && fs.existsSync(caminho)) {
      await fs.promises.unlink(caminho);
      console.log("Arquivo removido:", caminho);
    }
  } catch (error) {
    console.error("Erro ao remover arquivo:", error.message);
  }
};

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
      await removerArquivo(req.file.path);

      return res.status(400).json({
        sucesso: false,
        erro: "controleId e categoriaId são obrigatórios",
      });
    }

    if (tipo !== "ENTRADA" && tipo !== "SAIDA") {
      await removerArquivo(req.file.path);

      return res.status(400).json({
        sucesso: false,
        erro: "tipo deve ser ENTRADA ou SAIDA",
      });
    }

    const texto = await executarTesseract(req.file.path);

    const valor = extrairTotal(texto);

    console.log("VALOR EXTRAÍDO:", valor);

    if (valor === null || valor === undefined || valor <= 0) {
      await removerArquivo(req.file.path);

      return res.status(400).json({
        sucesso: false,
        erro: "Não foi possível identificar um valor válido no cupom",
        texto,
      });
    }

    const controleIdNumero = Number(controleId);
    const categoriaIdNumero = Number(categoriaId);

    await prisma.$connect();

    const controle = await prisma.controle.findUnique({
      where: {
        id: controleIdNumero,
      },
    });

    if (!controle) {
      await removerArquivo(req.file.path);

      return res.status(404).json({
        sucesso: false,
        erro: "Controle não encontrado",
      });
    }
    console.log("Saldo atual:", controle.saldo);

    const categoria = await prisma.categoria.findUnique({
      where: {
        id: categoriaIdNumero,
      },
    });

    if (!categoria) {
      await removerArquivo(req.file.path);

      return res.status(404).json({
        sucesso: false,
        erro: "Categoria não encontrada",
      });
    }

    const resultado = await prisma.$transaction(async (tx) => {
      const transacao = await tx.transacoes.create({
        data: {
          data: new Date(),
          valor,
          tipo,
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

    await removerArquivo(req.file.path);

    return res.status(201).json({
      sucesso: true,
      valor,
      transacao: resultado.transacao,
      saldoAtual: resultado.controle.saldo,
    });
  } catch (error) {
    console.error("Erro ao processar cupom:", error);

    if (req.file) {
      await removerArquivo(req.file.path);
    }

    return res.status(500).json({
      sucesso: false,
      erro: "Erro ao processar o cupom",
      detalhe: error.message,
    });
  }
};

module.exports = {
  processarCupom,
};
