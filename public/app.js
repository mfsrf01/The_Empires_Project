const refreshBtn = document.querySelector("#refresh-btn");
const galaxyInfo = document.querySelector("#galaxy-info");
const menuItems = document.querySelectorAll(".menu-item");

let currentView = "overview";
let cachedGalaxy = null;

const INFRASTRUCTURE_DETAILS = {
  metal: {
    title: "Metal Mine",
    description: "Planning upgrades to increase metal extraction efficiency."
  },
  minerals: {
    title: "Mineral Mine",
    description: "Future expansions will boost mineral output."
  },
  fuel: {
    title: "Fuel Synthesizer",
    description: "Enhancements will refine fuel processing throughput soon."
  },
  energy: {
    title: "Energy Grid",
    description: "Grid improvements will raise planetary energy capacity."
  },
  research: {
    title: "Research Laboratory",
    description: "New wings will accelerate scientific breakthroughs later."
  },
  shipyard: {
    title: "Orbital Shipyard",
    description: "Expansion will enable construction of larger hulls."
  },
  spacedock: {
    title: "Space Dock",
    description: "Dock upgrades will support more concurrent vessel refits soon."
  }
};

async function fetchGalaxy() {
  galaxyInfo.innerHTML = "<p>Loading galaxy data...</p>";
  try {
    const response = await fetch("/api/galaxy");
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    const galaxy = await response.json();
    cachedGalaxy = galaxy;
    renderView();
  } catch (error) {
    console.error(error);
    galaxyInfo.innerHTML = `<p class="error">Failed to load galaxy data: ${error}</p>`;
  }
}

function renderView() {
  if (!cachedGalaxy) {
    galaxyInfo.innerHTML = "<p class=\"empty-state\">No data available.</p>";
    return;
  }

  switch (currentView) {
    case "overview":
      renderOverview(cachedGalaxy);
      break;
    case "planet":
      renderPlanetManagement(cachedGalaxy);
      break;
    case "system":
      renderSystemView(cachedGalaxy);
      break;
    case "empire":
    case "research":
    case "shipyard":
    case "fleet":
      galaxyInfo.innerHTML = createPlaceholderPanel(currentView);
      break;
    default:
      galaxyInfo.innerHTML = "<p class=\"empty-state\">Select an option.</p>";
  }
}

function renderOverview(galaxy) {
  if (!galaxy.solarSystems || galaxy.solarSystems.length === 0) {
    galaxyInfo.innerHTML = "<p class=\"empty-state\">No solar systems found.</p>";
    return;
  }

  galaxyInfo.innerHTML = `
    <section class="panel">
      <h2>${galaxy.name}</h2>
      <p><strong>ID:</strong> ${galaxy.id}</p>
    </section>
    <section class="panel overview-placeholder">
      <h3>Frontier Intel</h3>
      <p>Strategic summary dashboard coming soon. Overview will highlight controlled assets, alerts, and empire-wide logistics.</p>
    </section>
  `;
}

function createPlaceholderPanel(view) {
  const titles = {
    empire: "Empire Overview",
    planet: "Planet Management",
    research: "Research Lab",
    shipyard: "Shipyard Operations",
    fleet: "Fleet Command",
    system: "System View"
  };

  return `
    <section class="panel">
      <h2>${titles[view]}</h2>
      <p>Content coming soon. The ${capitalize(view)} interface will appear here.</p>
    </section>
  `;
}

function createPlanetHtml(planet) {
  const resourceCards = createResourceCards(
    planet.resourceSources,
    planet.resourceInventory
  );

  return `
    <article class="planet">
      <div class="planet-details">
        <h4>${planet.name}</h4>
        <p>Gravity: ${planet.environment.gravity} m/s² | Atmosphere Density: ${planet.environment.atmosphereDensity}</p>
        <p>Temperature: ${planet.environment.temperatureKelvin} K | Habitability: ${planet.environment.habitabilityIndex}</p>
        <p>Orbit Radius: ${planet.position.orbitalRadiusAU} AU | Period: ${planet.position.orbitalPeriodDays} days</p>
      </div>
      <div class="planet-resources">
        ${resourceCards}
      </div>
    </article>
  `;
}

function renderPlanetManagement(galaxy) {
  const planetEntries = galaxy.solarSystems.flatMap((system) =>
    system.star.planets
      .filter((planet) => planet.isControlled)
      .map((planet) => ({ planet, system }))
  );

  if (planetEntries.length === 0) {
    galaxyInfo.innerHTML = `
      <section class="panel">
        <h2>Planet Management</h2>
        <p>No controlled colonies yet. Establish a foothold to begin infrastructure planning.</p>
      </section>
    `;
    return;
  }

  const planetsHtml = planetEntries
    .map(({ planet, system }) => createPlanetManagementHtml(planet, system))
    .join("");

  galaxyInfo.innerHTML = `
    <section class="panel">
      <h2>Planet Management</h2>
      <p>Plan infrastructure upgrades for each colony. Upgrade actions will unlock soon.</p>
    </section>
    ${planetsHtml}
  `;
}

