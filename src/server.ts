import express from "express";
import path from "path";
import { generateGalaxy, Galaxy, Planet, ResourceType } from "./simulation/galaxy";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

const publicDir = path.resolve(__dirname, "../public");
const imagesDir = path.resolve(__dirname, "../images");
let currentGalaxy: Galaxy = generateGalaxy();

app.use(express.static(publicDir));
app.use("/images", express.static(imagesDir));

app.get("/api/galaxy", (_req, res) => {
  res.json(updateGalaxyResources(currentGalaxy));
});

app.post("/api/galaxy/regenerate", (_req, res) => {
  currentGalaxy = generateGalaxy();
  res.json(updateGalaxyResources(currentGalaxy));
});

app.use((_req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

function updateGalaxyResources(galaxy: Galaxy): Galaxy {
  galaxy.solarSystems.forEach((system) => {
    system.star.planets = system.star.planets.map(updatePlanetResources);
  });
  return galaxy;
}

function updatePlanetResources(planet: Planet): Planet {
  const now = Date.now();
  const elapsedHours = (now - planet.lastUpdatedMs) / (1000 * 60 * 60);

  if (elapsedHours <= 0) {
    return planet;
  }

  const updatedInventory = { ...planet.resourceInventory };
  const updatedRemainder = { ...planet.resourceRemainder };

  planet.resourceSources.forEach((source) => {
    const produced = source.productionRatePerHour * elapsedHours;
    const total = updatedRemainder[source.type] + produced;
    const wholeUnits = Math.floor(total);
    updatedRemainder[source.type] = total - wholeUnits;
    updatedInventory[source.type] += wholeUnits;
  });

  return {
    ...planet,
    resourceInventory: updatedInventory,
    resourceRemainder: updatedRemainder,
    lastUpdatedMs: now
  };
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

