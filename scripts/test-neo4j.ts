#!/usr/bin/env tsx

import { getDriver, runQuery, closeDriver } from '../lib/neo4j/driver';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testNeo4jConnection() {
  console.log('🔍 Testing Neo4j connection...\n');
  
  try {
    // Test 1: Check environment variables
    console.log('1. Checking environment variables...');
    const uri = process.env.NEO4J_URI;
    const user = process.env.NEO4J_USER;
    const password = process.env.NEO4J_PASSWORD;
    
    if (!uri || !user || !password) {
      throw new Error('Neo4j environment variables are missing');
    }
    
    console.log(`   ✅ URI: ${uri}`);
    console.log(`   ✅ User: ${user}`);
    console.log(`   ✅ Password: ${'*'.repeat(password.length)}\n`);
    
    // Test 2: Basic connection
    console.log('2. Testing basic connection...');
    const driver = getDriver();
    
    // Verify the driver
    await driver.verifyConnectivity();
    console.log('   ✅ Driver connectivity verified\n');
    
    // Test 3: Simple query
    console.log('3. Testing simple query...');
    const dbInfo = await runQuery('RETURN "Hello Neo4j" AS message, datetime() AS timestamp');
    console.log(`   ✅ Query result: ${JSON.stringify(dbInfo, null, 2)}\n`);
    
    // Test 4: Database info
    console.log('4. Getting database info...');
    try {
      const dbVersion = await runQuery('CALL dbms.components()');
      console.log(`   ✅ Database components: ${JSON.stringify(dbVersion, null, 2)}\n`);
    } catch (error) {
      console.log('   ⚠️ Could not get database version (may not have permissions)\n');
    }
    
    // Test 5: Check existing nodes
    console.log('5. Checking existing nodes...');
    const nodeCount = await runQuery('MATCH (n) RETURN COUNT(n) AS count');
    console.log(`   ✅ Total nodes in database: ${nodeCount[0]?.count || 0}\n`);
    
    // Test 6: Check User nodes specifically
    console.log('6. Checking User nodes...');
    const userCount = await runQuery('MATCH (u:User) RETURN COUNT(u) AS count');
    console.log(`   ✅ User nodes: ${userCount[0]?.count || 0}\n`);
    
    // Test 7: Show existing User nodes (if any)
    if (userCount[0]?.count > 0) {
      console.log('7. Listing existing users...');
      const users = await runQuery('MATCH (u:User) RETURN u LIMIT 5');
      console.log(`   ✅ Users found: ${JSON.stringify(users, null, 2)}\n`);
    } else {
      console.log('7. No existing users found\n');
    }
    
    console.log('🎉 All Neo4j connection tests passed!');
    
  } catch (error) {
    console.error('❌ Neo4j connection test failed:', error);
    process.exit(1);
  } finally {
    // Clean up
    await closeDriver();
    console.log('\n🔚 Connection closed');
  }
}

// Run the test
testNeo4jConnection();