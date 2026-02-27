const express = require("express");
const bcrypt = require("bcrypt");
const db = require("./db");
const crypto = require("crypto");

const regexSenha = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{6,}$/;

const app = express();
app.use(express.json());
app.use(express.static("public"));

/* =========================
   CADASTRO
========================= */
app.post("/cadastro", async (req, res) => {
  try {
    const { nome, nascimento, telefone, email, senha } = req.body;

    const [usuarioExistente] = await db.query(
      "SELECT id FROM usuarios WHERE email = ?",
      [email]
    );

    if (usuarioExistente.length > 0) {
      return res.status(400).json({ mensagem: "Email já cadastrado." });
    }

    if (!regexSenha.test(senha)) {
      return res.status(400).json({
        mensagem:
          "Senha inválida! Deve conter no mínimo 6 caracteres, 1 letra maiúscula, 1 letra minúscula e 1 caractere especial."
      });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

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

/* =========================
   GERAR CÓDIGO
========================= */
function gerarCodigo() {
  return crypto.randomInt(100000, 1000000).toString();
}

/* =========================
   VERIFICAR EMAIL
========================= */
app.post("/verificar-email", async (req, res) => {
  try {
    const { email } = req.body;

    const [usuario] = await db.query(
      "SELECT id FROM usuarios WHERE email = ?",
      [email]
    );

    if (usuario.length === 0) {
      return res.json({ existe: false });
    }

    const codigo = gerarCodigo();
    const expiraEm = new Date(Date.now() + 10 * 60 * 1000);

    await db.query(
      "UPDATE usuarios SET codigo_recuperacao = ?, codigo_expira_em = ? WHERE email = ?",
      [codigo, expiraEm, email]
    );

    console.log("Código gerado:", codigo);

    res.json({ existe: true });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: "Erro interno." });
  }
});

/* =========================
   VALIDAR CÓDIGO
========================= */
app.post("/validar-codigo", async (req, res) => {
  try {
    const { email, codigo, novaSenha } = req.body;

    if (!email || !codigo || !novaSenha) {
      return res.status(400).json({ mensagem: "Dados incompletos." });
    }

    const [usuario] = await db.query(
      "SELECT * FROM usuarios WHERE email = ?",
      [email]
    );

    if (usuario.length === 0) {
      return res.status(400).json({ mensagem: "Usuário não encontrado." });
    }

    const user = usuario[0];

    if (user.codigo_recuperacao !== codigo) {
      return res.status(400).json({ mensagem: "Código inválido." });
    }

    if (new Date() > new Date(user.codigo_expira_em)) {
      return res.status(400).json({ mensagem: "Código expirado." });
    }

    if (!regexSenha.test(novaSenha)) {
      return res.status(400).json({
        mensagem:
          "Senha inválida! Deve conter no mínimo 6 caracteres, 1 letra maiúscula, 1 letra minúscula e 1 caractere especial."
      });
    }

    const senhaHash = await bcrypt.hash(novaSenha, 10);

    await db.query(
      `UPDATE usuarios 
       SET senha = ?, 
           codigo_recuperacao = NULL, 
           codigo_expira_em = NULL
       WHERE email = ?`,
      [senhaHash, email]
    );

    res.redirect("/index.html");
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: "Erro interno." });
  }
});

/* =========================
   LOGIN
========================= */
app.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: "Preencha todos os campos!" });
    }

    const [rows] = await db.query(
      "SELECT * FROM usuarios WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ erro: "Usuário não encontrado" });
    }

    const usuario = rows[0];

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

    if (!senhaCorreta) {
      return res.status(401).json({ erro: "Senha incorreta" });
    }

    res.json({ mensagem: "Login realizado com sucesso" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor rodando na porta", PORT);
});