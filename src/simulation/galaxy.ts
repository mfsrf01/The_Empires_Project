export type ResourceType = "metal" | "minerals" | "fuel" | "energy" | "research";

export type AnomalyType = "gravity-well" | "radiation-storm" | "temporal-distortion" | "derelict";
export type BeltRichness = "sparse" | "moderate" | "rich";

export interface StarAnomaly {
  id: string;
  type: AnomalyType;
  description: string;
  impact: {
    resource?: ResourceType;
    modifier: number;
  };
}

export interface AsteroidBelt {
  id: string;
  name: string;
  richness: BeltRichness;
  primaryResource: ResourceType;
  yieldPerHour: number;
}

export interface ResourceSource {
  type: ResourceType;
  productionRatePerHour: number;
}

export interface PlanetEnvironment {
  gravity: number;
  atmosphereDensity: number;
  temperatureKelvin: number;
  habitabilityIndex: number;
}

export interface OrbitalPosition {
  orbitalRadiusAU: number;
  orbitalPeriodDays: number;
  angleRadians: number;
}

export interface Planet {
  id: string;
  name: string;
  position: OrbitalPosition;
  environment: PlanetEnvironment;
  resourceSources: ResourceSource[];
  resourceInventory: Record<ResourceType, number>;
  resourceRemainder: Record<ResourceType, number>;
  lastUpdatedMs: number;
  isControlled: boolean;
}

export type StarType = "O" | "B" | "A" | "F" | "G" | "K" | "M";

export interface Star {
  id: string;
  name: string;
  type: StarType;
  massSolar: number;
  radiusSolar: number;
  luminositySolar: number;
  planets: Planet[];
  anomalies: StarAnomaly[];
  asteroidBelts: AsteroidBelt[];
}

export interface SolarSystem {
  id: string;
  name: string;
  star: Star;
}

export interface Galaxy {
  id: string;
  name: string;
  solarSystems: SolarSystem[];
}

export interface GalaxyConfig {
  solarSystemCount?: number;
}

const RESOURCE_TYPES: ResourceType[] = [
  "metal",
  "minerals",
  "fuel",
  "energy",
  "research"
];

const PLANET_RESOURCE_TYPES: ResourceType[] = ["metal", "minerals", "fuel", "research"];
const ENERGY_REDISTRIBUTION_TYPES: ResourceType[] = ["metal", "minerals"];
const BELT_RESOURCE_TYPES: ResourceType[] = ["metal", "minerals"];

const STAR_TYPES: StarType[] = ["O", "B", "A", "F", "G", "K", "M"];

const HABITABLE_ZONE_MIN_AU = 0.75;
const HABITABLE_ZONE_MAX_AU = 1.5;

const DEFAULT_SOLAR_SYSTEM_COUNT = 4;

const BELT_RICHNESS_FACTORS: Record<BeltRichness, number> = {
  sparse: 0.5,
  moderate: 1,
  rich: 1.6
};

const ANOMALY_DESCRIPTIONS: Record<AnomalyType, { description: string; impactRange: [number, number]; resourceBias?: ResourceType }> = {
  "gravity-well": {
    description: "Localized gravity disturbances affect orbital traffic patterns.",
    impactRange: [0.8, 1.2],
    resourceBias: "fuel"
  },
  "radiation-storm": {
    description: "Charged particles bombard the system with high-energy storms.",
    impactRange: [0.7, 0.95],
    resourceBias: "minerals"
  },
  "temporal-distortion": {
    description: "Chronal anomalies create unpredictable time dilation pockets.",
    impactRange: [1.05, 1.3],
    resourceBias: "research"
  },
  derelict: {
    description: "A derelict megastructure drifts in the system awaiting salvage.",
    impactRange: [1.1, 1.5],
    resourceBias: "metal"
  }
};

