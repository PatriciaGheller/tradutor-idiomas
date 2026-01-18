// Seletores
const inputTexto = document.querySelector(".input-texto")
const selectOrigem = document.querySelector(".idioma-origem")
const selectDestino = document.querySelector(".idioma-destino")
const resultado = document.querySelector(".traducao")
const botaoMicrofone = document.querySelector(".btn-microfone")
const botaoOuvir = document.querySelector(".btn-ouvir")

// Tradução
async function traduzir() {
  try {
    const texto = inputTexto.value
    const origem = selectOrigem.value
    const destino = selectDestino.value

    if (!texto.trim()) {
      resultado.textContent = "Digite ou fale algo para traduzir."
      return
    }

    const endereco = "https://api.mymemory.translated.net/get?q="
      + encodeURIComponent(texto)
      + "&langpair=" + origem + "|" + destino

    resultado.textContent = "Traduzindo..."
    const resposta = await fetch(endereco)
    if (!resposta.ok) {
      throw new Error("Falha na requisição: " + resposta.status)
    }

    const dados = await resposta.json()
    console.log(dados)

    const traducao = dados?.responseData?.translatedText
    if (!traducao) {
      throw new Error("Resposta inesperada da API.")
    }

    resultado.textContent = traducao
  } catch (erro) {
    console.error(erro)
    resultado.textContent = "Não foi possível traduzir. Verifique sua conexão ou tente novamente."
  }
}

// Expõe a função para o onclick do HTML
window.traduzir = traduzir

// --- Reconhecimento de voz ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

if (SpeechRecognition) {
  const recognition = new SpeechRecognition()
  recognition.continuous = false
  recognition.interimResults = false

  recognition.onresult = (event) => {
    const textoFalado = event.results[0][0].transcript
    inputTexto.value = textoFalado
    traduzir() // traduz automaticamente após reconhecer
  }

  recognition.onerror = (event) => {
    console.error("Erro no reconhecimento:", event.error)
    resultado.textContent = "Erro ao capturar voz."
  }

  botaoMicrofone.addEventListener("click", () => {
    recognition.lang = selectOrigem.value // usa o idioma de origem
    resultado.textContent = "Ouvindo em " + selectOrigem.value + "..."
    recognition.start()
  })
} else {
  resultado.textContent = "Seu navegador não suporta reconhecimento de voz."
}

// --- Síntese de voz (Text-to-Speech) ---
function falarTraducao() {
  const texto = resultado.textContent
  const destino = selectDestino.value

  if (!texto || texto === "A Tradução aparecerá aqui..." || texto.startsWith("Erro")) {
    resultado.textContent = "Não há tradução para falar."
    return
  }

  const utterance = new SpeechSynthesisUtterance(texto)
  utterance.lang = destino // idioma de destino para pronúncia
  utterance.rate = 1
  utterance.pitch = 1
  utterance.volume = 1

  speechSynthesis.speak(utterance)
}

botaoOuvir.addEventListener("click", falarTraducao)