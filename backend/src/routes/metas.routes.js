const express = require("express");
const router = express.Router();

const metasController = require("../controllers/metas.controller");

router.get("/listar", metasController.listar);
router.post("/cadastrar", metasController.cadastrar);
router.put("/atualizar/:id", metasController.atualizar);
router.patch("/depositar/:id", metasController.depositar);
router.delete("/excluir/:id", metasController.excluir);

module.exports = router;