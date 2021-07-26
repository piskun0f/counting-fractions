import './styles.css'

const URL = 'http://localhost:3000'

let complexity = 0
let currPage = 'start'

const startPage = document.getElementById('startPage');
const startBtn = document.getElementById('startBtn');
const radioComp = document.getElementsByName('complexity');
const username = document.getElementById('username')

const mainPage = document.getElementById('mainPage');
const backBtn = document.getElementById('backBtn')
const question = document.getElementById('question')
const answer = document.getElementById('answer')
const answerBtn = document.getElementById('answerBtn')
const skipBtn = document.getElementById('skipBtn')
const user = document.getElementById('user')

function swapPages(firstPage: HTMLElement, secondPage: HTMLElement): void {
    firstPage.style.display = 'none'
    secondPage.style.display = 'block'
}

function addQuestion(): void {
    fetch(URL + '/question').then((res) => {
        if (res.ok) {
            res.text().then((text) => {
                if (question) {
                    question.innerHTML = text
                }
            }).catch(console.log)
        } else {
            console.log('HTTP Error: ' + String(res.status))
        }
    }).catch(console.log)
}

function sendAnswer(): void {
    if (answer && username && username.value) {
        fetch(URL + '/answer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({
                answer: answer.value,
                user: username.value
            })
        }).then((res) => {
            if (res.ok) {
                res.text().then((text) => {
                    if (text == 'true' && answer) {
                        answer.value = ''
                        addQuestion()
                    }
                }).catch(console.log)
            } else {
                console.log('HTTP Error: ' + String(res.status))
            }
        }).catch(console.log)
    }
}

function skipQuestion() {
    if (username && username.value) {
        fetch(URL + '/skip', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({
                user: username.value
            })
        }).then((res) => {
            if (res.ok) {
                res.text().then((text) => {
                    if (question) {
                        question.innerHTML = text
                    }
                }).catch(console.log)
            } else {
                console.log('HTTP Error: ' + String(res.status))
            }
        }).catch(console.log)
    }
}

function changePage(): void {
    if (currPage == 'start' && startPage && mainPage && username && username.value != '') {
        currPage = 'main'
        swapPages(startPage, mainPage)
        if (user) {
            user.innerText = username.value
        }
        addQuestion()
    }
}

function startBtnClick() {
    for (let i = 0; i < radioComp.length; i++) {
        if (radioComp[i].checked) {
            complexity = radioComp[i].value
        }
    }
    changePage()
}

function backBtnClick() {
    if (currPage == 'main' && startPage && mainPage) {
        swapPages(mainPage, startPage)
        currPage = 'start'
    }
}

function answerBtnClick() {
    sendAnswer()
}

function skipBtnClick() {
    skipQuestion()
}

if (startBtn && radioComp) {
    startBtn.addEventListener('click', () => {
        startBtnClick()
    })
}

if (backBtn) {
    backBtn.addEventListener('click', () => {
        backBtnClick()
    })
}

if (question && answer && answerBtn) {
    answerBtn.addEventListener('click', () => {
        answerBtnClick()
    })
}

if (skipBtn) {
    skipBtn.addEventListener('click', () => {
        skipBtnClick()
    })
}

document.addEventListener('keydown', (e) => {
    if (e.code == 'Enter') {
        e.preventDefault();
        if (currPage == 'start') {
            startBtnClick()
        } else if(currPage == 'main') {
            answerBtnClick()
        }
    }
})
