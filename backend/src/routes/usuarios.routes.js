const express = require("express");

const router = express.Router();

const {
  cadastrar,
  listar,
  buscar,
  atualizar,
  excluir,
  login,
  loginGoogle
} = require("../controllers/usuarios.controller");

router.post("/cadastrar", cadastrar);
router.post("/login", login);
router.post("/google", loginGoogle);

router.get("/listar", listar);
router.get("/buscar/:id", buscar);
router.put("/atualizar/:id", atualizar);
router.delete("/excluir/:id", excluir);

module.exports = router;
