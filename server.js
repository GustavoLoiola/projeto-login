const express = require("express");
const bcrypt = require("bcrypt");
const db = require("./db");

const app = express();
app.use(express.json());
app.use(express.static("public"));


app.post("/cadastro", async (req, res) => {
    try {
        const { nome, nascimento, telefone, email, senha } = req.body;

        // Verificar se email já existe
        const [usuarioExistente] = await db.query(
            "SELECT id FROM usuarios WHERE email = ?",
            [email]
        );

        if (usuarioExistente.length > 0) {
            return res.status(400).json({ mensagem: "Email já cadastrado." });
        }

        // Criptografar senha
        const senhaHash = await bcrypt.hash(senha, 10);

        // Inserir usuário
        await db.query(
            "INSERT INTO usuarios (nome, nascimento, telefone, email, senha) VALUES (?, ?, ?, ?, ?)",
            [nome, nascimento, telefone, email, senhaHash]
        );

        res.status(201).json({ mensagem: "Usuário cadastrado com sucesso!" });

    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: "Erro interno do servidor." });
    }
});

app.listen(3000, () => {
    console.log("Servidor rodando na porta 3000");
});
