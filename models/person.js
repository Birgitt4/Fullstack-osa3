const { process_params } = require('express/lib/router')
const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

console.log('connecting to', url)
mongoose.connect(url)
    .then(result => {
        console.log('connected to MongoDB')
    })
    .catch((error) => {
        console.log('error connecting to MongoDB:', error.message)
    })

const personSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: 3,
    },
    number: {
        type: String,
        minlength: 8,
        validate: {
            validator: function(n) {
                return /^(\d{2,3}-\d+)$/.test(n);
            },
            message: props => `Give number in form xx-xxxx or xxx-xxxx`
        }
    }
})

personSchema.set('toJSON', {
    transform: (document, returnedOdject) => {
        returnedOdject.id = returnedOdject._id.toString()
        delete returnedOdject._id
        delete returnedOdject.__v
    }
})

module.exports = mongoose.model('Person', personSchema)