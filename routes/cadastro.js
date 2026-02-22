const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();

router.post("/cadastro", async (req, res) => {
    try {
        const { nome, nascimento, telefone, email, senha } = req.body;

        if (!nome || !email || !senha) {
            return res.status(400).json({ mensagem: "Dados incompletos." });
        }

        const senhaHash = await bcrypt.hash(senha, 10);

        console.log("Senha hash:", senhaHash);
        

        res.status(201).json({ mensagem: "Usuário criado com sucesso." });

    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: "Erro interno." });
    }
});

module.exports = router;
