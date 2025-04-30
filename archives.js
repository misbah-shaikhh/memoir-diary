// Theme toggle
document.addEventListener('DOMContentLoaded', () => {
  const darkBtn = document.querySelector('.star.black');
  const lightBtn = document.querySelector('.star.white');

  if (darkBtn && lightBtn) {
    // Add event listener for dark theme
    darkBtn.addEventListener('click', () => {
      document.body.classList.add('dark');
      document.body.classList.remove('light');
      localStorage.setItem('theme', 'dark');  // Save the selected theme to localStorage
    });

    // Add event listener for light theme
    lightBtn.addEventListener('click', () => {
      document.body.classList.remove('dark');
      document.body.classList.add('light');
      localStorage.setItem('theme', 'light');  // Save the selected theme to localStorage
    });
  }
});

// Apply saved theme on page load
function applyTheme(theme) {
  if (theme === 'dark') {
    document.body.classList.add('dark');
    document.body.classList.remove('light');
  } else {
    document.body.classList.remove('dark');
    document.body.classList.add('light');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('theme') || 'light';  // Get the theme saved in localStorage, default to 'light'
  applyTheme(saved);  // Apply the saved theme when the page loads
});


// Fetch archived notes when the page loads
document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("You must be logged in to view archived notes.");
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/api/auth/archives", {
      headers: {
        "Authorization": `Bearer ${token}`,
      }
    });

    // Check if the response is okay (status 200-299)
    if (!response.ok) {
      // If response is not ok, handle it and show an error
      const errorMessage = await response.text(); // Get the response as text
      alert("Error fetching archived notes: " + errorMessage);
      return;
    }

    // Parse the JSON response only if the response was successful
    const archivedNotes = await response.json();

    // Check if there are no archived notes
    if (archivedNotes.length === 0) {
      document.getElementById('no-archive-message').style.display = 'block'; // Show "No archived notes" message
    }

    // Display the archived notes
    displayArchivedNotes(archivedNotes);

  } catch (err) {
    console.error(err);
    alert("Failed to fetch archived notes: " + err.message);
  }
});

// Function to display archived notes
function displayArchivedNotes(notes) {
  const archiveContainer = document.getElementById('archive');
  archiveContainer.innerHTML = ''; // Clear any previous content

  notes.forEach(note => {
    const noteCard = document.createElement('div');
    noteCard.classList.add('note-card');
    noteCard.setAttribute('data-id', note._id);

    noteCard.innerHTML = `
      <input type="checkbox" class="note-checkbox" data-id="${note._id}">
      <h3 class="note-title">${note.title}</h3>
      <div class="note-body">${note.body}</div>
      <button class="add-back">Move to Entries</button>
      <button class="delete">Delete</button>
    `;

    // Add event listeners for add-back and delete buttons
    noteCard.querySelector('.add-back').addEventListener('click', async () => {
      await moveNoteFromArchiveToEntries(note._id);
      noteCard.remove(); // Remove the note card from the DOM after moving it
    });

    noteCard.querySelector('.delete').addEventListener('click', async () => {
      if (confirm('Are you sure you want to delete this note?')) {
        await deleteNoteFromArchive(note._id);
        noteCard.remove(); // Remove the note card from the DOM after deletion
      }
    });

    // Add event listener to open modal when clicking on the title or body, not the checkbox
    noteCard.querySelector('.note-title').addEventListener('click', () => {
      openNoteModal(note); // Open modal and pass the note to display in modal
    });

    noteCard.querySelector('.note-body').addEventListener('click', () => {
      openNoteModal(note); // Open modal and pass the note to display in modal
    });

    // Append note card to container
    archiveContainer.appendChild(noteCard);
  });
}

// Function to open the modal and display the note's content
function openNoteModal(note) {
  const modal = document.getElementById('note-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');

  modalTitle.innerText = note.title;
  modalBody.innerHTML = note.body;  // Directly assign content

  // Show the modal
  modal.style.display = 'flex';

  // Close modal functionality
  const closeModalButton = document.getElementById('close-modal');
  closeModalButton.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  // Close modal when clicking outside the modal content
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
}

