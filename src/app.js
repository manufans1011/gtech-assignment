const express = require('express')
const device = require('express-device')
const useragent = require('express-useragent')
require('./db/mongoose')
const userRouter = require('./routers/user')

const app = express()

app.use(express.json())
app.use(device.capture())
app.use(useragent.express());
app.use(userRouter)

module.exports = app