async function loadServices() {
  try {
    const response = await fetch("http://localhost:5000/api/services");
    const services = await response.json();

    const container = document.getElementById("services-container");
    container.innerHTML = "";

    services.forEach(service => {
      const card = `
        <div class="service-card">
          <h3>${service.title}</h3>
          <p>${service.description}</p>
          <p><strong>KES ${service.price}</strong></p>
          <p>${service.university} • ${service.location}</p>
        </div>
      `;

      container.innerHTML += card;
    });

  } catch (error) {
    console.error("Error loading services:", error);
  }
}

loadServices();