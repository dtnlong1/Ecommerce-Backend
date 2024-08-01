const amqp = require('amqplib')
const message = 'new product: title abx'

const runProducer = async () => {
    try {
        const connection = await amqp.connect('amqp://guest:guest@localhost')
        const channel = await connection.createChannel()

        const notificationExchange = 'notificationEx'
        const notiQueue = 'notificationQueueProcess'
        const notificationExchangeDLX = 'notificationExDLX'
        const notificationRoutingKeyDLX = 'notificationRoutingKeyDLX'

        // 1. create exchange
        await channel.assertExchange(notificationExchange, 'direct', {
            durable: true
        })

        // 2. create queue
        const queueResult = await channel.assertQueue(notiQueue, {
            exclusive: false,
            deadLetterExchange:notificationExchangeDLX,
            deadLetterRoutingKey: notificationRoutingKeyDLX
        })

        // 3. bind queue
        await channel.bindQueue(queueResult.queue, notificationExchange)

        // 4. send message
        const msg = 'a new product'
        console.log(msg)
        await channel.sendToQueue(notiQueue, Buffer.from(msg),{
            expiration: '10000'
        })

        setTimeout(() => {
            connection.close()
            process.exit(0)
        }, 500)

    } catch (error) {
        console.error(error)
        throw error
    }
}

runProducer().catch(console.error)