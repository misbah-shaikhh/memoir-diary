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


// THEME TOGGLE FUNCTIONALITY
const darkDiv = document.querySelector('.star.black');
const lightDiv = document.querySelector('.star.white');
const body = document.body;

// Set the theme when clicked
darkDiv.addEventListener('click', () => {
  body.classList.remove('light');
  body.classList.add('dark');
  localStorage.setItem('theme', 'dark'); // Save theme in localStorage
});

lightDiv.addEventListener('click', () => {
  body.classList.remove('dark');
  body.classList.add('light');
  localStorage.setItem('theme', 'light'); // Save theme in localStorage
});

// ON LOAD, RESTORE SAVED THEME (default to light)
window.addEventListener('load', () => {
  const savedTheme = localStorage.getItem('theme') || 'light'; // Get theme from localStorage (or default to light)
  body.classList.add(savedTheme); // Apply the saved theme
});

// ENTRIES BUTTON NAVIGATION
document.addEventListener('DOMContentLoaded', () => {
  const entriesBtn = document.getElementById('entries-btn');
  
  // Check if the button exists on this page
  if (entriesBtn) {
    entriesBtn.addEventListener('click', () => {
      const theme = localStorage.getItem('theme') || 'light';
      window.location.href = `entries.html?theme=${theme}`;
    });
  } else {
    console.log("Entries button not found. Skipping event listener.");
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
  
    modalTitle.innerText = note.title;
  
    // Directly assign content without sanitizing to test
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
  
// Helper function to sanitize HTML content and remove unwanted tags
function sanitizeHTML(content) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = content;

  const allowedTags = ['UL', 'OL', 'LI', 'STRONG', 'EM', 'B', 'I', 'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'];
  const allElements = tempDiv.getElementsByTagName('*');

  Array.from(allElements).forEach((el) => {
    // If the element is not in the allowed tags list, remove it
    if (!allowedTags.includes(el.nodeName)) {
      el.parentNode.removeChild(el);
    }
  });

  return tempDiv.innerHTML; // Return the sanitized content
}


// Fetch and display notes
async function fetchNotes() {
  const token = localStorage.getItem('token');

  if (!token) {
    alert("You need to log in first!");
    window.location.href = "welcome.html";
    return;
  }

  try {
    const response = await fetch('http://localhost:5000/api/auth/notes', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (response.ok && data && Array.isArray(data)) {
      const favoritesContainer = document.getElementById('favorites');
      const othersContainer = document.getElementById('others');
      favoritesContainer.innerHTML = '';
      othersContainer.innerHTML = '';
      data.forEach(note => {
        const noteElement = document.createElement('div');
        noteElement.classList.add('note-card');
      
        // Create note body and insert HTML content
        const noteBody = document.createElement('p');
        noteBody.classList.add('note-body');
        noteBody.id = `note-body-${note._id}`;
      
        // Use innerHTML to allow formatting (bullets, highlights, etc.) but escape unwanted tags
        noteBody.innerHTML = note.body ? note.body : 'No content available';
      
        // Note element setup
        noteElement.innerHTML = `
          <input type="checkbox" class="note-checkbox" data-id="${note._id}" style="display:none;">
          <h3 class="note-title">${note.title}</h3>
        `;
        
        // Append the note body which has formatted HTML content
        noteElement.appendChild(noteBody);
      
        // Add the delete button and favorite icon
        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-note');
        deleteButton.setAttribute('data-id', note._id);
        deleteButton.textContent = 'Delete';
      
        const favoriteIcon = document.createElement('div');
        favoriteIcon.classList.add('favorite-icon');
        favoriteIcon.setAttribute('data-id', note._id);
        favoriteIcon.setAttribute('data-favorite', note.favorite);
        favoriteIcon.innerHTML = note.favorite ? '⭐' : '☆';
      
        // Append delete button and favorite icon
        noteElement.appendChild(deleteButton);
        noteElement.appendChild(favoriteIcon);
      
        // Attach modal open (note click) - but ignore clicks on checkbox, delete button, favorite
        noteElement.addEventListener('click', (e) => {
          if (!e.target.classList.contains('delete-note') && !e.target.classList.contains('favorite-icon') && !e.target.classList.contains('note-checkbox')) {
            openNoteModal(note);
          }
        });
      
        // Attach single delete button functionality
        noteElement.querySelector('.delete-note').addEventListener('click', (e) => {
          e.stopPropagation(); // Prevent modal from opening
          const noteId = e.target.dataset.id;
          deleteSingleNote(noteId);
        });
      
        // Append note to the correct container (favorites or others)
        if (note.favorite) {
          document.getElementById('favorites').appendChild(noteElement);
        } else {
          document.getElementById('others').appendChild(noteElement);
        }
      });      
    } else {
      console.error("Failed to fetch notes:", data.message || "Unknown error");
      alert("Error fetching notes");
    }
  } catch (error) {
    console.error("Error fetching notes:", error);
    alert("Something went wrong while fetching notes");
  }
}


// Close modal when clicking outside of it
window.addEventListener('click', (e) => {
  const modal = document.getElementById('note-modal');
  if (e.target === modal) {
    modal.style.display = 'none';
  }
});

document.addEventListener('DOMContentLoaded', () => {
  // Adding event listener to the favorite icon
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('favorite-icon')) {
      const noteId = e.target.dataset.id;
      const isFavorite = e.target.dataset.favorite === 'true';

      // Toggle the favorite state
      toggleFavorite(noteId, !isFavorite);

      // Update the UI to reflect the new state
      e.target.innerHTML = isFavorite ? '☆' : '⭐';  // Toggle star icons
      e.target.dataset.favorite = !isFavorite;  // Update the favorite status in data attribute

      // Move the note to favorites if it's marked as favorite
      const noteElement = e.target.closest('.note-card');
      if (!isFavorite) {
        document.getElementById('favorites').appendChild(noteElement); // Move to favorites
      } else {
        document.getElementById('others').appendChild(noteElement); // Move to others
      }
    }
  });
});

// Helper function to toggle the favorite state on the server
async function toggleFavorite(noteId, isFavorite) {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`http://localhost:5000/api/auth/toggle-favorite/${noteId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ favorite: isFavorite })
    });

    const data = await response.json(); // Parse the response

    if (response.ok) {
      // Successful favorite toggle, no alert needed
      console.log('Note favorite state updated');
    } else {
      // Something went wrong with the response, log it instead of alert
      console.error("Failed to update favorite state:", data.message || "Unknown error");
      alert("Failed to update favorite state.");
    }
  } catch (error) {
    console.error("Error toggling favorite state:", error);
    alert('Error toggling favorite state');
  }
}

//search bar 
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
