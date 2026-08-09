async function login() {
  const response = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: document.getElementById("username").value,
      password: document.getElementById("password").value
    })
  });

  const data = await response.json();
  const message = document.getElementById("loginMessage");

  if (!response.ok) {
    message.textContent = data.error || "No se pudo iniciar sesión.";
    return;
  }

  localStorage.setItem("peluapp_token", data.token);
  window.location.href = "/admin.html";
}

async function loadAppointments() {
  const token = localStorage.getItem("peluapp_token");
  if (!token) {
    window.location.href = "/login.html";
    return;
  }

  const response = await fetch("/api/admin/appointments", {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (response.status === 401) {
    localStorage.removeItem("peluapp_token");
    window.location.href = "/login.html";
    return;
  }

  const rows = await response.json();
  document.getElementById("appointmentsBody").innerHTML = rows.map(a => `
    <tr>
      <td>${a.date}</td>
      <td>${a.time}</td>
      <td>${a.client_name}<br><small>${a.email}</small></td>
      <td>${a.service_name}</td>
      <td>${a.professional_name}</td>
      <td>${a.status}</td>
      <td>${a.status === "reservado"
        ? `<button class="small-button" onclick="cancelAppointment(${a.id})">Cancelar</button>`
        : ""}</td>
    </tr>
  `).join("");

  if (!rows.length) {
    document.getElementById("appointmentsBody").innerHTML =
      `<tr><td colspan="7">Todavía no hay turnos.</td></tr>`;
  }
}

async function cancelAppointment(id) {
  const token = localStorage.getItem("peluapp_token");
  const response = await fetch(`/api/admin/appointments/${id}/cancel`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await response.json();
  document.getElementById("adminMessage").textContent = data.message || data.error || "";
  loadAppointments();
}

const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    login();
  });
}

if (document.getElementById("appointmentsBody")) {
  loadAppointments();
}
