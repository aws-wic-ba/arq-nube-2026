const $ = (id) => document.getElementById(id);

async function fetchJson(url) {
  const response = await fetch(url);
  const data = await response.json().catch(() => []);
  if (!response.ok) {
    throw new Error(data.error || `Error al consultar ${url}`);
  }
  return data;
}

async function loadOptions() {
  const serviceSelect = $("serviceId");
  const professionalSelect = $("professionalId");

  serviceSelect.innerHTML = `<option value="">Cargando servicios...</option>`;
  professionalSelect.innerHTML = `<option value="">Cargando profesionales...</option>`;

  try {
    const [services, professionals] = await Promise.all([
      fetchJson("/api/services"),
      fetchJson("/api/professionals")
    ]);

    serviceSelect.innerHTML = `<option value="">Seleccioná un servicio...</option>` +
      services.map(s =>
        `<option value="${s.id}">${s.name} — $${Number(s.price).toLocaleString("es-AR")}</option>`
      ).join("");

    professionalSelect.innerHTML = `<option value="">Seleccioná un profesional...</option>` +
      professionals.map(p =>
        `<option value="${p.id}">${p.name} — ${p.specialty}</option>`
      ).join("");

    if (!services.length) {
      serviceSelect.innerHTML = `<option value="">No hay servicios cargados</option>`;
    }

    if (!professionals.length) {
      professionalSelect.innerHTML = `<option value="">No hay profesionales cargados</option>`;
    }
  } catch (error) {
    console.error(error);
    serviceSelect.innerHTML = `<option value="">No se pudieron cargar los servicios</option>`;
    professionalSelect.innerHTML = `<option value="">No se pudieron cargar los profesionales</option>`;
    $("message").textContent = "No se pudieron cargar los datos. Verificá que Docker Compose esté funcionando.";
  }
}

async function loadAvailability() {
  const professionalId = $("professionalId").value;
  const date = $("date").value;
  if (!professionalId || !date) {
    $("time").innerHTML = `<option value="">Primero elegí profesional y fecha</option>`;
    return;
  }

  $("time").innerHTML = `<option value="">Buscando horarios...</option>`;

  try {
    const slots = await fetchJson(
      `/api/availability?professionalId=${encodeURIComponent(professionalId)}&date=${encodeURIComponent(date)}`
    );

    const available = slots.filter(s => s.available);

    $("time").innerHTML = `<option value="">Seleccioná un horario...</option>` +
      available.map(s => `<option value="${s.time}">${s.time}</option>`).join("");

    if (!available.length) {
      $("time").innerHTML = `<option value="">No hay horarios disponibles</option>`;
    }
  } catch (error) {
    console.error(error);
    $("time").innerHTML = `<option value="">No se pudieron cargar los horarios</option>`;
  }
}

$("professionalId").addEventListener("change", loadAvailability);
$("date").addEventListener("change", loadAvailability);

$("bookingForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  $("message").textContent = "Guardando reserva...";

  const payload = {
    clientName: $("clientName").value.trim(),
    email: $("email").value.trim(),
    phone: $("phone").value.trim(),
    professionalId: $("professionalId").value,
    serviceId: $("serviceId").value,
    date: $("date").value,
    time: $("time").value
  };

  try {
    const response = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      $("message").textContent = data.error || "No se pudo reservar.";
      return;
    }

    $("message").textContent =
      `Turno confirmado. Número de reserva: #${data.appointmentId}`;

    $("bookingForm").reset();
    $("time").innerHTML =
      `<option value="">Primero elegí profesional y fecha</option>`;
    await loadOptions();
  } catch (error) {
    console.error(error);
    $("message").textContent =
      "No se pudo conectar con el servidor. Verificá que Docker Compose esté funcionando.";
  }
});

loadOptions();
