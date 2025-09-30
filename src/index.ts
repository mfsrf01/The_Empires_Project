import { generateGalaxy } from "./simulation/galaxy";

function main() {
  const galaxy = generateGalaxy();
  console.log(JSON.stringify(galaxy, null, 2));
}

main();

