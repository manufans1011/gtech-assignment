const express = require('express')
const { update } = require('../models/user')
const User = require('../models/user')
const router = new express.Router()
const auth = require('../middleware/auth')
const Vonage = require('@vonage/server-sdk')
const validator = require('validator')
const nodemailer = require("nodemailer");
const {machineId, machineIdSync} = require('node-machine-id')

const vonage = new Vonage({
    apiKey: "5ac46070",
    apiSecret: "Ebw4VJWRPGtRtxgd"
    })

router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try{
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token})
    }catch(e){
        res.status(400).send(e)
    }
})

router.post('/users/login', async (req, res) => {
    try{
        let id = machineIdSync()

        if(req.device.type === "desktop"){
            id = id.concat(req.useragent.browser)
        }

        const user = await User.findByCredentials(req.body.username, req.body.password)
        const deviceids = await User.findExistingDevice(req.body.username, id)
        const token = await user.generateAuthToken()

        if(typeof deviceids == "undefined"){
            await user.saveDeviceId(id)
            
            if(validator.isEmail(req.body.username)){
                // create reusable transporter object using the default SMTP transport
                let transporter = nodemailer.createTransport({
                host: "smtp.pepipost.com",
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: "admin50clvi", // generated ethereal user
                    pass: "Daftarcpns4dminc3n2019", // generated ethereal password
                },
                });
            
                // send mail with defined transport object
                let info = await transporter.sendMail({
                from: '"Gtech Digital Asia" <admin@daftarcpns.id>', // sender address
                to: req.body.username, // list of receivers
                subject: "User Notification", // Subject line
                text: "Test User Notification", // plain text body
                html: "<b>Test User Notification</b>", // html body
                });
            
                console.log("Message sent: %s", info.messageId);
            }
            else if(validator.isMobilePhone(req.body.username)){
                const from = "Gtech Digital Asia"
                const to = req.body.username
                const text = 'Test User Notification'
        
                vonage.message.sendSms(from, to, text, (err, responseData) => {
                    if (err) {
                        console.log(err);
                    } else {
                        if(responseData.messages[0]['status'] === "0") {
                            console.log("Message sent successfully.");
                        } else {
                            console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`);
                        }
                    }
                })
            }
        }

        res.send({ user, token})
    }catch(e){

        console.log(e)
        res.status(400).send()
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try{
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })

        await req.user.save()

        res.send()
    }catch(e){
        res.status(500).send()
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try{
        await req.user.remove()

        res.send(req.user)
    }catch(e){
        res.status(400).send(e)
    }
})

module.exports = router