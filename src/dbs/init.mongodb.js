'use strict'

const dotenv = require('dotenv')
dotenv.config()
const mongoose = require('mongoose')
class Database {
	constructor() {
		this.connect()
	}

	// connect
	connect(type = 'mongodb') {
		if (1 === 1) {
			mongoose.set('debug', true)
			mongoose.set('debug', { color: true })
		}
		mongoose
			.connect(process.env.MONGO_URI, {
				maxPoolSize: 50,
			})
			.then((_) => console.log(`Connected to database`))
			.catch((err) => console.log(`Error: ${err}`))
	}

	static getInstance() {
		if (!Database.instance) {
			Database.instance = new Database()
		}
		return Database.instance
	}
}

const instanceMongodb = Database.getInstance()
module.exports = instanceMongodb
