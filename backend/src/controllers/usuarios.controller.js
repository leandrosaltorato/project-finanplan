const prisma = require("../data/prisma");
const {
  cryptPassword,
  comparePassword,
} = require("../services/security.service");
const admin = require("../../firebase/firebaseAdmin");

const cadastrar = async (req, res) => {
  try {
    const { nome, email, senha, Telefone } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({
        erro: "Nome, email e senha são obrigatórios",
      });
    }

    const existe = await prisma.usuarios.findUnique({
      where: { email },
    });

    if (existe) {
      return res.status(400).json({
        erro: "Este email já está cadastrado",
      });
    }

    const senhaCriptografada = cryptPassword(senha);

    const usuario = await prisma.usuarios.create({
      data: {
        nome,
        email,
        senha: senhaCriptografada,
        Telefone: Telefone || null,
      },
    });

    const controle = await prisma.controle.create({
      data: {
        saldo: 0,
      },
    });

    await prisma.usuariosControles.create({
      data: {
        usuariosId: usuario.id,
        controleId: controle.id,
      },
    });

    res.status(201).json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      controleId: controle.id,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      erro: "Erro ao cadastrar usuário",
      detalhes: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    const usuario = await prisma.usuarios.findUnique({
      where: { email },
      include: {
        controles: true,
      },
    });

    if (!usuario) {
      return res.status(401).json({
        erro: "Email ou senha incorretos",
      });
    }

    if (!usuario.senha) {
      return res.status(401).json({
        erro: "Essa conta utiliza login com Google",
      });
    }

    const senhaValida = comparePassword(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({
        erro: "Email ou senha incorretos",
      });
    }

    res.status(200).json({
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
      },
      controleId: usuario.controles[0]?.controleId,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      erro: "Erro ao fazer login",
    });
  }
};

const loginGoogle = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        erro: "Token do Google não informado",
      });
    }

    const idToken = authHeader.substring(7);
    const decodedToken = await admin.verifyIdToken(idToken);

    const firebaseUid = decodedToken.uid;
    const email = decodedToken.email;
    const nome = decodedToken.name || "Usuário";

    if (!email) {
      return res.status(400).json({
        erro: "O Google não retornou um email",
      });
    }

    let usuario = await prisma.usuarios.findUnique({
      where: { firebaseUid },
      include: { controles: true },
    });
    if (!usuario) {
      usuario = await prisma.usuarios.findUnique({
        where: { email },
        include: { controles: true },
      });
    }

    if (usuario) {
      if (usuario.firebaseUid && usuario.firebaseUid !== firebaseUid) {
        return res.status(409).json({
          erro: "Este email já está vinculado a outra conta Google",
        });
      }

      if (!usuario.firebaseUid) {
        usuario = await prisma.usuarios.update({
          where: { id: usuario.id },
          data: { firebaseUid },
          include: { controles: true },
        });
      }
    } else {
      usuario = await prisma.$transaction(async (tx) => {
        const novoUsuario = await tx.usuarios.create({
          data: {
            nome,
            email,
            senha: null,
            Telefone: null,
            firebaseUid,
          },
        });

        const controle = await tx.controle.create({
          data: {
            saldo: 0,
          },
        });

        await tx.usuariosControles.create({
          data: {
            usuariosId: novoUsuario.id,
            controleId: controle.id,
          },
        });

        return tx.usuarios.findUnique({
          where: { id: novoUsuario.id },
          include: { controles: true },
        });
      });
    }

    if (!usuario.controles || usuario.controles.length === 0) {
      await prisma.$transaction(async (tx) => {
        const controle = await tx.controle.create({
          data: { saldo: 0 },
        });

        await tx.usuariosControles.create({
          data: {
            usuariosId: usuario.id,
            controleId: controle.id,
          },
        });
      });

      usuario = await prisma.usuarios.findUnique({
        where: { id: usuario.id },
        include: { controles: true },
      });
    }

    return res.status(200).json({
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
      },
      controleId: usuario.controles[0]?.controleId,
    });
  } catch (error) {
    console.error("Erro no login Google:", error);

    if (error.code === "P2002") {
      return res.status(409).json({
        erro: "Conflito ao cadastrar usuário. Tente fazer login novamente.",
      });
    }

    return res.status(401).json({
      erro: "Não foi possível autenticar com o Google",
    });
  }
};

const listar = async (req, res) => {
  try {
    const lista = await prisma.usuarios.findMany({
      omit: {
        senha: true,
      },
    });

    res.status(200).json(lista);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      erro: "Erro ao listar usuários",
    });
  }
};

const buscar = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await prisma.usuarios.findUnique({
      where: {
        id: Number(id),
      },
      omit: {
        senha: true,
      },
    });

    res.status(200).json(item);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      erro: "Erro ao buscar usuário",
    });
  }
};

const atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const dados = req.body;

    const item = await prisma.usuarios.update({
      where: {
        id: Number(id),
      },
      data: dados,
      omit: {
        senha: true,
      },
    });

    res.status(200).json(item);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      erro: "Erro ao atualizar usuário",
    });
  }
};

const excluir = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await prisma.usuarios.delete({
      where: {
        id: Number(id),
      },
    });

    res.status(200).json(item);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      erro: "Erro ao excluir usuário",
    });
  }
};

module.exports = {
  cadastrar,
  listar,
  buscar,
  atualizar,
  excluir,
  login,
  loginGoogle,
};
