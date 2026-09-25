-- CreateTable
CREATE TABLE `Meta` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `icone` VARCHAR(191) NOT NULL DEFAULT 'flag',
    `valorAtual` DOUBLE NOT NULL DEFAULT 0,
    `valorAlvo` DOUBLE NOT NULL,
    `dataLimite` DATETIME(3) NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `controleId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Meta` ADD CONSTRAINT `Meta_controleId_fkey` FOREIGN KEY (`controleId`) REFERENCES `Controle`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
