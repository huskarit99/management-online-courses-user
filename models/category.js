const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var CategorySchema = new Schema(
    {
        name: { type: String, require: true, max: 50 },
        categories: [{
            name: { type: String, require: true, max: 50 }
        }]
    });

module.exports = mongoose.model('Category', CategorySchema);