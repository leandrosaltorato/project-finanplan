const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const categorias = [
    {
      nome: "Alimentação",
      tipo: "ALIMENTACAO",
      cor: "#10B981"
    },
    {
      nome: "Lazer",
      tipo: "LAZER",
      cor: "#8B5CF6"
    },
    {
      nome: "Educação",
      tipo: "EDUCACAO",
      cor: "#3B82F6"
    },
    {
      nome: "Transporte",
      tipo: "TRANSPORTE",
      cor: "#F59E0B"
    },
    {
      nome: "Saúde",
      tipo: "SAUDE",
      cor: "#EF4444"
    },
    {
      nome: "Outros",
      tipo: "OUTROS",
      cor: "#6B7280"
    }
  ];

  for (const categoria of categorias) {
    await prisma.categoria.upsert({
      where: {
        nome: categoria.nome
      },
      update: {},
      create: categoria
    });
  }

  console.log("Categorias cadastradas com sucesso!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
