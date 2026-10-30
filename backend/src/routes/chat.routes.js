const express = require("express");

const router = express.Router();

const { conversar } = require("../controllers/chat.controller");

const JANELA_MS = 60 * 1000;
const LIMITE_POR_JANELA = 20;
const acessos = new Map();

setInterval(() => {
  const agora = Date.now();
  for (const [ip, horarios] of acessos) {
    if (horarios.every((h) => agora - h >= JANELA_MS)) acessos.delete(ip);
  }
}, JANELA_MS).unref();

function limitar(req, res, next) {
  const agora = Date.now();
  const recentes = (acessos.get(req.ip) ?? []).filter((h) => agora - h < JANELA_MS);
  if (recentes.length >= LIMITE_POR_JANELA) {
    return res.status(429).json({ mensagem: "Muitas mensagens em pouco tempo. Aguarde um instante." });
  }
  recentes.push(agora);
  acessos.set(req.ip, recentes);
  return next();
}

router.post("/mensagem", limitar, conversar);

module.exports = router;