function createPlanetManagementHtml(planet, system) {
  const resourceCards = createResourceCards(
    planet.resourceSources,
    planet.resourceInventory
  );
  const infrastructureSection = createInfrastructureSection(planet.resourceSources);

  return `
    <section class="panel planet-management">
      <div class="planet-details">
        <h3>${planet.name}</h3>
        <p>System: ${system.name}</p>
        <p>Gravity: ${planet.environment.gravity} m/s² | Atmosphere Density: ${planet.environment.atmosphereDensity}</p>
        <p>Temperature: ${planet.environment.temperatureKelvin} K | Habitability: ${planet.environment.habitabilityIndex}</p>
        <p>Orbit Radius: ${planet.position.orbitalRadiusAU} AU | Period: ${planet.position.orbitalPeriodDays} days</p>
      </div>
      <div class="planet-resources">
        ${resourceCards}
      </div>
      ${infrastructureSection}
    </section>
  `;
}

function renderSystemView(galaxy) {
  if (!galaxy.solarSystems || galaxy.solarSystems.length === 0) {
    galaxyInfo.innerHTML = "<p class=\"empty-state\">No solar systems available.</p>";
    return;
  }

  const systemsHtml = galaxy.solarSystems
    .map((system) => createSystemDetailHtml(system))
    .join("");

  galaxyInfo.innerHTML = `
    <section class="panel">
      <h2>System Intelligence</h2>
      <p>Survey data across all known systems, including anomalies, asteroid belts, and planetary stats.</p>
    </section>
    ${systemsHtml}
  `;
}

function createSystemDetailHtml(system) {
  const star = system.star;
  const anomaliesSection = createAnomaliesHtml(star.anomalies);
  const beltsSection = createAsteroidBeltsHtml(star.asteroidBelts);
  const planetsHtml = star.planets
    .map((planet, index) => createSystemPlanetCard(planet, index))
    .join("");
  const starHtml = createStarCard(star);

  return `
    <section class="panel system-panel">
      <div class="system-panel__header">
        <div>
          <h3>${system.name}</h3>
          <p>Primary Star: ${star.name} (${star.type}-type)</p>
          <p>Mass: ${star.massSolar} M☉ | Radius: ${star.radiusSolar} R☉ | Luminosity: ${star.luminositySolar} L☉</p>
        </div>
        <div class="system-panel__metrics">
          <span><strong>${star.planets.length}</strong> Planets</span>
          <span><strong>${star.asteroidBelts.length}</strong> Belts</span>
          <span><strong>${star.anomalies.length}</strong> Anomalies</span>
        </div>
      </div>
      <div class="system-panel__intel">
        ${starHtml}
        ${anomaliesSection}
        ${beltsSection}
      </div>
      <div class="system-panel__planets">
        <h4>Planetary Roster</h4>
        <div class="system-planets-grid">
          ${planetsHtml}
        </div>
      </div>
    </section>
  `;
}

function createAnomaliesHtml(anomalies) {
  if (!anomalies || anomalies.length === 0) {
    return `
      <section class="system-anomalies system-anomalies--empty">
        <h5>Anomalies</h5>
        <p>No anomalies detected.</p>
      </section>
    `;
  }

  const items = anomalies
    .map(
      (anomaly) => `
        <article class="system-anomaly">
          <header>
            <strong>${formatLabel(anomaly.type)}</strong>
            <span>${anomaly.impact.resource ? capitalize(anomaly.impact.resource) : "N/A"}</span>
          </header>
          <p>${anomaly.description}</p>
          <footer>Modifier: ${anomaly.impact.modifier}×</footer>
        </article>
      `
    )
    .join("");

  return `
    <section class="system-anomalies">
      <h5>Anomalies</h5>
      <div class="system-anomalies__list">
        ${items}
      </div>
    </section>
  `;
}

function createAsteroidBeltsHtml(asteroidBelts) {
  if (!asteroidBelts || asteroidBelts.length === 0) {
    return `
      <section class="system-belts system-belts--empty">
        <h5>Asteroid Belts</h5>
        <p>No significant belts charted.</p>
      </section>
    `;
  }

  const belts = asteroidBelts
    .map(
      (belt) => `
        <article class="asteroid-belt">
          <header>
            <strong>${belt.name}</strong>
            <span class="asteroid-belt__richness">${capitalize(belt.richness)}</span>
          </header>
          <p>Primary Resource: ${capitalize(belt.primaryResource)}</p>
          <p>Yield: ${formatNumber(belt.yieldPerHour)} / hr</p>
        </article>
      `
    )
    .join("");

  return `
    <section class="system-belts">
      <h5>Asteroid Belts</h5>
      <div class="system-belts__list">
        ${belts}
      </div>
    </section>
  `;
}

