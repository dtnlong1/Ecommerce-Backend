const RedisPubSubService = require('../services/redisPubSub.service')

class InventoryServiceTest {
    constructor() {
        RedisPubSubService.subscribe('purchase_events', (channel, message) => {
            RedisPubSubService.updateInventory(message)
        })
    }
    static updateInventory({product, quantity}) {
        console.log(`Updated inventory ${product} with quantity ${quantity}`)
    }
}

module.exports = new InventoryServiceTest()