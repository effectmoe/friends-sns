import { initializeSchema, closeDriver } from '../lib/neo4j/schema';

async function main() {
  try {
    console.log('Initializing Neo4j schema...');
    await initializeSchema();
    console.log('Schema initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing schema:', error);
    process.exit(1);
  } finally {
    await closeDriver();
  }
}

main();