const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true }, // URL of the service image
    price: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
