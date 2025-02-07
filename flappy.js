

function novoElemento(tagName, className) {
    //cria o elemento Dom
    const elem = document.createElement(tagName) 
    //cria a classe do elemento
    elem.className = className 
    return elem
}

function Barreira(reversa = false) {
    this.elemento = novoElemento('div', 'barreira')

    //cria as bordas e corpo das barreiras
    const borda = novoElemento('div','borda')
    const corpo = novoElemento('div', 'corpo')

    //se o reversa for true cria cria o corpo pra depois
    //a borde e vice-versa
    this.elemento.appendChild(reversa ? corpo : borda)
    this.elemento.appendChild(reversa ? borda : corpo)

    //muda a altura do corpo da barra
    this.setAltura = altura => corpo.style.height = `${altura}px`

}

function ParDeBarreira(altura, abertura, x) {
    this.elemento = novoElemento('div', 'par-de-barreiras')

    //cria as barreiras passando o reversa
    this.superior = new Barreira(true)
    this.inferior = new Barreira(false)

    //adiciona as barreiras a div de classe par-de-barreiras
    this.elemento.appendChild(this.superior.elemento)
    this.elemento.appendChild(this.inferior.elemento)

    this.sortearAbertura = () => {
        //irá criar o espaço onde o flappy irá passar
        const alturaSuperior = Math.random() * (altura - abertura)
        const alturaInferior = altura - abertura - alturaSuperior

        //envia a altura de cada barra
        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior)
    }

    //pega e define as posição das barreiras na horizontal
    this.getX = () => parseInt(this.elemento.style.left.split('px')[0])
    this.setX = x => this.elemento.style.left = `${x}px`

    //retorna a largura da barreira
    this.getLargura = () => this.elemento.clientWidth
    this.sortearAbertura()
    this.setX(x)
}


let deslocamento = 0

//define a dificuldade do jogo
document.addEventListener('DOMContentLoaded', function () {
    //pega a ação dos botões criado no HTML
    const facil = document.querySelector('.facil')
    const medio = document.querySelector('.medio')
    const dificil = document.querySelector('.dificil')

    if (facil && medio && dificil) {

    //define a dificuldade a partir do deslocamento 
    // inicia ou reinicia limpando os elementos criados
    facil.addEventListener('click', function () {
        deslocamento = 3

        //quando o usuario clicar no botão o menu irá sumir
        document.querySelector('.dificuldade').style.display = 'none'

        //remove todas as tags criada apos reiniciar o jogo
        removerTags('[Flappy]')
        new FlappyBird().start()
    })
    medio.addEventListener('click', function () {
        deslocamento = 5;
        //quando o usuario clicar no botão o menu irá sumir
        document.querySelector('.dificuldade').style.display = 'none'
        removerTags('[Flappy]')
        new FlappyBird().start()
        
    });

    dificil.addEventListener('click', function () {
        deslocamento = 8
        //quando o usuario clicar no botão o menu irá sumir
        document.querySelector('.dificuldade').style.display = 'none'
        //remove todas as tags criada apos reiniciar o jogo
        removerTags('[Flappy]')
        new FlappyBird().start()
    });
}
})
function Barreiras(altura, largura, abertura, espaco, notificarPonto) {
    //quanndo a cronstutora for chamada irá criar os pares de
    //barreiras com especo entre elas
    this.pares = [
        new ParDeBarreira(altura, abertura, largura),
        new ParDeBarreira(altura, abertura, largura + espaco),
        new ParDeBarreira(altura, abertura, largura + espaco * 2),
        new ParDeBarreira(altura, abertura, largura + espaco * 3)
    ]

    this.animar = () => {

        //faz o deslocamento da barreira
        this.pares.forEach(par =>{
            par.setX(par.getX() - deslocamento)

        //ao ultrapassar o final do jogo complemente a barreira
        //volta pro início e sorteira a abertura novamente
            if(par.getX() < -par.getLargura()) {
                par.setX(par.getX() + espaco * this.pares.length)
                par.sortearAbertura()

            }

        //quando a barreira passar do meio ela contará um ponto
        const meio = largura/2
        const passouMeio = par.getX() + deslocamento >= meio
            && par.getX() < meio
            if(passouMeio) notificarPonto()
        })
    }
}

