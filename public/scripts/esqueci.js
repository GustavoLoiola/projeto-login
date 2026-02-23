const form = document.getElementById("form-email");
const etapaEmail = document.getElementById("etapa-email");
const etapaCodigo = document.getElementById("etapa-codigo");


form.addEventListener("submit", async (event) => {
    event.preventDefault()

    const email = document.getElementById("email").value

    if(email.length < 3 || !email.includes('@')) {
        alert('E-mail Inválido!')
        return
    }

    try {
        const resposta = await fetch("/verificar-email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email })
        }
        )


        const dados = await resposta.json()
           
        if(dados.existe) {
            etapaEmail.classList.add('hidden')
            etapaCodigo.classList.remove('hidden')
        }
        else {
            alert('Email não encontrado!')
        }

        fetch("/validar-codigo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, codigo, novaSenha })
        })
        .then(res => res.json())
        .then(data => {
            if (data.sucesso) {
                window.location.href = "index.html";
            } else {
                alert(data.mensagem);
            }
        });
    }
    catch(erro) {
        console.error("Erro: ", erro)
    }
})