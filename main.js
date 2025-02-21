const board = (() => {
    let board = new Array(9).fill(null);
    return board;
})();

const CreatePlayer = (choice) => {
    let mark = '';
    const givemark = () => mark = choice;
    const getmark = () => mark;

    let counter = 0;
    const getcounter = () => counter;
    const resetcounter = () => counter = 0
    const increaseCounter = () => counter++;

    let score = 0
    const getscore = () => score;
    const resetscore = () => score = 0;
    const increaseScore = () => score++
    givemark()
    return {getmark,getcounter,increaseCounter,resetcounter,getscore,resetscore,increaseScore}
}

function RenderBoard(){
    const gamecontainer = document.querySelector('.gamecontainer')
    const gameboard = document.createElement('div')
    gameboard.classList.add('gameboard')
    gamecontainer.appendChild(gameboard)

    for(let i = 0 ; i < 9 ; i++){
        let div = document.createElement('div')
        gameboard.appendChild(div)
    }
}

const game = () => {
    const player1 = CreatePlayer('X')
    const player2 = CreatePlayer('O')
    const restart = document.getElementById('restart')
    const scoreboard = document.querySelector('.scoreboard')
    const roundwinner = document.querySelector('.roundwinner')
    const nextround = document.getElementById('nextround')
    const modeselect = document.querySelector('.ModeSelect')
    scoreboard.classList.add('hidden')
    restart.classList.add('hidden')
    nextround.classList.add('hidden','inactive')


    var winner
    let firstmove = player1.getmark()
    let endgame = false
    let winarray = []

    function getwinnercombination(index,incre){
        winarray[0] = index
        winarray[1] = index-incre
        winarray[2] = index-(incre*2)
    }

    function WinnerCheck(start,end,incre,state){
        player1.resetcounter()
        player2.resetcounter()

        for(let i = start; i < end ; i+= incre){
            if(state[i] == player1.getmark()){
                player1.increaseCounter()
                if(player1.getcounter() == 3) {
                    endgame = true
                    winner = 1
                    getwinnercombination(i,incre)
                }
            }

            else if(state[i] == player2.getmark()){
                player2.increaseCounter()
                if(player2.getcounter() == 3) {
                    endgame = true
                    winner = -1
                    getwinnercombination(i,incre)
                }
            }

            if(!state.includes(null) && player1.getcounter() < 3 && player2.getcounter() < 3) {
                endgame = true
                winner = 0
            }

            if((player1.getcounter() || player2.getcounter()) < 3 && i == end-1 && end < 9){
                if(incre == 1) WinnerCheck(start+3,end+3,incre,state)
                if(incre == 3) WinnerCheck(start+1,end+1,incre,state)
            }

            if((player1.getcounter() || player2.getcounter()) < 3 && i == end-1 && end == 9){
                if(incre == 1) WinnerCheck(0,7,3,state)
                if(incre == 3) WinnerCheck(0,9,4,state)
                if(incre == 4) WinnerCheck(2,7,2,state)
            }
        }  
    }

    function IsGameOver(state){
        WinnerCheck(0,3,1,state)
        if(endgame) return true
    }

    function FindEmptyCells(state){
        let array = []
        for(let i = 0 ; i < 9 ; i++){
            if(state[i] == null) array.push(i)
        }
        return array
    }

    function WhoGotFirstMove(state){
        if(IsGameOver(state) && firstmove == player1.getmark()) firstmove = player2.getmark()
        else if(IsGameOver(state) && firstmove == player2.getmark()) firstmove = player1.getmark()

        return firstmove
    }

    function WhoGotTurn(state){
        let xcounter = state.filter(e => e == player1.getmark()).length
        let ocounter = state.filter(e => e == player2.getmark()).length

        if(firstmove == player1.getmark()){
            if(xcounter > ocounter) return player2.getmark()
                else return player1.getmark()
        }
        else if(firstmove == player2.getmark()){
            if(ocounter > xcounter) return player1.getmark()
                else return player2.getmark()
        }
    }

    function AnnounceWinner(){

        if(IsGameOver(board)){
            if(winner == 1) {
                player1.increaseScore()
                roundwinner.textContent = 'Player X has Won this round'
            }
            else if(winner == -1) {
                player2.increaseScore()
                roundwinner.textContent = 'Player O has Won this round'
            }
            else if(winner == 0) roundwinner.textContent = "It's a tie"
        }
        UpdateScoreBoard(player1.getscore(),player2.getscore())
        const game = document.querySelector('.game')
        game.insertBefore(roundwinner,document.querySelector('.game > div:last-of-type'))
    }
    
    function Minimax(state){
        if(IsGameOver(state)){
            endgame = false
            return winner
        }

        winner = ''

        let emptycells = FindEmptyCells(state)
        
        if(WhoGotTurn(state) == player1.getmark()){
            maxeval = -Infinity
            for(index in emptycells){
                let i = emptycells[index]
                state[i] = player1.getmark()
                maxeval = Math.max(maxeval,Minimax(state))
                state[i] = null
            }
            return maxeval
        }

        if(WhoGotTurn(state) == player2.getmark()){
            mineval = Infinity
            for(index in emptycells){
                let i = emptycells[index]
                state[i] = player2.getmark()
                mineval = Math.min(mineval,Minimax(state))
                state[i] = null
            }
            return mineval
        }
    }

    function BotMoves(state,gameboard){
            let emptycells = FindEmptyCells(state)
            let bestscore = -Infinity
            var bestmove

            for(index in emptycells){
                let i = emptycells[index]
                state[i] = player1.getmark()
                eval = Minimax(state)
                state[i] = null
                if(bestscore < eval){
                    bestscore = eval 
                    bestmove = i
                }
            }
            AppendMark(gameboard,board,bestmove)
            board[bestmove] = player2.getmark()
    }

    function Reset(gameboard){
        for(let i = 0 ; i < 9 ; i++){
            board[i] = null
            gameboard.childNodes[i].replaceChildren()
            gameboard.childNodes[i].classList.value = ''
        }
        roundwinner.textContent = ''
        endgame = false
    }

    const pvpbutton = document.getElementById('pvp')
    const pvabutton = document.getElementById('pva')

    function hide(el){
        el.style.cssText = 'display:none'
    }

    function show(el){
        el.style.cssText = 'display:grid'
    }
    
    function AppendMark(gameboard,state,index){
        const omark = document.createElement('img')
        const xmark = document.createElement('img')
        omark.src = 'css/images/circle.svg'
        xmark.src = 'css/images/cross.svg'

        if(WhoGotTurn(state) == player1.getmark()) gameboard.childNodes[index].appendChild(xmark)
        else gameboard.childNodes[index].appendChild(omark)
    }

    function highlightwinner(gameboard,state){
        if(IsGameOver(state)){
            for(index in winarray){
                let x = winarray[index]
                gameboard.childNodes[x].firstElementChild.classList.add('filterWhite')
                if(winner == 1){
                    gameboard.childNodes[x].classList.add('recolorBlue')
                }
                else if(winner == -1){
                    gameboard.childNodes[x].classList.add('recolorOrange')
                }
            }
            if(winner == 0){
                gameboard.childNodes.forEach(e => {
                    e.classList.add('recolorGrey')
                    e.firstElementChild.classList.add('filterWhite')
                })
            }
        }
    }

    function UpdateScoreBoard(value1,value2){
        scoreboard.firstElementChild.textContent = `Player X : ${value1}`
        scoreboard.lastElementChild.textContent = `Player 0 : ${value2}`
    }

    function GameMode(mode){
        RenderBoard()
        const gameboard = document.querySelector('.gameboard')
        UpdateScoreBoard(player1.resetscore(),player2.resetscore())
        scoreboard.classList.remove('hidden')
        restart.classList.remove('hidden')
        nextround.classList.remove('hidden')
        hide(modeselect)

        for(let i = 0 ; i < 9 ; i++){
            gameboard.childNodes[i].onclick = () => {
                if(!IsGameOver(board)){
                    if(WhoGotTurn(board) == player1.getmark() && board[i] == null){
                        AppendMark(gameboard,board,i)
                        board[i] = player1.getmark()
                        if(mode == 'pva' && WhoGotTurn(board) == player2.getmark() && !IsGameOver(board)){
                            BotMoves(board,gameboard)
                        }
                    }
                    else if(mode == 'pvp' && WhoGotTurn(board) == player2.getmark()){
                        AppendMark(gameboard,board,i)
                        board[i] = player2.getmark()
                    }
                    AnnounceWinner(board)
                    WhoGotFirstMove(board)
                }
                if(endgame){
                    nextround.classList.value = ''
                    nextround.classList.add('active')
                    nextround.onclick = () => {
                        Reset(gameboard)
                        nextround.classList.value = ''
                        nextround.classList.add('inactive')
                        if(mode == 'pva' && WhoGotTurn(board) == player2.getmark() && !IsGameOver(board)){
                            BotMoves(board,gameboard)
                        }
                    }
                }

                highlightwinner(gameboard,board)
            }
        }

        restart.onclick = () =>{
            Reset(gameboard)
            UpdateScoreBoard(player1.resetscore(),player2.resetscore())
            scoreboard.classList.add('hidden')
            restart.classList.add('hidden')
            nextround.classList.add('hidden')
            firstmove = player1.getmark()
            const gamecontainer = document.querySelector('.gamecontainer')
            gamecontainer.removeChild(gameboard)
            show(modeselect)
        }
        
    }

    pvpbutton.onclick = () => GameMode('pvp')
    pvabutton.onclick = () => GameMode('pva')

    function SwitchIconToText(button,content){
        let title = document.createElement('div')
        title.textContent = `${content}`
        button.appendChild(title)
    }

    pvpbutton.onmouseenter = () => {
        SwitchIconToText(pvpbutton,'player vs player',)
    }

    pvabutton.onmouseenter = () => {
        SwitchIconToText(pvabutton,'player vs bot',)
    }

    pvpbutton.onmouseleave = () => {
        pvpbutton.removeChild(pvp.lastElementChild)
    }

    pvabutton.onmouseleave = () => {
        pvabutton.removeChild(pva.lastElementChild)
    }
}

document.querySelector('.footer > img').onclick = () => {
    window.open('https://github.com/The-Chosen-Goose/Project-Tic-Tac-Toe','_blank')
}

game()