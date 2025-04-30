const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Note = require('../models/note'); 
const authenticate = require('../middleware/authenticate');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Register
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashed });
    await newUser.save();
    res.status(201).json({ message: 'Registered successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Login (updated to return user info)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Incorrect password' });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });

    // Return token and user data
    res.json({
      message: 'Login successful',
      token,
      email: user.email,
      bio: user.bio || '',
      photoUrl: user.photoUrl || '' // If you're saving profile pictures
    });
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Update Bio
router.put('/update-bio', authenticate, async (req, res) => {
  const { bio } = req.body;
  if (!bio) return res.status(400).json({ error: 'Bio is required' });

  try {
    const user = await User.findByIdAndUpdate(req.user.id, { bio }, { new: true });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update bio' });
  }
});

// Get current user info
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      email: user.email,
      bio: user.bio || '',
      photoUrl: user.photoUrl || ''
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve user info' });
  }
});

// Save Note (New route to handle saving notes)
router.post('/save-note', authenticate, async (req, res) => {
  const { title, body, archived } = req.body; // ✅ 1. Also extract 'archived'

  if (!title || !body) {
    return res.status(400).json({ error: 'Title and body are required' });
  }

  try {
    // Create a new note with HTML content
    const newNote = new Note({
      userId: req.user.id, // Use the authenticated user's ID
      title,
      body,               // Storing HTML content directly
      archived: archived || false  // ✅ 2. Save the archived status (default false if missing)
    });

    await newNote.save();

    res.status(201).json({
      message: 'Note saved successfully',
      note: newNote
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save note' });
  }
});


// Get all non archived notes for the logged-in user
router.get('/notes', authenticate, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user.id }); // Assuming you store notes with a reference to the user
    res.status(200).json(notes);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch notes' });
  }
});

// Route to toggle favorite status
router.patch('/toggle-favorite/:noteId', authenticate, async (req, res) => {
  try {
    // Find the note by ID
    const note = await Note.findById(req.params.noteId);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Check if the `favorite` field exists in the request body
    if (req.body.favorite === undefined) {
      return res.status(400).json({ message: 'Favorite field is required' });
    }

    // Update the favorite status
    note.favorite = req.body.favorite;

    // Save the updated note
    await note.save();

    // Return a success response with the updated favorite state
    res.status(200).json({ message: 'Favorite state updated', favorite: note.favorite });
  } catch (error) {
    console.error("Error toggling favorite:", error);
    res.status(500).json({ message: 'Failed to toggle favorite state' });
  }
});

// Get all archived notes for the logged-in user
router.get('/archives', authenticate, async (req, res) => {
  try {
    // Ensure user is authenticated and their ID is valid
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const archivedNotes = await Note.find({
      userId: req.user.id,
      archived: true, // Only get archived notes
    });

    // If no archived notes found, return an empty array
    if (archivedNotes.length === 0) {
      return res.status(200).json([]);
    }

    // Send archived notes in the response
    res.status(200).json(archivedNotes);

  } catch (err) {
    console.error(err);  // Log the error for debugging
    res.status(500).json({
      message: 'Failed to fetch archived notes',
      error: err.message,  // Send the error message for better debugging
    });
  }
});



router.delete('/delete-notes', authenticate, async (req, res) => {
  const { ids } = req.body;
  try {
    await Note.deleteMany({ _id: { $in: ids }, userId: req.user.id });
    res.status(200).json({ message: 'Notes deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete notes' });
  }
});

// Update note (e.g., archive/unarchive)
router.patch('/update-note/:noteId', authenticate, async (req, res) => {
  const { noteId } = req.params;
  const { archived } = req.body; // Ensure 'archived' is passed in the request body
  console.log('Archiving note ID:', noteId); // Log the note ID
  console.log('Archived status:', archived); // Log the status

  if (typeof archived !== 'boolean') {
    return res.status(400).json({ message: 'Archived status must be a boolean' });
  }

  try {
    // Update the 'archived' field based on the request body
    const updatedNote = await Note.findOneAndUpdate(
      { _id: noteId, userId: req.user.id },
      { archived: archived }, // Set archived status based on request body
      { new: true } // Return the updated note
    );

    if (!updatedNote) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.status(200).json({ message: 'Note updated successfully', note: updatedNote });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update note' });
  }
});



// Delete a single note
router.delete('/delete-note/:noteId', authenticate, async (req, res) => {
  const { noteId } = req.params;

  try {
    const deletedNote = await Note.findOneAndDelete({ _id: noteId, userId: req.user.id });

    if (!deletedNote) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.status(200).json({ message: 'Note deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete note' });
  }
});

module.exports = router;
