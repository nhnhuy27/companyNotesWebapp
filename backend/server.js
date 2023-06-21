require('dotenv').config()
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const mongoose = require('mongoose')
const colors = require('colors')


const {logger, logEvents} = require('./middleware/loggerMiddleware')
const errorHandler = require('./middleware/errorHandlerMiddleware')
const corsOptions = require('./config/corsOptions')
const connectDB = require( './config/dbConnect')

const app = express()

const PORT = process.env.PORT || 3500


connectDB()

app.use(logger)

app.use(express.json())
app.use(cookieParser())
app.use(cors(corsOptions))

app.use('/', express.static(path.join(__dirname, '/public')))

app.use('/', require("./routes/root"))

app.use('/users', require('./routes/userRoutes'))

app.use('/notes', require('./routes/notesRoutes'))

app.all('*', (req, res) => {
    res.status(404)
    if (req.accepts('html')){
        res.sendFile(path.join(__dirname, 'views', '404.html'))
    }
    else if (req.accepts('json')){
        res.json({message: '404 not found'})
    }
    else{
        res.type('txt').send('404 not found')
    }
})

app.use(errorHandler)

mongoose.connection.once('open', () => {
    console.log('connected to MongoDB'.cyan.underline)
    app.listen(PORT, () => console.log(`server running on port ${PORT}`))
})

mongoose.connection.on('error', error => {
    console.log(error)
    logEvents(`${error.no}: ${error.code}\t${error.syscall}\t${error.hostname}`, 'dbError.log')
})