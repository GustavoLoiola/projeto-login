// Espera o DOM carregar completamente
document.addEventListener("DOMContentLoaded", () => {

    const formEmail = document.getElementById("form-email")
    const formCodigo = document.getElementById("form-codigo")

    const etapaEmail = document.getElementById("etapa-email")
    const etapaCodigo = document.getElementById("etapa-codigo")

    let emailSalvo = ""; // Guarda o email para usar na segunda etapa

   
    // ETAPA 1 - Enviar email

    formEmail.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value.trim()

        if (!email || !email.includes("@")) {
            alert("E-mail inválido!")
            return
        }

        try {
            const resposta = await fetch("/verificar-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            })

            const dados = await resposta.json();

            if (dados.existe) {
                emailSalvo = email;

                etapaEmail.classList.add("hidden");
                etapaCodigo.classList.remove("hidden");
            } else {
                alert("Email não encontrado!");
            }

        } catch (erro) {
            console.error("Erro ao verificar email:", erro)
            alert("Erro ao conectar com o servidor.")
        }
    });


    // ================================
    // ETAPA 2 - Validar código e redefinir senha
    // ================================
    formCodigo.addEventListener("submit", async (e) => {
        e.preventDefault()

        const codigo = document.getElementById("codigo").value.trim()
        const novaSenha = document.getElementById("novaSenha").value.trim()
        const confirmarSenha = document.getElementById("confirmarSenha").value.trim()

        if (!codigo || !novaSenha || !confirmarSenha) {
            alert("Preencha todos os campos!");
            return
        }

        if (novaSenha !== confirmarSenha) {
            alert("As senhas não coincidem!");
            return
        }

        try {
            const resposta = await fetch("/validar-codigo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: emailSalvo,
                    codigo,
                    novaSenha
                })
            })

            const dados = await resposta.json();

            if (dados.sucesso) {
                alert("Senha redefinida com sucesso!")
                window.location.href = "index.html"
            } else {
                alert(dados.mensagem)
            }

        } catch (erro) {
            console.error("Erro ao validar código:", erro)
            alert("Erro ao conectar com o servidor.")
        }
    })

})