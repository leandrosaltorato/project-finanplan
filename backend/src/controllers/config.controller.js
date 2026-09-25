const auth = require("../../firebase/firebaseAdmin"); 
const prisma = require("../data/prisma");

const buscarPerfil = async (req, res) => {
    const usuario = await prisma.usuarios.findUnique({
        where: { id: req.userId },
        select: { id: true, nome: true, email: true, Telefone: true }
    });

    res.json(usuario).status(200).end();
};

const atualizarPerfil = async (req, res) => {
    const { nome, email, telefone } = req.body;

    const usuario = await prisma.usuarios.update({
        where: { id: req.userId },
        data: { nome, email, Telefone: telefone },
        select: { id: true, nome: true, email: true, Telefone: true }
    });

    res.json(usuario).status(200).end();
};

const atualizarSenha = async (req, res) => {
    const { novaSenha } = req.body;

    try {
        await auth.updateUser(req.usuario.firebaseUid, {
            password: novaSenha
        });

        res.json({ mensagem: "Senha atualizada com sucesso." }).status(200).end();
    } catch (erro) {
        res.json({ erro: "Não foi possível atualizar a senha." }).status(400).end();
    }
};

const excluirConta = async (req, res) => {
    await prisma.lembretes.deleteMany({ where: { usuarioId: req.userId } });
    await prisma.usuariosControles.deleteMany({ where: { usuariosId: req.userId } });

    const usuario = await prisma.usuarios.delete({ where: { id: req.userId } });

    await auth.deleteUser(req.usuario.firebaseUid);

    res.json(usuario).status(200).end();
};

module.exports = {
    buscarPerfil,
    atualizarPerfil,
    atualizarSenha,
    excluirConta
};