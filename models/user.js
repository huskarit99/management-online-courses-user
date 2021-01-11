const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var UserSchema = new Schema(
    {
        name: { type: String, require: true, max: 50 },
        email: { type: String, require: true, max: 100 },
        username: { type: String, require: true, max: 50 },
        password: { type: String, require: true, max: 100 },
        role: { type: Number, require: true, max: 2 },
        status: { type: Number, require: true, max: 2 }
    });

module.exports = mongoose.model('User', UserSchema);