'use strict'

const mongoose = require('mongoose')
const os = require('os')
const process = require('process')
const SECOND = 5000


//count connections
const countConnect = () => {
    const numConnection = mongoose.connections.length
    console.log(`Number of connection:${numConnection}`)
}

//check overload
const checkOverload = () => {
    setInterval(() => {
        const numConnection = mongoose.connections.length
        const numCores = os.cpus().length
        const memoryUsage = process.memoryUsage().rss
        const maxConnections = numCores * 5

        console.log(`Number of connection:${numConnection}`)
        console.log(`Memory usage: ${memoryUsage / 1024 / 1024} MB`)

        if(numConnection > maxConnections) {
            console.log('Connection overload detected!')
        }
    }, SECOND)
}

module.exports = {countConnect, checkOverload}