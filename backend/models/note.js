const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Assuming you have a User model for authentication
        required: true
    },
    title: {
        type: String,
        required: true,
    },
    body: {
        type: String,
        required: true
    },
    favorite: {
        type: Boolean,
        default: false, // Default to false (not a favorite)
    },
    archived: {                 // ✅ ADD THIS FIELD
        type: Boolean,
        default: false,          // By default, notes are NOT archived
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;

