/*
  Warnings:

  - A unique constraint covering the columns `[nome,movimento]` on the table `Categoria` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `Categoria_nome_key` ON `categoria`;

-- AlterTable
ALTER TABLE `categoria` ADD COLUMN `movimento` ENUM('ENTRADA', 'SAIDA') NOT NULL DEFAULT 'SAIDA',
    MODIFY `tipo` ENUM('SALARIO', 'FREELANCE', 'INVESTIMENTOS', 'BONIFICACAO', 'MORADIA', 'ALIMENTACAO', 'TRANSPORTE', 'SAUDE', 'EDUCACAO', 'LAZER', 'COMPRAS', 'CONTAS', 'OUTROS') NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Categoria_nome_movimento_key` ON `Categoria`(`nome`, `movimento`);
