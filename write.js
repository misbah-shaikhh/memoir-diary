function format(command) {
  const editor = document.getElementById('textInput');

  switch (command) {
    case 'bold':
    case 'italic':
    case 'underline':
      document.execCommand(command);
      break;
    case 'left':
      document.execCommand('justifyLeft');
      break;
    case 'center':
      document.execCommand('justifyCenter');
      break;
    case 'right':
      document.execCommand('justifyRight');
      break;
  }
  editor?.focus();
}

// Font style control
const fontWeightDropdown = document.getElementById('fontWeight');
fontWeightDropdown?.addEventListener('change', function () {
  const editor = document.getElementById('textInput');
  if (editor) editor.style.fontFamily = this.value;
});

// Text color control
const textColorPicker = document.getElementById('textColor');
textColorPicker?.addEventListener('input', function () {
  document.execCommand('foreColor', false, this.value);
});

// List control
const listDropdown = document.getElementById('listStyle');
listDropdown?.addEventListener('change', function () {
  const command = this.value === 'ul' ? 'insertUnorderedList' : 'insertOrderedList';
  document.execCommand(command);
});

// Bold, italic, underline, strikethrough toggles
const editor = document.querySelector('.editor-box');

document.querySelector('button[data-command="bold"]')?.addEventListener('click', () => {
  document.execCommand('bold');
  editor?.focus();
});

document.querySelector('button[data-command="italic"]')?.addEventListener('click', () => {
  document.execCommand('italic');
  editor?.focus();
});

document.querySelector('button[data-command="underline"]')?.addEventListener('click', () => {
  document.execCommand('underline');
  editor?.focus();
});

document.querySelector('button[data-command="strikeThrough"]')?.addEventListener('click', () => {
  document.execCommand('strikeThrough');
  editor?.focus();
});

// Text align toggle
const leftAlignButton = document.querySelector('button[onclick="format(\'left\')"]');
const centerAlignButton = document.querySelector('button[onclick="format(\'center\')"]');
const rightAlignButton = document.querySelector('button[onclick="format(\'right\')"]');

leftAlignButton?.addEventListener('click', () => {
  document.execCommand('justifyLeft');
  editor?.focus();
});

centerAlignButton?.addEventListener('click', () => {
  document.execCommand('justifyCenter');
  editor?.focus();
});

rightAlignButton?.addEventListener('click', () => {
  document.execCommand('justifyRight');
  editor?.focus();
});

// highlight 
let isHighlighting = false;
let selectedHighlightColor = '#ffff00';

const highlightBtn = document.getElementById('highlightBtn');
const stopHighlightBtn = document.getElementById('stopHighlightBtn');
const highlightColorInput = document.getElementById('highlightColor');

highlightColorInput?.addEventListener('input', function () {
  selectedHighlightColor = this.value;
});

highlightBtn?.addEventListener('click', () => {
  isHighlighting = true;
  document.execCommand('hiliteColor', false, selectedHighlightColor);
  highlightBtn.classList.add('active');
  stopHighlightBtn?.classList.remove('active');
  editor?.focus();
});

stopHighlightBtn?.addEventListener('click', () => {
  isHighlighting = false;
  document.execCommand('removeFormat', false, null);
  highlightBtn?.classList.remove('active');
  stopHighlightBtn.classList.add('active');
  editor?.focus();
});

// ---- Theme toggling using your star buttons ----
const lightStar = document.querySelector('.star.white');
const darkStar = document.querySelector('.star.black');

function applyTheme(theme) {
  document.body.classList.remove('light', 'dark');
  document.body.classList.add(theme);
  localStorage.setItem('theme', theme);

  lightStar?.classList.toggle('active', theme === 'light');
  darkStar?.classList.toggle('active', theme === 'dark');
}

lightStar?.addEventListener('click', () => applyTheme('light'));
darkStar?.addEventListener('click', () => applyTheme('dark'));

window.addEventListener('load', () => {
  const saved = localStorage.getItem('theme') || 'light';
  applyTheme(saved);
});

document.getElementById('write-btn')?.addEventListener('click', () => {
  const theme = localStorage.getItem('theme') || 'light';
  window.location.href = `write.html?theme=${theme}`;
});
// saving a note

  async function saveOrArchiveNote(isArchive = false) {
    const editor = document.getElementById('textInput');
    const content = editor.innerHTML.trim();  // HTML content
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const firstLine = tempDiv.innerText.split("\n")[0].trim();
    const title = firstLine || "Untitled Note";
  
    if (!content || !title) {
      alert("Please write something before saving.");
      return;
    }
  
    const token = localStorage.getItem("token");
  
    if (!token) {
      alert("You must be logged in to save a note.");
      return;
    }
  
    try {
      const response = await fetch("https://memoir-diary.onrender.com/api/auth/save-note", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title,
          body: content,
          archived: isArchive  // ✅ Important: send `archived` status to server
        })
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        alert("Error: " + (data.error || data.message));
        return;
      }
  
      alert(isArchive ? "Note archived successfully!" : "Note saved successfully!");
  
      if (isArchive) {
        window.location.href = "archives.html"; // ✅ Go to archives page
      } else {
        window.location.href = "entries.html"; // Normal note goes to entries
      }
    } catch (err) {
      console.error(err);
      alert("Error saving note: " + err.message);
    }
  }
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.save-note')?.addEventListener('click', () => {
      saveOrArchiveNote(false);  // Save normally
    });
  
    document.getElementById('archive-note-btn')?.addEventListener('click', () => {
      saveOrArchiveNote(true);   // Save as archived
    });
  });
  

