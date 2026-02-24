const express = require("express")
const bcrypt = require("bcrypt")
const db = require("./db")
const crypto = require("crypto")

const regexSenha = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{6,}$/


const app = express()
app.use(express.json())
app.use(express.static("public"))


app.post("/cadastro", async (req, res) => {
    try {
        const { nome, nascimento, telefone, email, senha } = req.body

        // Verificar se email já existe
        const [usuarioExistente] = await db.query(
            "SELECT id FROM usuarios WHERE email = ?",
            [email]
        )

        if (usuarioExistente.length > 0) {
            return res.status(400).json({ mensagem: "Email já cadastrado." })
        }

        if (!regexSenha.test(senha)) {
            return res.status(400).json({
            mensagem: "Senha inválida! Deve conter no mínimo 6 caracteres, 1 letra maiúscula, 1 letra minúscula e 1 caractere especial."
    })
}

        // Criptografar senha
        const senhaHash = await bcrypt.hash(senha, 10)

        // Inserir usuário
        await db.query(
            "INSERT INTO usuarios (nome, nascimento, telefone, email, senha) VALUES (?, ?, ?, ?, ?)",
            [nome, nascimento, telefone, email, senhaHash]
        )

        res.status(201).json({ mensagem: "Usuário cadastrado com sucesso!" })

    } catch (erro) {
        console.error(erro)
        res.status(500).json({ mensagem: "Erro interno do servidor." })
    }
})


function gerarCodigo() {
    return crypto.randomInt(100000, 1000000).toString()
}

app.post("/verificar-email", async (req, res) => {
    try {
        const { email } = req.body

        const [usuario] = await db.query(
            "SELECT id FROM usuarios WHERE email = ?",
            [email]
        )

        if (usuario.length === 0) {
            return res.json({ existe: false })
        }

        const codigo = gerarCodigo();
        const expiraEm = new Date(Date.now() + 10 * 60 * 1000) //10min

        await db.query(
            "UPDATE usuarios SET codigo_recuperacao = ?, codigo_expira_em = ? WHERE email = ?",
            [codigo, expiraEm, email]
        )
        
        console.log("Email enviado!")
        console.log("Preview URL:", nodemailer.getTestMessageUrl(info))

        res.json({ existe: true })

    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: "Erro interno." })
    }
})

//ja importei o bycrypt

app.post("/validar-codigo", async (req, res) => {
    try {
        const { email, codigo, novaSenha } = req.body

        if (!email || !codigo || !novaSenha) {
            return res.status(400).json({ mensagem: "Dados incompletos." })
        }

        const [usuario] = await db.query(
            "SELECT * FROM usuarios WHERE email = ?",
            [email]
        )

        if (usuario.length === 0) {
            return res.status(400).json({ mensagem: "Usuário não encontrado." })
        }

        const user = usuario[0]

        // Verifica código
        if (user.codigo_recuperacao !== codigo) {
            return res.status(400).json({ mensagem: "Código inválido." })
        }

        // Verifica expiração
        if (new Date() > new Date(user.codigo_expira_em)) {
            return res.status(400).json({ mensagem: "Código expirado." })
        }


        if(!regexSenha.test(novaSenha)) {
            return res.status(400).json({ mensagem: "Senha inválida! Sua senha precisa conter seis caracteres, sendo pelo menos uma letra maiúscula, uma letra minúscula e um caractére especial." })
        }

        // Criptografa nova senha
        const senhaHash = await bcrypt.hash(novaSenha, 10)

        // Atualiza senha e limpa código
        await db.query(
            `UPDATE usuarios 
             SET senha = ?, 
                 codigo_recuperacao = NULL, 
                 codigo_expira_em = NULL
             WHERE email = ?`,
            [senhaHash, email]
        );

        res.json({ sucesso: true, mensagem: "Senha redefinida com sucesso!" })
        res.redirect("/index.html")

    } catch (erro) {
        console.error(erro)
        res.status(500).json({ mensagem: "Erro interno." })
    }
})

//Teste de servidor
app.listen(3000, () => {
    console.log("Servidor rodando na porta 3000")
})

