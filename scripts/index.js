const form = document.getElementById("formCadastro")
const regexNome = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;


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



form.addEventListener("submit", function (event) {
    event.preventDefault()

    const nome = document.getElementById("nome").value

    if (!regexNome.test(nome)) {
        alert('Existem caracteres inválidos no seu nome! Por favor tente novamente.')
    }

    else if (nome.length < 5) {
        alert('Por favor digite o seu nome completo!')
    }


    else {
    
    const nascimento = document.getElementById("nascimento").value

    const userIdade = calcularIdade(nascimento)

    if(userIdade < 0 || userIdade > 130) {
        alert('Idade inválida!')
    }

    else if(userIdade >= 0 && userIdade <= 8) {
        alert('Infelizmente você não tem idade suficiente para fazer cadastro em nossa plataforma!')
    }

    else {

    const telefone = document.getElementById("telefone").value

    if(telefone.trim().replace(/\D/g, "").length >= 12 || telefone.trim().replace(/\D/g, "").length <= 10 ) {
        alert('Número de telefone incorreto!')
    }

    else {



    const email = document.getElementById("email").value
    const confirmarEmail = document.getElementById("confirmarEmail").value
    if(email !== confirmarEmail) {
        alert('Os emails digitados são diferentes!')
    }

    else if(!email.includes('@')) {
        alert('O Email digitado não contém @')
    }

    else {


    const senha = document.getElementById("senha").value
   

    const usuario = {
        nome,
        nascimento,
        telefone,
        email,
        senha
    }


    alert('Cadastro concluído!')
    }
    }
    }
    }
})