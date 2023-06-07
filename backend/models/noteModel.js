const mongoose = require('mongoose')
const autoIncrement = require('mongoose-sequence')(mongoose)

const noteSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        title: {
            type: String,
            required: [true, 'Please enter a title']
        },
        text: {
            type: String,
            required: [true, "Please enter note body"]
        },
        completed: {
            type: Boolean,
            default: false,
        }
    },
    {
        timestamps: true
    }
)

noteSchema.plugin(autoIncrement, {
    inc_field: 'ticket',
    id: 'ticketNum',
    start_seq: 1
})

module.exports = mongoose.model('Note   ', noteSchema)