/*
  Warnings:

  - You are about to drop the column `movimento` on the `categoria` table. All the data in the column will be lost.
  - The values [SALARIO,FREELANCE,INVESTIMENTOS,BONIFICACAO,MORADIA,COMPRAS,CONTAS] on the enum `Categoria_tipo` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `orcamento` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[nome]` on the table `Categoria` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `orcamento` DROP FOREIGN KEY `Orcamento_categoriaId_fkey`;

-- DropForeignKey
ALTER TABLE `orcamento` DROP FOREIGN KEY `Orcamento_controleId_fkey`;

-- DropIndex
DROP INDEX `Categoria_nome_movimento_key` ON `categoria`;

-- AlterTable
ALTER TABLE `categoria` DROP COLUMN `movimento`,
    MODIFY `tipo` ENUM('ALIMENTACAO', 'LAZER', 'EDUCACAO', 'TRANSPORTE', 'SAUDE', 'OUTROS') NOT NULL;

-- DropTable
DROP TABLE `orcamento`;

-- CreateIndex
CREATE UNIQUE INDEX `Categoria_nome_key` ON `Categoria`(`nome`);
