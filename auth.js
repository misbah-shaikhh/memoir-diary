let isLogin = true;

document.getElementById("auth-toggle").addEventListener("click", () => {
  isLogin = !isLogin;
  document.getElementById("auth-button").textContent = isLogin ? "LOGIN" : "REGISTER";
  document.getElementById("form-title").textContent = isLogin ? "LOGIN" : "REGISTER";
  document.getElementById("auth-toggle").textContent = isLogin ? "REGISTER" : "LOGIN";
});

document.getElementById("auth-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Please enter both email and password.");
    return;
  }

  const url = isLogin
    ? "https://memoir-diary.onrender.com/api/auth/login"
    : "https://memoir-diary.onrender.com/api/auth/register";

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      alert("Error: " + (data.error || data.message));
      return;
    }

    if (isLogin) {
      // Save token after login
      localStorage.setItem("token", data.token);

      // Fetch user info using /me endpoint
      const meRes = await fetch("https://memoir-diary.onrender.com/api/auth/me", {
        headers: {
          Authorization: `Bearer ${data.token}`
        }
      });

      const userInfo = await meRes.json();

      if (meRes.ok) {
        localStorage.setItem("email", userInfo.email);
        localStorage.setItem("bio", userInfo.bio || "");
        localStorage.setItem("photoUrl", userInfo.photoUrl || "");
        alert("Logged in successfully!");
        window.location.href = "main.html";
      } else {
        alert("Failed to fetch user info.");
      }
    } else {
      alert("Registered successfully!");
      // Stay on register form or auto-login if you want
    }

  } catch (err) {
    console.error(err);
    alert("Something went wrong: " + err.message);
  }
});

// Function to save a note
async function saveNote(archived = false) {  // ✅ Default to not archived
  const editor = document.getElementById('textInput');
  const content = editor.innerHTML.trim();
  
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
    const response = await fetch("http://:5000/api/auth/save-note", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: title,
        body: content,
        archived: archived   // ✅ Send archived value to backend
      })
    });

    const data = await response.json();

    if (!response.ok) {
      alert("Error: " + (data.error || data.message));
      return;
    }

    alert(archived ? "Note archived successfully!" : "Note saved successfully!");
    window.location.href = archived ? "archives.html" : "entries.html";  // ✅ Redirect based on archive or not
  } catch (err) {
    console.error(err);
    alert("Error saving note: " + err.message);
  }
}
document.getElementById('save-note')?.addEventListener('click', () => {
  saveNote(false);  // Normal save
});

document.getElementById('archive-note-btn')?.addEventListener('click', () => {
  saveNote(true);   // Archive save
});
