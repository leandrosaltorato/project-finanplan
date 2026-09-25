const express = require("express");

const router = express.Router();

const autenticar = require("../../firebase/firebaseauth.middleware");

const {
  buscarPerfil,
  atualizarPerfil,
  atualizarSenha,
  excluirConta,
} = require("../controllers/config.controller");

router.use(autenticar);

router.get("/perfil", buscarPerfil);
router.put("/perfil", atualizarPerfil);
router.put("/senha", atualizarSenha);
router.delete("/conta", excluirConta);

module.exports = router;
