const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, 'Please enter username']
        },
        password: {
            type: String,
            required: [true, 'Please enter password']
        },
        roles: [
            {
                type: String,
                default: 'employee'
            }
        ],
        active:{
            type: Boolean,
            default: true,
        },

    }
)

module.exports = mongoose.model('User', userSchema)