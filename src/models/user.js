const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value){
            if(!validator.isEmail(value) && !validator.isMobilePhone(value, 'id-ID')){
                throw new Error('Username is invalid (only Email or Phone Number format (62xxxxxxxxxxx))')
            }
            
        }
    },
    password: {
        type: String,
        trim: true,
        required: true,
        minlength: 7,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    deviceids: [{
        deviceid: {
            type: String,
            required: true
        }
    }]
})

userSchema.methods.toJSON = function(){
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.deviceids

    return userObject
}

userSchema.methods.generateAuthToken = async function() {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, 'gtechtokengenerator')

    user.tokens = user.tokens.concat({ token })
    await user.save()
    
    return token
}

userSchema.methods.saveDeviceId = async function(deviceid) {
    const user = this

    user.deviceids = user.deviceids.concat({ 'deviceid': deviceid })
    await user.save()
    
    return user
}

userSchema.statics.findByCredentials = async (username, password) => {
    const user = await User.findOne({ 'username': username })

    if(!user){
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch){
        throw new Error('Unable to login')
    }

    return user
}

userSchema.statics.findExistingDevice = async (username, deviceid) => {
    const user = await User.findOne({ 'username': username })

    if(!user){
        throw new Error('Username not found')
    }

    return user.deviceids.find(item => item.deviceid == deviceid)
}

//Hash the plain text password before saving
userSchema.pre('save', async function(next) {
    const user = this
    
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

userSchema.pre('remove', async function(next){
    const user = this
    
    await Task.deleteMany({owner: user._id})

    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User