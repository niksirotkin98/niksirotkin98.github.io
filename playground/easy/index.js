//util
function* genA(object, count){
    for(let i = 0; i < count; i++) yield typeof object === 'function'? object(i): object
}
function getArray(object, count){
    return [ ...genA(object, count) ]
}
function getString(object, count){
    return getArray(object, count).join('')
}
const _getA = count => getArray(0, count)

const mrand = (a) => Math.random()*a
const mround = (a) => Math.round(a)
const mfloor = (a) => Math.floor(a)
const mceil = (a) => Math.ceil(a)
const nanzero = (i) => isNaN(i)? 0: i

const intrand = (value) => mround(mrand(value))
function chance1(a){
    if(a < 0) return false
    const count = mceil(1 / a);
    const check = mceil(mrand(count))
    return check == count
}
function chance2(a){
    const arrow = intrand(100)
    const good = mround(a * 100)
    return arrow <= good
}
const chance2short = a => mrand(1) <= a 
function getChance(a){
    const result = chance2short(a)
    console.log("getChance", Math.round(a * 100) + "%", a, result)
    return result
}

const genId = () => crypto.randomUUID()
const spos = (pos) => `${pos[0]},${pos[1]}`
const sxy = (x,y) => `${x},${y}`
const ispos = s => [parseInt(s.split(',')[0]), parseInt(s.split(',')[1])]
const vplus = (a, b) => [a[0] + b[0], a[1] + b[0]]
const vmult = (a, i) => [a[0] * i, a[1] * i]
//util end

let card, ball, log, scoreRoot, elapsedRoot, touchRoot, ballsRoot, sidesRoot, highscoreRoot;
let highscore = parseInt(localStorage.getItem('highscore'))
let highscoreTime = parseInt(localStorage.getItem('highscoreTime'))

highscore = nanzero(highscore)
highscoreTime = nanzero(highscoreTime)

let direction = [0,0]
let speed = 0
let acc = 4
const accacc = 1.05
let ballPos = [0,0]
let ballScale = 1
let elapsed = 5
let score = 0
let used = false
const directions = [
    [1,0],
    [-1,0],
    [0,1],
    [0,-1]
]
let logMessage = []
const getRandomDirection = _ => directions[ Math.floor(Math.random() * 4) ]
let state = 0
/*
    0 - start
    1 - direction created
    2 - player complete
    3 - player fail
*/
let t = 0
let at = 0

/*
    0 - sides
    1 - balls
*/
let gameState = 1

const statesSides = [
    (dt)=>{
        direction = getRandomDirection()
        ballScale = 1
        ballPos = [0,0]
        speed = 0
        used = false
        if(!logMessage[1]) logMessage[1] = ''
        logMessage[1] = spos(direction)
        t += dt
        if(t > 0.25){
            state = 1
            ballScale = 1
            t = 0
        } else {
            ballScale = t * 4
        }
    },
    (dt)=>{
        speed += acc*dt
        ballPos[0] += dt * speed * direction[0]
        ballPos[1] += dt * speed * direction[1]

        if(!logMessage[0]) logMessage[0] = ''
        logMessage[0] = `x: ${ballPos[0]}\ty: ${ballPos[1]}`

        if(Math.abs(ballPos[0]) > 2 || Math.abs(ballPos[1]) > 2){
            state = 3
            t = 0
        }
    },
    (dt)=>{
        t+= dt
        if(t < 0.15){
            ballScale = 1 - t * 6.6
        } else {
            // state = 1
            ballScale = 0
            if(t > 0.25){
                state = 4
                acc *= accacc
            }
            // t = 0
        }
    },
    (dt)=>{
        t+= dt
        if(t < 0.10){
            ballScale = 1 + t * 3
        } else {
            if(t < 0.25){
                ballScale = 1 - (t - 0.10) * 10
            }else{
                ballScale = 0
                state = 4
                elapsed -= 2.5
                // acc *= accacc
                t = 0
            }
        }
    },
    (dt)=>{
        randomGameState()
    }
]

let balls = []
const addBall = (lifetime, diameter) =>{
    const ballRoot = document.createElement('div')
    ballRoot.className = 'point'
    ballRoot.draggable = false
    const id = balls.length + 0
    const color = '#' + [
        'b6e696',
        '1686cd',
        'dc3a70',
        'a95ea3',
        'edc400',
        'FF5714',
        'E4FF1A',
        '347FC4',
        'A5243D'
    ][Math.floor(Math.random()*9)]

    const pos = [Math.random()*3.5 - 1.75, Math.random()*3.5 - 1.75]
    ballRoot.style = `--x: ${pos[0]}; --y: ${pos[1]}; --scale: ${1}; --diameter: ${diameter}; --color: ${color};`;
    ballRoot.addEventListener('mousedown', _ => {
        if(balls[id].scale != 0 && !balls[id].canceled && !balls[id].used){
            balls[id].used = true
        }
    })
    ballsRoot.appendChild(ballRoot)

    balls.push({
        id,
        used: false,
        canceled: false,
        pos,
        root: ballRoot,
        scale: 1,
        time: 0,
        lifetime,
        diameter, 
        color
    })
}

let ballsPars = {
    t: 0,
    dif: 2,
    accDif: 0.95,
    diam: 0.9,
    state: 0,
    used: 0,
    count: 2,
    accCount: 0.1,
}

