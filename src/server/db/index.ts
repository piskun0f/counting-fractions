import fs from 'fs'
import path from 'path'
import readline from 'readline'

interface Log {
    type: 'question' | 'answer' | 'skip'
    time: string
}

export interface LogQuestion extends Log {
    type: 'question'
    question: string
}

export interface LogAnswer extends Log {
    type: 'answer'
    user: string
    answer: string
    isAnswerRigth: boolean
}

export interface LogSkipQuestion extends Log {
    type: 'skip'
    user: string
}

export interface UserStat {
    username: string
    rigthAnswers: number
    wrongAnswers: number
    skipAnswers: number
}

export interface Stats {
    [date: string]: {
        [username: string]: UserStat
    }
}

export class DB {
    filename: string
    filepath: string
    logs: Array<LogQuestion | LogAnswer | LogSkipQuestion>

    constructor(filename = 'db') {
        this.filename = filename
        this.filepath = path.resolve(__dirname, '../../../dist/', filename)
        this.logs = []
        this.readDB()
    }

    readDB(): void {
        if (fs.existsSync(this.filepath)) {
            const rd = readline.createInterface({
                input: fs.createReadStream(this.filepath),
                output: process.stdout,
                terminal: false
            })

            const logs = this.logs

            rd.on('line', function(line) {
                if (line) {
                    const log: LogQuestion | LogAnswer | LogSkipQuestion =  JSON.parse(line)
                    logs.push(log)
                }
            });
        }
    }

    writeDB(): void {
        fs.writeFile(this.filepath, this.string(), (err) => {
            if (err)
                return console.log(err);
            console.log('Write DB to ' + this.filename);
        });
    }

    getStats() {
        const stats: Stats = {
            allTime: {}
        }
        for (const log of this.logs) {
            if ('user' in log) {
                if (!(log.user in stats.allTime)) {
                    stats.allTime[log.user] = {
                        username: log.user,
                        rigthAnswers: 0,
                        wrongAnswers: 0,
                        skipAnswers: 0
                    }
                }
            }

            if (log.type == 'answer') {
                if (log.isAnswerRigth) {
                    stats.allTime[log.user].rigthAnswers++
                } else {
                    stats.allTime[log.user].wrongAnswers++
                }
            } else if (log.type == 'skip') {
                stats.allTime[log.user].skipAnswers++
            }
        }

        return stats
    }

    string(): string {
        let res = ''
        for (const log of this.logs) {
            res += JSON.stringify(log) + '\n'
        }
        return res
    }

    json(): Array<LogQuestion | LogAnswer | LogSkipQuestion> {
        return this.logs
    }

    addLog(log: LogQuestion | LogAnswer | LogSkipQuestion): void {
        this.logs.push(log)
    }

    save(): void {
        this.writeDB()
    }
}