export function generateGalaxy(config: GalaxyConfig = {}): Galaxy {
  const solarSystemCount = config.solarSystemCount ?? DEFAULT_SOLAR_SYSTEM_COUNT;
  const solarSystems: SolarSystem[] = [];

  for (let i = 0; i < solarSystemCount; i += 1) {
    solarSystems.push(createSolarSystem());
  }

  if (solarSystems[0]?.star.planets[0]) {
    solarSystems[0].star.planets[0].isControlled = true;
  }

  return {
    id: randomId("galaxy"),
    name: `Galaxy-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
    solarSystems
  };
}

function createSolarSystem(): SolarSystem {
  const star = createStar();
  return {
    id: randomId("system"),
    name: `${star.name} System`,
    star
  };
}

function createStar(): Star {
  const type = randomChoice(STAR_TYPES);
  const massSolar = randomRange(0.5, 2.5);
  const luminositySolar = massSolar ** 3.5;
  const radiusSolar = massSolar ** 0.8;

  const starName = `Star-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const star: Star = {
    id: randomId("star"),
    name: starName,
    type,
    massSolar: Number(massSolar.toFixed(2)),
    radiusSolar: Number(radiusSolar.toFixed(2)),
    luminositySolar: Number(luminositySolar.toFixed(2)),
    planets: [],
    anomalies: createStarAnomalies(),
    asteroidBelts: createAsteroidBelts()
  };

  const planetCount = Math.floor(randomRange(2, 6));
  for (let i = 0; i < planetCount; i += 1) {
    star.planets.push(createPlanet(star.name, i));
  }

  return star;
}

function createPlanet(starName: string, index: number): Planet {
  const orbitalRadiusAU = createOrbitalRadius(index);
  const orbitalPeriodDays = Math.sqrt(orbitalRadiusAU ** 3) * 365.25;

  const resourceSources = PLANET_RESOURCE_TYPES.map((resource) =>
    createPlanetResource(resource, index)
  );

  const resourceInventory = createInitialInventory();
  const resourceRemainder = createInitialRemainders();
  const now = Date.now();

  const gravity = randomRange(6, 22);
  const atmosphereDensity = randomRange(0.2, 2.4);
  const temperatureKelvin = randomRange(90, 900);
  const habitabilityIndex = Number(randomRange(0.1, 0.95).toFixed(2));

  return {
    id: randomId("planet"),
    name: `${starName}-${index + 1}`,
    position: {
      orbitalRadiusAU: Number(orbitalRadiusAU.toFixed(2)),
      orbitalPeriodDays: Number(orbitalPeriodDays.toFixed(1)),
      angleRadians: Number(randomRange(0, Math.PI * 2).toFixed(4))
    },
    environment: {
      gravity: Number(gravity.toFixed(2)),
      atmosphereDensity: Number(atmosphereDensity.toFixed(2)),
      temperatureKelvin: Number(temperatureKelvin.toFixed(2)),
      habitabilityIndex
    },
    resourceSources,
    resourceInventory,
    resourceRemainder,
    lastUpdatedMs: now,
    isControlled: false
  };
}

function createResourceSource(type: ResourceType): ResourceSource {
  const baseRates: Record<ResourceType, number> = {
    metal: 3600,
    minerals: 4000,
    fuel: 1000,
    energy: 3600,
    research: 100
  };

  const productionRatePerHour = baseRates[type];
  return {
    type,
    productionRatePerHour
  };
}

function createInitialInventory(): Record<ResourceType, number> {
  return RESOURCE_TYPES.reduce((acc, resource) => {
    acc[resource] = 0;
    return acc;
  }, {} as Record<ResourceType, number>);
}

function createInitialRemainders(): Record<ResourceType, number> {
  return RESOURCE_TYPES.reduce((acc, resource) => {
    acc[resource] = 0;
    return acc;
  }, {} as Record<ResourceType, number>);
}

function randomId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function randomChoice<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function randomRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function createStarAnomalies(): StarAnomaly[] {
  const anomalyCount = Math.random() < 0.6 ? 1 : 0;
  const anomalies: StarAnomaly[] = [];

  for (let i = 0; i < anomalyCount; i += 1) {
    anomalies.push(createAnomaly());
  }

  return anomalies;
}

function createAnomaly(): StarAnomaly {
  const type = randomChoice(Object.keys(ANOMALY_DESCRIPTIONS) as AnomalyType[]);
  const config = ANOMALY_DESCRIPTIONS[type];
  const modifier = Number(randomRange(...config.impactRange).toFixed(2));
  const resource = config.resourceBias ?? randomChoice(PLANET_RESOURCE_TYPES);

  return {
    id: randomId("anomaly"),
    type,
    description: config.description,
    impact: {
      resource,
      modifier
    }
  };
}

function createAsteroidBelts(): AsteroidBelt[] {
  const beltCount = Math.random() < 0.7 ? Math.floor(randomRange(1, 3)) : 0;
  const belts: AsteroidBelt[] = [];

  for (let i = 0; i < beltCount; i += 1) {
    const richness = randomChoice(["sparse", "moderate", "rich"] as BeltRichness[]);
    const primaryResource = randomChoice(BELT_RESOURCE_TYPES);
    const yieldPerHour = Math.round(800 * BELT_RICHNESS_FACTORS[richness] * randomRange(0.8, 1.3));

    belts.push({
      id: randomId("belt"),
      name: `Belt-${Math.random().toString(36).slice(2, 5).toUpperCase()}`,
      richness,
      primaryResource,
      yieldPerHour
    });
  }

  return belts;
}

function createOrbitalRadius(index: number): number {
  if (index === 0) {
    return randomRange(0.3, 0.8);
  }

  const base = 0.4 + index * randomRange(0.3, 0.8);
  return Math.min(base + randomRange(-0.1, 0.2), 5);
}

function createPlanetResource(type: ResourceType, index: number): ResourceSource {
  const baseSource = createResourceSource(type);
  const variance = randomRange(0.6, 1.6);
  const orbitBias = 1 + index * 0.05;

  return {
    type,
    productionRatePerHour: Math.max(0, Math.round(baseSource.productionRatePerHour * variance * orbitBias))
  };
}