function Passaro(alturaJogo) {
    let voando = false

    this.elemento = novoElemento('img', 'passaro')
    this.elemento.src =  'img/passaro.png'

    //obtem e controla a posição do passaro
    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
    this.setY = y => this.elemento.style.bottom =  `${y}px`

    //toda vez que o usuario apertar/segurar o espaço ele sobe
    window.onkeydown = e => {
        if (e.code === 'Space') voando = true;
    }

    //quando soltar o espaço o passaro cai
    window.onkeyup = e => {
        if (e.code === 'Space') voando = false;
    }

    this.animar = () => {
        //calcula a nova posição do passaro
        const novoY = this.getY() + (voando ? 8 : -5)

        //representa a altura máxima que o passaro pode chegar
        const alturaMax = alturaJogo - this.elemento.clientHeight -1

        //impede do passaro sair do espeço do jogo
        if (novoY <= 0) {
            this.setY(0)
        }else if (novoY >= alturaMax) {
            this.setY(alturaMax-1)
        }else {
            this.setY(novoY)
        }
    }

    //define a posição inicial do passaro no meio da tela
    this.setY(alturaJogo/2)
}

function Progresso() {

    //cria o contador de pontos
    this.elemento = novoElemento('span', 'progresso')
    this.atualizarPontos = pontos => {
        this.elemento.innerHTML = pontos
    }
    this.atualizarPontos(0)
}

//cria a colisão 
function estaoSobrepostos(elementoA, elementoB) {

    //recebe a dimensões dos elementos
    const a = elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()

    //verifica se os elementos se sobrepuseram no eixo vertical
    const horizontal = a.left + a.width >= b.left
        && b.left + b.width >= a.left
        
    //verifica se os elementos se sobrepuseram no eixo horizontal
    const vertical = a.top + a.height >= b.top
        && b.top + b.height >= a.top
    return horizontal && vertical
}

function colidiu(passaro, barreiras) {
    let colidiu = false


    barreiras.pares.forEach(ParDeBarreira => {
        
        if(!colidiu){
            const superior = ParDeBarreira.superior.elemento
            const inferior = ParDeBarreira.inferior.elemento

            //Verifica se há colisão com alguma barreira
            colidiu = estaoSobrepostos(passaro.elemento, superior)
                || estaoSobrepostos(passaro.elemento, inferior)
            
        }
    })
        
        return colidiu
}


function removerTags (tag){
    //recebe a tag que será limpa para o jogo reiniciar
    const childTag = document.querySelector(tag)

    //se ela já estiver vazia a função é encerrada
    if (!childTag) return

    let delChild = childTag.lastChild

    //enquanto houver tags no elemento ele irá excluir
    while(delChild){
        childTag.removeChild(delChild)
        delChild = childTag.lastChild
    }
}

function FlappyBird() {
    let pontos = 0

    const areaJogo = document.querySelector('[flappy]')
    const altura = areaJogo.clientHeight
    const largura = areaJogo.clientWidth

    
    const progresso = new Progresso()

    //cria a barreira e passa a altura, largura, abertura e espaço/x
    const barreiras = new Barreiras(altura, largura, 200, 400,
        () => progresso.atualizarPontos(++pontos))
    const passaro = new Passaro(altura)

    //adiciona os elementos criados na div [flappy]
    areaJogo.appendChild(progresso.elemento)
    areaJogo.appendChild(passaro.elemento)
    barreiras.pares.forEach(par => areaJogo.appendChild(par.elemento))

    //inicia o jogo
    this.start = () => {
        const temporizador = setInterval(() => {
            barreiras.animar()
            passaro.animar()

            //se o passaro colidir ele irá parar o temporizador e o menu 
            // de dificuldade aparecerá de novo 
            //
            if(colidiu(passaro, barreiras)){
                clearInterval(temporizador)
                deslocamento = 0
                document.querySelector('.dificuldade').style.display = 'flex'
                
            }
        }, 20)
    }
}


