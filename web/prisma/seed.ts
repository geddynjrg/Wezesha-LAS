import { seedLocations } from '../lib/locations/seed-locations';

async function main() {
  await seedLocations();
  console.log('Location seed completed.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
