async function buscarDadosSensor(sensor) {

    const url = `http://apiunip-env.eba-4pgwkkbn.us-east-2.elasticbeanstalk.com/api/sensor/lista?sensor=${sensor}`;

    const resposta = await fetch(url);

    if (!resposta.ok) {
        throw new Error(`Erro ao consultar API: ${resposta.status}`);
    }

    const dados = await resposta.json();

    return dados;
}

async function carregarSensor(sensorAprocurar) {

    try {

        // Busca os dados normais
        const dados = await buscarDadosSensor(sensorAprocurar);

        console.log("Dados da tabela:", dados);

        preencherTabela(dados, sensorAprocurar);


        // Busca as médias por dia
        const medias = await buscarMediaSensor(sensorAprocurar);

        console.log("Médias:", medias);

        construirGrafico(medias, sensorAprocurar);

    } catch (erro) {

        console.error(erro);

    }
}

function preencherTabela(dados,sensor) {

    const tabela = document.querySelector("#tabelatemp tbody");

    tabela.innerHTML = "";

    dados.forEach(item => {

        const linha = document.createElement("tr");
        const colunaHora = document.createElement("td");
        const colunaValor = document.createElement("td");
        const data = new Date(item.horadoregistro);

        const hora = data.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit"
        });

        colunaHora.textContent = hora;

        switch(sensor)
        {
            case "LDR":
                colunaValor.textContent = item.valorprocessado + "%";
                break;

            case "BMP280":
                colunaValor.textContent = item.valorprocessado + "ºC";
                break;

            case "DHT22":
                colunaValor.textContent = item.valorprocessado + "%";
                break;

            case "MQ135":
                colunaValor.textContent = item.valorprocessado + "ppm";
                break;

            default:
                colunaValor.textContent = item.valorprocessado;
                break;
        }

        linha.appendChild(colunaHora);
        linha.appendChild(colunaValor);

        tabela.appendChild(linha);
    });
}

async function buscarMediaSensor(sensor) {

    const url = `http://apiunip-env.eba-4pgwkkbn.us-east-2.elasticbeanstalk.com/api/sensor/listaMedia?sensor=${sensor}`;

    const resposta = await fetch(url);

    if (!resposta.ok) {
        throw new Error(`Erro ao consultar médias: ${resposta.status}`);
    }

    const dados = await resposta.json();

    return dados;
}

function construirGrafico(dados, sensor) {

    const canvas = document.querySelector("#graficoSensor");
    const datas = [];
    const valores = [];

    dados.forEach(item => {

        const data = new Date(item.horadoregistro);
        datas.push(data.toLocaleDateString("pt-BR"));

        valores.push(
            item.valorprocessado
        );

    });

    new Chart(canvas, {

        type: "line",

        data: {

            labels: datas,

            datasets: [
                {
                    label: `Média diária - ${sensor}`,
                    data: valores,
                    borderWidth: 2,
                    tension: 0.3,
                    fill: false
                }
            ]
        },

        options: {

            responsive: true,
            maintainAspectRatio: false,
            scales: {

                x: {
                    title: {
                        display: true,
                        text: "Data"
                    }
                },

                y: {
                    title: {
                        display: true,
                        text: "Média"
                    }
                }
            }
        }
    });
}

