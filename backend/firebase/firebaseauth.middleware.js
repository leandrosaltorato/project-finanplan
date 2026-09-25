const auth = require("./firebaseAdmin");
const prisma = require("../src/data/prisma");

const autenticar = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      erro: "Token não informado.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = await auth.verifyIdToken(token);

    const usuario = await prisma.usuarios.findUnique({
      where: {
        firebaseUid: decoded.uid,
      },
    });

    if (!usuario) {
      return res.status(404).json({
        erro: "Usuário não encontrado.",
      });
    }

    req.userId = usuario.id;
    req.usuario = usuario;

    next();
  } catch (erro) {
    console.error("Erro na autenticação:", erro);

    return res.status(401).json({
      erro: "Token inválido ou expirado.",
    });
  }
};

module.exports = autenticar;