// Function to move note from archive to entries
async function moveNoteFromArchiveToEntries(noteId) {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("You must be logged in to update notes.");
    return;
  }

  try {
    const res = await fetch(`http://localhost:5000/api/auth/update-note/${noteId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ archived: false }) // Unarchive the note
    });

    const data = await res.json();

    if (!res.ok) {
      alert("Error: " + (data.error || data.message));
    } else {
      console.log(`Note ${noteId} moved back to entries.`);
      alert("Note successfully moved back to Entries!");
    }
  } catch (err) {
    console.error(err);
    alert("Failed to move note: " + err.message);
  }
}

// Example usage (this should be called when fetching archived notes):
// Example notes data
const notes = [
  { _id: '1', title: 'Archived Note 1', body: 'This is an archived note.' },
  { _id: '2', title: 'Archived Note 2', body: 'This is another archived note.' }
];

displayArchivedNotes(notes);

// Function to delete note from archive
async function deleteNoteFromArchive(noteId) {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("You must be logged in to delete notes.");
    return;
  }

  try {
    const res = await fetch(`http://localhost:5000/api/auth/delete-note/${noteId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (!res.ok) {
      alert("Error: " + (data.error || data.message));
    } else {
      console.log(`Note ${noteId} deleted successfully.`);
    }
  } catch (err) {
    console.error(err);
    alert("Failed to delete note: " + err.message);
  }
}


// DELETE BUTTON FUNCTIONALITY
document.querySelector('.start-delete').addEventListener('click', () => {
  const selectedCheckboxes = document.querySelectorAll('.note-checkbox:checked');
  const idsToDelete = Array.from(selectedCheckboxes).map(cb => cb.dataset.id);

  if (idsToDelete.length === 0) {
    alert("Please select at least one note to delete.");
    return;
  }

  const confirmDelete = confirm(`Are you sure you want to delete ${idsToDelete.length} selected note(s)?`);
  if (confirmDelete) {
    deleteNotes(idsToDelete); // Call your function to delete the selected notes
    alert(`${idsToDelete.length} note(s) deleted!`);
  }
});

// START DELETE FUNCTIONALITY + FETCH NOTES
document.addEventListener('DOMContentLoaded', () => {
  const startDeleteBtn = document.getElementById('start-delete');
  const deleteSelectedBtn = document.getElementById('delete-selected');
  const cancelDeleteBtn = document.getElementById('cancel-delete');
  const selectAllBtn = document.getElementById('select-all');

  let selectionMode = false;
  let allSelected = false;

  if (startDeleteBtn && deleteSelectedBtn && cancelDeleteBtn && selectAllBtn) {
    startDeleteBtn.addEventListener('click', () => {
      selectionMode = true;
      allSelected = false;
      toggleSelectionUI(true);
    });

    cancelDeleteBtn.addEventListener('click', () => {
      selectionMode = false;
      allSelected = false;
      toggleSelectionUI(false);
    });

    selectAllBtn.addEventListener('click', () => {
      allSelected = !allSelected;
      document.querySelectorAll('.note-checkbox').forEach(cb => cb.checked = allSelected);
      selectAllBtn.innerText = allSelected ? "Unselect All" : "Select All";

      const anyChecked = document.querySelectorAll('.note-checkbox:checked').length > 0;
      deleteSelectedBtn.style.display = anyChecked ? "inline-block" : "none";
    });

    document.addEventListener('change', (e) => {
      if (e.target.classList.contains('note-checkbox')) {
        const anyChecked = document.querySelectorAll('.note-checkbox:checked').length > 0;
        deleteSelectedBtn.style.display = anyChecked ? "inline-block" : "none";
      }
    });

    deleteSelectedBtn.addEventListener('click', async () => {
      const selectedCheckboxes = document.querySelectorAll('.note-checkbox:checked');
      const idsToDelete = Array.from(selectedCheckboxes).map(cb => cb.dataset.id);

      if (idsToDelete.length === 0) {
        alert("Please select notes to delete.");
        return;
      }

      const confirmDelete = confirm(`Are you sure you want to delete ${idsToDelete.length} note(s)?`);
      if (!confirmDelete) return;

      await deleteNotes(idsToDelete);
      toggleSelectionUI(false); // Exit selection mode after delete
    });
  } else {
    console.log("Some required elements are missing.");
  }

  // After setting up delete functionality, fetch notes
  fetchNotes();
});

// Helper function for deleting notes
async function deleteNotes(idsToDelete) {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch('http://localhost:5000/api/auth/delete-notes', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ ids: idsToDelete })
    });

    if (response.ok) {
      alert("Notes deleted!");
      fetchNotes(); // Refresh the notes list after deletion
    } else {
      alert("Failed to delete notes.");
    }
  } catch (err) {
    console.error(err);
    alert("Error deleting notes.");
  }
}
function toggleSelectionUI(enable) {
  const checkboxes = document.querySelectorAll(".note-checkbox");

  checkboxes.forEach(cb => {
    cb.style.display = enable ? "inline-block" : "none";
    cb.checked = false;
  });

  document.getElementById("delete-selected").style.display = "none";
  document.getElementById("cancel-delete").style.display = enable ? "inline-block" : "none";
  document.getElementById("select-all").style.display = enable ? "inline-block" : "none";
  document.getElementById("start-delete").style.display = enable ? "none" : "inline-block";

  if (enable) {
    document.getElementById("select-all").innerText = "Select All";
  }
}

