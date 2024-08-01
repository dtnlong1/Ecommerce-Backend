const amqp = require('amqplib')
const message = 'new product: title abx'

const runProducer = async () => {
    try {
        const connection = await amqp.connect('amqp://guest:guest@localhost')
        const channel = await connection.createChannel()

        const queueName = 'test-topic'
        await channel.assertQueue(queueName, {
            durable: true
        })

        //send messages to consumer
        channel.sendToQueue(queueName, Buffer.from(message))
        console.log('message sent')
        setTimeout(() => {
            connection.close()
            process.exit(0)
        }, 500)

    } catch (error) {
        console.error(error)
    }
}

runProducer().catch(console.error)