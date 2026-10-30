
const prisma = require("../data/prisma");

const categoriasPadrao = [
  { nome: "Alimentação", tipo: "ALIMENTACAO", cor: "#FF9800" },
  { nome: "Lazer", tipo: "LAZER", cor: "#9C27B0" },
  { nome: "Educação", tipo: "EDUCACAO", cor: "#2196F3" },
  { nome: "Transporte", tipo: "TRANSPORTE", cor: "#4CAF50" },
  { nome: "Saúde", tipo: "SAUDE", cor: "#F44336" },
  { nome: "Outros", tipo: "OUTROS", cor: "#607D8B" },
];

async function garantirCategoriasPadrao() {
  for (const categoria of categoriasPadrao) {
    await prisma.categoria.upsert({
      where: {
        nome: categoria.nome,
      },
      update: {},
      create: categoria,
    });
  }

  console.log("Categorias padrão verificadas.");
}

module.exports = { garantirCategoriasPadrao };
