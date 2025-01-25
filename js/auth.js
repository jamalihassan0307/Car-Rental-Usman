///wafof86802@sfxeur.com
///Bwp789456

// Check if user is logged in
function checkAuth() {
  const currentUser = localStorage.getItem("currentUser");
  if (!currentUser) {
    window.location.href = "/index.html";
  } else {
    const user = JSON.parse(currentUser);
    if (window.location.pathname.includes("admin") && user.role_of_user !== 1) {
      window.location.href = "/pages/cars.html";
    }
    if (
      !window.location.pathname.includes("admin") &&
      user.role_of_user === 1
    ) {
      window.location.href = "/pages/admin.html";
    }
  }
}

// Call checkAuth on pages except index.html
if (!window.location.pathname.includes("index.html")) {
  checkAuth();
}

function toggleForm() {
  document.querySelector(".auth-form").classList.toggle("hidden");
  document.getElementById("registerForm").classList.toggle("hidden");
}

document
  .getElementById("loginForm")
  ?.addEventListener("submit", async function (e) {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch(
        "https://678717fcc4a42c91610590e7.mockapi.io/api/users"
      );
      const users = await response.json();
      const user = users.find(
        (u) => u.email === email && u.password === password
      );

      if (user) {
        localStorage.setItem("currentUser", JSON.stringify(user));
        if (user.role_of_user === 1) {
          window.location.href = "/pages/admin.html";
        } else {
          window.location.href = "/pages/cars.html";
        }
      } else {
        alert("Invalid credentials!");
      }
    } catch (error) {
      console.error("Error during login:", error);
      alert("Error during login. Please try again.");
    }
  });

document
  .getElementById("signupForm")
  ?.addEventListener("submit", async function (e) {
    e.preventDefault();

    const userData = {
      name: document.getElementById("name").value,
      email: document.getElementById("regEmail").value,
      password: document.getElementById("regPassword").value,
      image: document.getElementById("imageUrl").value,
      role_of_user: 2,
    };

    try {
      const response = await fetch(
        "https://678717fcc4a42c91610590e7.mockapi.io/api/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        }
      );

      if (response.ok) {
        alert("Registration successful! Please login.");
        toggleForm();
      }
    } catch (error) {
      console.error("Error during registration:", error);
      alert("Error during registration. Please try again.");
    }
  });

// Logout function
function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = "/index.html";
}
