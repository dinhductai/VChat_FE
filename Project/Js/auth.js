// auth.js
function login(email, password) {
  fetch("http://localhost:8080/api/auth/log-in", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
    .then((res) => res.json())
    .then((data) => {
      localStorage.setItem("accessToken", data.token);
    });
}

function getToken() {
  return localStorage.getItem("access_token");
}

function logout() {
  localStorage.removeItem("accessToken");
}
