const mongoose = require('mongoose');
const passportLocalMoongoose = require('passport-local-mongoose');

const Schema = mongoose.Schema;

userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
})

userSchema.plugin(passportLocalMoongoose);
module.exports = mongoose.model('User', userSchema);
