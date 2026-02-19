const form = document.getElementById("formCadastro")
const regexNome = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;
const regexSenha = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{6,}$/;


function calcularIdade(dataNascimento) {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);

    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();

    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
    }

    return idade;
    }


form.addEventListener("submit", async function (event) {
    event.preventDefault()

    const nome = document.getElementById("nome").value

    if (!regexNome.test(nome)) {
        alert('Existem caracteres inválidos no seu nome! Por favor tente novamente.')
        return
    }

    if (nome.length < 5) {
        alert('Por favor digite o seu nome completo!')
        return
    }
    

    const nascimento = document.getElementById("nascimento").value
    const userIdade = calcularIdade(nascimento)

    if(userIdade < 0 || userIdade > 130) {
        alert('Idade inválida!')
        return
    }

    if(userIdade >= 0 && userIdade <= 8) {
        alert('Infelizmente você não tem idade suficiente para fazer cadastro em nossa plataforma!')
        return
    }


    const telefone = document.getElementById("telefone").value
    const telefoneLimpo = telefone.trim().replace(/\D/g, "");

    if (telefoneLimpo && (telefoneLimpo.length < 10 || telefoneLimpo.length > 11)) {
        alert("Número de telefone incorreto!");
        return;
    }


    const email = document.getElementById("email").value
    const confirmarEmail = document.getElementById("confirmarEmail").value
    if(email !== confirmarEmail) {
        alert('Os emails digitados são diferentes!')
        return
    }

    if(!email.includes('@')) {
        alert('O Email digitado não contém @')
        return
    }


    const senha = document.getElementById("senha").value
    const confirmarSenha = document.getElementById("confirmarSenha").value

    if(!regexSenha.test(senha)) {
        alert('Senha inválida! Sua senha precisa conter seis caracteres, sendo pelo menos uma letra maiúscula, uma letra minúscula e um caractére especial.')
        return
    }

    if(senha !== confirmarSenha) {
        alert('As senhas digitadas são diferentes! Por favor tente novamente.')
        return
    }

    
    const usuario = {
        nome,
        nascimento,
        telefone: telefoneLimpo,
        email,
        senha
    }


    try {
    const resposta = await fetch("/cadastro", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(usuario)
    });

    if (resposta.ok) {
        window.location.href = "index.html";
    } else {
        alert("Erro ao cadastrar usuário.");
    }

    } catch (erro) {
        alert("Erro ao conectar com o servidor.");
    }

})