import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");

  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/services")
      .then((response) => response.json())
      .then((data) => {
        setServices(data);
      })
      .catch((error) => {
        console.error("Error al obtener los servicios:", error);
      });
  }, []);

  const handleBooking = async (event) => {
    event.preventDefault();

    if (!selectedService) {
      return;
    }

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          service_id: selectedService.id,
          appointment_date: date,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "No se pudo crear la reserva");
        return;
      }

      setMessage("✅ ¡Reserva creada correctamente!");

      setName("");
      setEmail("");
      setDate("");
      setSelectedService(null);

    } catch (error) {
      console.error("Error:", error);

      setMessage(
        "❌ No se pudo conectar con el servidor"
      );
    }
  };

  return (
    <div className="container">

      <header className="header">
        <h1>💇 SalonBook</h1>

        <p>
          Reserva tu cita de belleza de forma rápida y sencilla.
        </p>
      </header>

      <h2>Servicios disponibles</h2>

      <div className="services">

        {services.map((service) => (
          <div
            className="service-card"
            key={service.id}
          >

            <h3>{service.name}</h3>

            <p className="price">
              S/ {service.price}
            </p>

            <button
              onClick={() =>
                setSelectedService(service)
              }
            >
              Reservar cita
            </button>

          </div>
        ))}

      </div>

      {selectedService && (
        <form
          className="booking-form"
          onSubmit={handleBooking}
        >

          <h2>📅 Reservar cita</h2>

          <p>
            Servicio:
            <strong>
              {" "}
              {selectedService.name}
            </strong>
          </p>

          <p>
            Precio:
            <strong>
              {" "}
              S/ {selectedService.price}
            </strong>
          </p>

          <input
            type="text"
            placeholder="Tu nombre"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            required
          />

          <input
            type="email"
            placeholder="Tu correo electrónico"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />

          <input
            type="datetime-local"
            value={date}
            onChange={(e) =>
              setDate(e.target.value)
            }
            required
          />

          <button type="submit">
            Confirmar reserva
          </button>

        </form>
      )}

      {message && (
        <div className="message">
          {message}
        </div>
      )}

    </div>
  );
}

export default App;
>>>>>>> 41defff2d4f31445ffd8045fab5adcd2f2874373