// DELETE SINGLE NOTE (for delete button inside each note)
async function deleteSingleNote(noteId) {
  const token = localStorage.getItem('token');

  const confirmDelete = confirm("Are you sure you want to delete this note?");
  if (!confirmDelete) return;

  try {
    const response = await fetch('http://localhost:5000/api/auth/delete-notes', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ ids: [noteId] })  // wrap the noteId in an array
    });

    if (response.ok) {
      alert("Note deleted!");
      fetchNotes(); // Reload notes
    } else {
      alert("Failed to delete the note.");
    }
  } catch (err) {
    console.error(err);
    alert("Error deleting the note.");
  }
}

// Function to limit the note content to the first 4 lines
function getPreviewContent(content) {
  const lines = content.split('\n'); // Split content by newlines
  return lines.slice(0, 4).join('\n') + (lines.length > 4 ? '...' : ''); // Show only the first 4 lines
}


function openNoteModal(note) {
  const modal = document.getElementById('note-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');

  // Set the title and body of the modal to the note's title and body
  modalTitle.innerText = note.title;

  // Set the content of the modal body
  modalBody.innerHTML = note.body;

  // Show the modal
  modal.style.display = 'flex';

  // Close modal functionality
  const closeModalButton = document.getElementById('close-modal');
  closeModalButton.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  // Close modal when clicking outside the modal content
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
}

// search bar 
document.addEventListener('DOMContentLoaded', () => {
  const searchBar = document.querySelector('.search-bar');
  
  if (searchBar) {
    // Listen for input events in the search bar
    searchBar.addEventListener('input', (e) => {
      const searchText = e.target.value.toLowerCase(); // Get the search text and convert to lowercase
      searchNotes(searchText);
    });

    // Listen for clicks outside the search bar to remove highlighting
    document.addEventListener('click', (e) => {
      if (!searchBar.contains(e.target)) {
        clearHighlights(); // Remove highlights when clicking outside search bar
      }
    });
  }
});

function searchNotes(searchText) {
  const noteCards = document.querySelectorAll('.note-card'); // Get all note cards
  let foundMatch = false; // To track if a match is found

  noteCards.forEach(noteCard => {
    const noteTitle = noteCard.querySelector('.note-title').innerText.toLowerCase();
    const noteBody = noteCard.querySelector('.note-body').innerText.toLowerCase();
    
    // If the searchText matches the title or body of the note, highlight the note
    if (noteTitle.includes(searchText) || noteBody.includes(searchText)) {
      noteCard.style.backgroundColor = '#f0f0f0'; // Highlight color for the note
      noteCard.style.border = '2px solid #ff0'; // Border color for highlighted note

      // Scroll the note into view if it's not already in view
      noteCard.scrollIntoView({
        behavior: 'smooth', // Smooth scrolling
        block: 'center',    // Align the note in the center of the viewport
        inline: 'nearest'   // Ensure that it scrolls horizontally, if needed
      });

      foundMatch = true;
    } else {
      noteCard.style.backgroundColor = ''; // Reset background color
      noteCard.style.border = ''; // Reset border
    }
  });

  // If no match is found, you can add an optional message or reset the scroll position
  if (!foundMatch) {
    console.log("No notes match the search criteria.");
  }
}

function clearHighlights() {
  const noteCards = document.querySelectorAll('.note-card'); // Get all note cards
  noteCards.forEach(noteCard => {
    noteCard.style.backgroundColor = ''; // Remove background color
    noteCard.style.border = ''; // Remove border
  });
}


async function fetchNotes() {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("You must be logged in to view notes.");
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/api/auth/archives", {
      headers: {
        "Authorization": `Bearer ${token}`,
      }
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      alert("Error fetching notes: " + errorMessage);
      return;
    }

    const notes = await response.json();

    if (notes.length === 0) {
      document.getElementById('no-archive-message').style.display = 'block';
    }

    displayArchivedNotes(notes);
  } catch (err) {
    console.error(err);
    alert("Failed to fetch notes: " + err.message);
  }
}
