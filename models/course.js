const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var CourseSchema = new Schema({
    name: { type: String, require: true, max: 50 },
    image: { type: String, require: true, max: 100 },
    description: { type: String, require: true, max: 200 },
    detail: { type: String, require: true, max: 10000 },
    price: { type: Number, require: true },
    discount: { type: Number, require: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User' },
    categoryRootId: { type: Schema.Types.ObjectId, ref: 'Category' },
    categoryChildName: { type: String, require: true, max: 50 },
    views: { type: Number },
    status: { type: Number, require: true, max: 2 },
    isCompleted: { type: Number, required: true, max: 2 },
    subscribers: [{
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        point: { type: Number, default: 0 },
        comment: { type: String, require: true, max: 10000 }
    }],
    videos: [{
        title: { type: String, require: true, max: 100 },
        url: { type: String, require: true, max: 150 },
        isPreviewed: { type: Boolean, default: false }
    }],
}, {
    timestamps: true
});

module.exports = mongoose.model('Course', CourseSchema);