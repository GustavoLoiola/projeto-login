const form = document.getElementById("formLogin")

console.log('Tudo certo!')

form.addEventListener("submit", async function (event) {
    event.preventDefault()

    const email = document.getElementById("ilogin").value
    const senha = document.getElementById("isenha").value

    try {
        const resposta = await fetch("/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, senha })
        });

        const dados = await resposta.json()

        if (!resposta.ok) {
           alert(dados.erro)
            return;
        }

        alert('Login realizado com suscesso!')
        window.location.href = '/main.html'
    }

    catch(erro) {
        alert('Erro ao se conectar com o servidor!')
    }
})
