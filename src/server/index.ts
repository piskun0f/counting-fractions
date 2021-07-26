import path from 'path';

import express from 'express';

import { DB } from './db';

const PORT = 3000;
const app = express();
app.listen(PORT, () => {
    console.log('[server] Server was started');
});

const MIN_INT = 1
const MAX_INT = 11

let currQuestion = ''
let currHTMLQuestion = ''
let currAnswer = ''
let isQuestionAnswered = false

const db = new DB()

function getRandomInt(min = MIN_INT, max = MAX_INT): number {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min) + min)
}

function NOD(a: Array<number>): number {
    const n = a.length
    let x = Math.abs(a[0])
    for (let i = 1; i < n; i++) {
        let y = Math.abs(a[ i ])
        while (x && y) {
            if (x > y) {
                x %= y
            } else {
                y %= x
            }
        }
        x += y;
    }
    return x;
}

function getNewQuestion(): string {
    let num1 = getRandomInt()
    let num2 = getRandomInt()
    if (num1 > num2) {
        const tmp = num1
        num1 = num2
        num2 = tmp
    }
    let num3 = getRandomInt()
    let num4 = getRandomInt()
    if (num3 > num4) {
        const tmp = num3
        num3 = num4
        num4 = tmp
    }
    let numerator = num1 * num4 + num3 * num2
    let denominator = num2 * num4
    const commonDiv = NOD([numerator, denominator])
    if (commonDiv) {
        numerator /= commonDiv
        denominator /= commonDiv
    }
    currAnswer = `${numerator}/${denominator}`

    currQuestion = `${num1}/${num2} + ${num3}/${num4}`
    currHTMLQuestion = `
    <math>
        <mfrac>
            <mn>${num1}</mn>
            <mn>${num2}</mn>
        </mfrac>
        <mo>+</mo>
        <mfrac>
            <mn>${num3}</mn>
            <mn>${num4}</mn>
        </mfrac>
    </math>
    `
    return currHTMLQuestion

}

app.use(express.json());

app.get('/question', (req, res) => {
    if (isQuestionAnswered) {
        res.send(currHTMLQuestion)
    } else {
        res.send(getNewQuestion())
        isQuestionAnswered = false
    }
    db.addLog({
        type: 'question',
        time: new Date().toLocaleString(),
        question: currQuestion
    })
    db.save()
})

app.post('/answer', (req, res) => {
    if (req.body.answer && req.body.user) {
        if (req.body.answer == currAnswer) {
            isQuestionAnswered = false
            res.send(true)
        } else {
            res.send(false)
        }
        db.addLog({
            type: 'answer',
            user: req.body.user,
            time: new Date().toLocaleString(),
            answer: req.body.answer,
            isAnswerRigth: req.body.answer == currAnswer
        })
        db.save()
    } else {
        res.send(null)
    }
})

app.post('/skip', (req, res) => {
    if (req.body.user) {
        res.send(getNewQuestion())
        db.addLog({
            type: 'skip',
            user: req.body.user,
            time: new Date().toLocaleString()
        })
        db.save()
    } else {
        res.send(null)
    }
})

app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../dist/app/index.html'));
});

app.get('/logs', (req, res) => {
    res.send(db.json())
})

app.get('/stats', (req, res) => {
    res.send(db.getStats())
})

app.use(express.static(path.resolve(__dirname, '../../dist/app')));
