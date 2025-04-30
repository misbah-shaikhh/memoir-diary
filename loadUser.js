document.addEventListener("DOMContentLoaded", () => {
    // Load user profile data from localStorage
    const email = localStorage.getItem("email");
    const bio = localStorage.getItem("bio");
    const photoUrl = localStorage.getItem("photoUrl");
  
    // Load theme from localStorage and apply it
    const theme = localStorage.getItem("theme") || 'light';  // Default to 'light' if no theme is set
    if (theme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  
    // Update username if element exists
    const usernameElement = document.querySelector(".username");
    if (usernameElement) {
      usernameElement.textContent = email ? '@' + email : '@Guest';
    }
  
    // Update bio if element exists
    const bioElement = document.querySelector(".bio");
    if (bioElement) {
      bioElement.textContent = bio && bio.trim() !== '' ? bio : 'No bio available.';
    }
  
    // Update profile picture if element exists
    const profilePicElement = document.querySelector(".profile-pic");
    if (profilePicElement) {
      profilePicElement.src = photoUrl ? photoUrl : 'default.jpg'; // Placeholder if no photoUrl
    }
  });
  