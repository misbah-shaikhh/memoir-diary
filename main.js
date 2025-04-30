const userEmailEl = document.getElementById("user-email");
const logoutBtn = document.getElementById("logout-btn");
const bioInput = document.getElementById("user-bio");
const saveBioBtn = document.getElementById("save-bio");
const profilePic = document.getElementById("profile-pic");
const lightBtn = document.getElementById("light-theme");
const darkBtn = document.getElementById("dark-theme");
const writeBtn = document.getElementById("write-btn");

// Check if user is logged in
window.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "main.html";
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const user = await res.json();
    console.log("Fetched user:", user);

    if (!res.ok) throw new Error(user.message);

    if (userEmailEl) userEmailEl.textContent = user.email;
    if (bioInput) bioInput.value = user.bio || "";
    if (profilePic) profilePic.src = "default.jpg"; // Always use default profile picture
  } catch (err) {
    console.error(err);
    window.location.href = "main.html";
  }
});

// Save bio
if (saveBioBtn && bioInput) {
  saveBioBtn.addEventListener("click", async () => {
    const token = localStorage.getItem("token");
    const bio = bioInput.value;

    try {
      const res = await fetch("http://localhost:5000/api/auth/update-bio", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bio }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      alert("Bio saved!");
    } catch (err) {
      console.error(err);
      alert("Failed to save bio");
    }
  });
}

// Logout
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    window.location.href = "index.html";
  });
}

// Theme toggling
if (lightBtn) {
  lightBtn.addEventListener("click", () => {
    document.body.classList.add("light");
    document.body.classList.remove("dark");
    localStorage.setItem("theme", "light");
  });
}

if (darkBtn) {
  darkBtn.addEventListener("click", () => {
    document.body.classList.add("dark");
    document.body.classList.remove("light");
    localStorage.setItem("theme", "dark");
  });
}

window.addEventListener("load", () => {
  const savedTheme = localStorage.getItem("theme");
  document.body.classList.add(savedTheme || "light");
});

if (writeBtn) {
  writeBtn.addEventListener("click", () => {
    const theme = localStorage.getItem("theme") || "light";
    window.location.href = `write.html?theme=${theme}`;
  });
}
