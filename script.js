//Usuário iniciarGravacao()
//pede microfone
//Grava por 8 segundos
//Junta os pedaços do áudio
//Envia para API
//API responde com nome da música
//Mostra na tela


let recorder; //guarda o gravador de áudio
let audioChunks = []; //guarda os pedaços do áudio gravado

async function iniciarGravacao() {
  //Cria uma função assíncrona
  const status = document.getElementById("status"); //Pega os elementos do HTML para poder mudar o texto deles.
  const resultado = document.getElementById("resultado"); //Pega os elementos do HTML para poder mudar o texto deles.

  resultado.textContent = ""; //Limpa o resultado antigo da tela.
  audioChunks = []; //Limpa o array antes de começar nova gravação

  try {
    //await faz o código esperar até o usuário permitir
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true }); //*Pede permissão para usar o microfone e o TRUE significa que queremos o som
    recorder = new MediaRecorder(stream); //Cria o gravador usando o microfone capturado.

    recorder.ondataavailable = (e) => audioChunks.push(e.data); //Toda vez que um pedaço de áudio ficar pronto: e.data é o pedaço ele é guardado dentro do array audioChunks

    recorder.onstop = () => {
      //Quando a gravação parar executa o recorder.stop()
      const audioBlob = new Blob(audioChunks, { type: "audio/webm" }); //Blob = tipo um “arquivo temporário”.
      identificarMusica(audioBlob);
    };

    status.textContent = " Escutando... (8 segundos)";
    recorder.start(); //Começa a gravação

    setTimeout(() => {
      recorder.stop(); //Para a gravação
      status.textContent = " Identificando música...";
    }, 8000); //O tempo de gravação
  } catch (err) {
    //Se o usuário negar o microfone ou der erro.
    status.textContent = " Permissão do microfone negada";
    console.error(err);
  }
}

function identificarMusica(audioBlob) {
  //Recebe o áudio já gravado.
  const resultado = document.getElementById("resultado"); //onde vai mostrar o resultado.

  const formData = new FormData(); //Cria um “pacote” para enviar dados
  formData.append("file", audioBlob); //Coloca o áudio dentro do pacote
  formData.append("api_token", "7d490309434e101c0a73804a3a0ea92c"); //chave da API

  fetch("https://api.audd.io/", {
    //Envia os dados para a API.
    method: "POST",
    body: formData,
  })
    .then((res) => res.json()) //Converte a resposta para formato JSON
    .then((data) => { //Aqui recebemos a resposta da API
      if (data.result) {
        //Se encontrou música
        resultado.textContent = ` Música: ${data.result.title} 
  Artista: ${data.result.artist}
  Álbum: ${data.result.album || "Não informado"}`; //Mostra os dados na tela.
      } else {
        resultado.textContent = " Música não identificada";
      }
    })
    .catch((err) => {
      resultado.textContent = " Erro ao identificar música";
      console.error(err); //Se a requisição falhar.
    });
}