function createStarCard(star) {
  return `
    <article class="system-star">
      <header>
        <strong>${star.name}</strong>
        <span class="system-star__type">${star.type}-type</span>
      </header>
      <p>Mass: ${star.massSolar} M☉</p>
      <p>Radius: ${star.radiusSolar} R☉</p>
      <p>Luminosity: ${star.luminositySolar} L☉</p>
      <footer>
        <span>Dyson Sphere Potential</span>
        <span class="system-star__dyson">Not evaluated</span>
      </footer>
    </article>
  `;
}

function createSystemPlanetCard(planet, index) {
  const resourceSummary = createResourceSummary(planet.resourceSources);

  return `
    <article class="system-planet-card">
      <header>
        <h6>${planet.name}</h6>
        <span>Orbit ${index + 1}</span>
      </header>
      <p class="system-planet-card__environment">
        Grav: ${planet.environment.gravity} m/s² · Atmos: ${planet.environment.atmosphereDensity} · Temp: ${planet.environment.temperatureKelvin} K
      </p>
      <p class="system-planet-card__habitability">Habitability Index: ${planet.environment.habitabilityIndex}</p>
      <ul class="planet-resource-summary">
        ${resourceSummary}
      </ul>
    </article>
  `;
}

function createInfrastructureSection(resourceSources) {
  const uniqueTypes = new Set(resourceSources.map((resource) => resource.type));
  uniqueTypes.add("shipyard");
  uniqueTypes.add("spacedock");

  const cards = Array.from(uniqueTypes)
    .map((type) => createInfrastructureCard(type))
    .filter(Boolean)
    .join("");

  if (!cards) {
    return "";
  }

  return `
    <section class="planet-infrastructure">
      <h5>Infrastructure Planning</h5>
      <div class="infrastructure-grid">
        ${cards}
      </div>
    </section>
  `;
}

function createInfrastructureCard(resourceType) {
  const details = INFRASTRUCTURE_DETAILS[resourceType];

  if (!details) {
    return "";
  }

  return `
    <article class="infrastructure-card infrastructure-card--${resourceType}">
      <div class="infrastructure-card__body">
        <strong>${details.title}</strong>
        <p>${details.description}</p>
      </div>
      <button class="infrastructure-card__action" disabled aria-disabled="true" title="Upgrades coming soon">
        +
      </button>
    </article>
  `;
}

function createResourceCards(resourceSources, resourceInventory) {
  return resourceSources
    .map((resource) => {
      const stored = resourceInventory?.[resource.type] ?? 0;
      return `
        <div class="resource-card resource-card--${resource.type}">
          <strong>${capitalize(resource.type)}</strong>
          <p>Total: ${formatNumber(stored)}</p>
          <p>Rate: ${formatNumber(resource.productionRatePerHour)} / hr</p>
        </div>
      `;
    })
    .join("");
}

function createResourceSummary(resourceSources) {
  return resourceSources
    .map(
      (resource) => `
        <li>
          <span>${capitalize(resource.type)}</span>
          <span>${formatNumber(resource.productionRatePerHour)} / hr</span>
        </li>
      `
    )
    .join("");
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatLabel(value) {
  return value
    .split("-")
    .map((segment) => capitalize(segment))
    .join(" ");
}

function formatNumber(value) {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 0
  }).format(value);
}

refreshBtn?.addEventListener("click", () => {
  regenerateGalaxy();
});

menuItems.forEach((item) => {
  item.addEventListener("click", () => {
    menuItems.forEach((btn) => btn.classList.remove("active"));
    item.classList.add("active");
    currentView = item.dataset.view ?? "overview";
    if (currentView === "overview" && !cachedGalaxy) {
      fetchGalaxy();
    } else {
      renderView();
    }
  });
});

// set default active menu
document.querySelector('.menu-item[data-view="overview"]')?.classList.add("active");

fetchGalaxy();

async function regenerateGalaxy() {
  galaxyInfo.innerHTML = "<p>Generating new galaxy...</p>";
  try {
    const response = await fetch("/api/galaxy/regenerate", { method: "POST" });
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    cachedGalaxy = await response.json();
    renderView();
  } catch (error) {
    console.error(error);
    galaxyInfo.innerHTML = `<p class="error">Failed to regenerate galaxy: ${error}</p>`;
  }
}

