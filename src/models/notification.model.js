'use strict'

const {model, Schema} = require('mongoose')

const DOCUMENT_NAME = 'Notification'
const COLLECTION_NAME = 'Notifications'

/*noti-type: 
ORDER-001: order successfully
ORDER-002: order failed
PROMOTION-001: new promotion
SHOP-001: new product
*/

const notificationSchema = new Schema({
    noti_type: {
        type: String,
        enum: ['ORDER-001', 'ORDER-002', 'PROMOTION-001', 'SHOP-001'],
        required: true
    },
    noti_receiverId: {
        type: Number,
        required: true
    },
    noti_senderId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Shop'
    },
    noti_content: {
        type: String,
        required: true
    },
    noti_options: {
        type: Object,
        default: {}
    }
}, {
    timestamps: true,
    collection: COLLECTION_NAME
})

module.exports = model(DOCUMENT_NAME, notificationSchema)