const statesBalls = [
    (dt)=>{
        ballsPars.t = 0
        ballsPars.used = 0
        const dif = ballsPars.dif

        for(let i = 1; i <= Math.round(ballsPars.count); i++){
            addBall(dif, ballsPars.diam)
        }


        ballsPars.state = 1
    },
    (dt)=>{
        balls.forEach(b => {
            if(b.canceled){
                return
            }
            if(b.used){
                b.scale = 0
                ballsPars.used++
                score++
                elapsed+=2
                b.canceled = true
            } else {
                b.time += dt
                b.scale = 1 - b.time / b.lifetime
            }
            if(b.scale < 0){
                b.scale = 0
                b.canceled = true
                ballsPars.used++
                elapsed-=5
            }
            b.root.style = `--x: ${b.pos[0]}; --y: ${b.pos[1]}; --scale: ${b.scale}; --diameter: ${b.diameter}; --color: ${b.color};`;
        })
        // console.log(ballsUsed)
        if(ballsPars.used == balls.length){
            ballsPars.state = 2
        }
    },
    (dt)=>{
        randomGameState()
    },
    (dt)=>{
        ballsPars.state = 0
        ballsPars.dif *= ballsPars.accDif
        ballsPars.diam *= (2 - ballsPars.accDif)
        ballsPars.count += ballsPars.accCount
        balls.forEach(b => ballsRoot.removeChild(b.root))
        balls = []
    }
]

const randomGameState = ()=>{
    const rstate = Math.floor(Math.random() * 2)
    if(rstate == 0){
        gameState = rstate
        state = 0
    }else {
        gameState = rstate
        ballsPars.state = 3
    }
}


// 87 68 83 65
const keyDown = ({keyCode}) =>{
    if(state == 1 
      //&& !used
      ){
        switch(keyCode){
            case 87: 
                if(spos(direction) == '0,1'){
                    state = 2
                    score+= 1
                    elapsed += 5
                }
                used = true
                break;
            case 68: 
                if(spos(direction) == '1,0'){
                    state = 2
                    score+= 1
                    elapsed += 5
                }
                used = true
                break;
            case 83: 
                if(spos(direction) == '0,-1'){
                    state = 2
                    score+= 1
                    elapsed += 5
                }
                used = true
                break;
            case 65: 
                if(spos(direction) == '-1,0'){
                    state = 2
                    score+= 1
                    elapsed += 5
                }
                used = true
                break;
        }
        return
    } else {
        if(keyCode == 32 && (state == 3 || state == 2) ){
            state = 0
        }
    }
    // console.log(keyCode)
}

const update = (dt) => {
    ball.style = `--x: ${ballPos[0]}; --y: ${ballPos[1]}; --scale: ${ballScale}`;

    if(elapsed > 0){
        if(gameState == 0){
            ballsRoot.classList.add('disable')
            sidesRoot.classList.remove('disable')
            statesSides[state](dt)
        } else {
            ballsRoot.classList.remove('disable')
            sidesRoot.classList.add('disable')
            statesBalls[ballsPars.state](dt)
        }
        elapsed -= dt
        at += dt
        elapsedRoot.innerHTML = `${Math.round(elapsed*10)/10}`
    } else {
        if(score > highscore){
            highscore = score
            highscoreTime = Math.round(at)
            highscoreRoot.innerHTML = `${highscore} for ${highscoreTime}`
            localStorage.setItem('highscore', highscore)
            localStorage.setItem('highscoreTime', highscoreTime)
        }
        elapsedRoot.innerHTML = `Time: ${Math.round(at)}`
    }
    scoreRoot.innerHTML = `${score}`
    if(!logMessage[2]) logMessage[2] = ''
    logMessage[2] = `${used}`


    // log.innerHTML = logMessage.join('<br/>')
}
const updateWrapper = (()=>{
    let startTimestamp = (new Date()).getTime()
    let previous = startTimestamp
    let func = (timestamp) => {
        let dt = (timestamp - previous)/1000
        update(isNaN(dt)?0:dt, startTimestamp - timestamp)
        previous = timestamp
        window.requestAnimationFrame(func)
    }
    return func
})()

window.addEventListener("load", ()=>{
    card = document.querySelector('.card')
    ball = document.querySelector('.ball')
    log = document.querySelector('.log')
    scoreRoot = document.querySelector('.score')
    elapsedRoot = document.querySelector('.elapsed')
    touchRoot = document.querySelector('.touch')
    ballsRoot = document.querySelector('.balls')
    sidesRoot = document.querySelector('.sides')
    highscoreRoot = document.querySelector('.highscore')

    highscoreRoot.innerHTML = `${highscore} for ${highscoreTime}`

    touchRoot.addEventListener('mousedown', ({layerX: x, layerY: y}) => {
        const rx = Math.round((x * Math.cos(Math.PI / 4) + Math.sin(Math.PI / 4) * y ) * 10)/10
        const ry = Math.round((y * Math.cos(Math.PI / 4) - Math.sin(Math.PI / 4) * x ) * 10)/10
        // console.log( rx, ry)
        if(rx > 0){
            if(ry > 0){
                keyDown({keyCode: 83})
            } else {
                keyDown({keyCode: 68})
            }
        } else {
            if(ry > 0){
                keyDown({keyCode: 65})
            } else {
                keyDown({keyCode: 87})
            }
        }
    })

    updateWrapper()
})
window.addEventListener('keydown', keyDown)
