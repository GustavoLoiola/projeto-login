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

    const result = await db.query(
      "SELECT id FROM usuarios WHERE email = $1",
      [email]
    )

    if (result.rows.length > 0) {
      return res.status(400).json({ mensagem: "Email já cadastrado." })
    }

    if (!regexSenha.test(senha)) {
      return res.status(400).json({
        mensagem:
          "Senha inválida! Deve conter no mínimo 6 caracteres, 1 letra maiúscula, 1 letra minúscula e 1 caractere especial."
      })
    }

    const senhaHash = await bcrypt.hash(senha, 10)

    await db.query(
      "INSERT INTO usuarios (nome, nascimento, telefone, email, senha) VALUES ($1, $2, $3, $4, $5)",
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

    const result = await db.query(
      "SELECT * FROM usuarios WHERE email = $1",
      [email]
    )

    if (result.rows.length === 0) {
      return res.json({ existe: false })
    }

    const codigo = gerarCodigo()
    const expiraEm = new Date(Date.now() + 10 * 60 * 1000)

    await db.query(
      "UPDATE usuarios SET codigo_recuperacao = $1, codigo_expira_em = $2 WHERE email = $3",
      [codigo, expiraEm, email]
    )

    console.log("Código gerado:", codigo)

    res.json({ existe: true })
  } catch (erro) {
    console.error(erro)
    res.status(500).json({ mensagem: "Erro interno." })
  }
})


app.post("/validar-codigo", async (req, res) => {
  try {
    const { email, codigo, novaSenha } = req.body

    if (!email || !codigo || !novaSenha) {
      return res.status(400).json({ mensagem: "Dados incompletos." })
    }

    const result = await db.query(
      "SELECT * FROM usuarios WHERE email = $1",
      [email]
    )

    if (result.rows.length === 0) {
      return res.status(400).json({ mensagem: "Usuário não encontrado." })
    }

    const user = result.rows[0]

    if (user.codigo_recuperacao !== codigo) {
      return res.status(400).json({ mensagem: "Código inválido." })
    }

    if (new Date() > new Date(user.codigo_expira_em)) {
      return res.status(400).json({ mensagem: "Código expirado." })
    }

    if (!regexSenha.test(novaSenha)) {
      return res.status(400).json({
        mensagem:
          "Senha inválida! Deve conter no mínimo 6 caracteres, 1 letra maiúscula, 1 letra minúscula e 1 caractere especial."
      })
    }

    const senhaHash = await bcrypt.hash(novaSenha, 10)

    await db.query(
      `UPDATE usuarios 
       SET senha = $1,
           codigo_recuperacao = NULL,
           codigo_expira_em = NULL
       WHERE email = $2`,
      [senhaHash, email]
    )

    res.redirect("/index.html")
  } catch (erro) {
    console.error(erro)
    res.status(500).json({ mensagem: "Erro interno." })
  }
})


app.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body

    if (!email || !senha) {
      return res.status(400).json({ erro: "Preencha todos os campos!" })
    }

    const result = await db.query(
      "SELECT * FROM usuarios WHERE email = $1",
      [email]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ erro: "Usuário não encontrado" })
    }

    const usuario = result.rows[0]

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha)

    if (!senhaCorreta) {
      return res.status(401).json({ erro: "Senha incorreta" })
    }

    res.json({ mensagem: "Login realizado com sucesso" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ erro: "Erro interno do servidor" })
  }
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log("Servidor rodando na porta", PORT)
})