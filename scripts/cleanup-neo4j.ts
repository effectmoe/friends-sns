#!/usr/bin/env tsx

import { runQuery, runWriteTransaction, closeDriver } from '../lib/neo4j/driver';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function cleanupNeo4jData() {
  console.log('🧹 Cleaning up Neo4j database...\n');
  
  try {
    // Check current state
    console.log('1. Current database state:');
    const currentUsers = await runQuery('MATCH (u:User) RETURN u.email, u.id, u.createdAt ORDER BY u.createdAt');
    console.log(`   Found ${currentUsers.length} users:`);
    currentUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user['u.email']} (ID: ${user['u.id']}, Created: ${user['u.createdAt']})`);
    });
    console.log();
    
    // Remove duplicates - keep the first created user with each email
    console.log('2. Removing duplicate users...');
    
    // Get duplicates
    const duplicateQuery = `
      MATCH (u:User)
      WITH u.email as email, collect(u) as users
      WHERE size(users) > 1
      RETURN email, users
    `;
    
    const duplicates = await runQuery(duplicateQuery);
    
    if (duplicates.length === 0) {
      console.log('   ✅ No duplicates found\n');
    } else {
      console.log(`   Found ${duplicates.length} email(s) with duplicates:`);
      
      for (const duplicate of duplicates) {
        const email = duplicate.email;
        const users = duplicate.users;
        
        console.log(`   Email: ${email} has ${users.length} users`);
        
        // Keep the first user (by creation date) and remove the rest
        const sortedUsers = users.sort((a: any, b: any) => 
          new Date(a.properties.createdAt).getTime() - new Date(b.properties.createdAt).getTime()
        );
        
        const keepUser = sortedUsers[0];
        const removeUsers = sortedUsers.slice(1);
        
        console.log(`   Keeping: ${keepUser.properties.id} (created: ${keepUser.properties.createdAt})`);
        
        for (const removeUser of removeUsers) {
          console.log(`   Removing: ${removeUser.properties.id} (created: ${removeUser.properties.createdAt})`);
          await runQuery('MATCH (u:User {id: $id}) DETACH DELETE u', { id: removeUser.properties.id });
        }
      }
      console.log();
    }
    
    // Create unique constraints to prevent future duplicates
    console.log('3. Creating unique constraints...');
    try {
      await runQuery('CREATE CONSTRAINT unique_user_email IF NOT EXISTS FOR (u:User) REQUIRE u.email IS UNIQUE');
      console.log('   ✅ Email uniqueness constraint created');
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        console.log('   ✅ Email uniqueness constraint already exists');
      } else {
        console.log(`   ⚠️ Could not create email constraint: ${error.message}`);
      }
    }
    
    try {
      await runQuery('CREATE CONSTRAINT unique_user_id IF NOT EXISTS FOR (u:User) REQUIRE u.id IS UNIQUE');
      console.log('   ✅ ID uniqueness constraint created');
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        console.log('   ✅ ID uniqueness constraint already exists');
      } else {
        console.log(`   ⚠️ Could not create ID constraint: ${error.message}`);
      }
    }
    console.log();
    
    // Final state check
    console.log('4. Final database state:');
    const finalUsers = await runQuery('MATCH (u:User) RETURN u.email, u.id, u.createdAt ORDER BY u.createdAt');
    console.log(`   Total users: ${finalUsers.length}`);
    finalUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user['u.email']} (ID: ${user['u.id']}, Created: ${user['u.createdAt']})`);
    });
    
    // Show constraints
    console.log('\n5. Database constraints:');
    try {
      const constraints = await runQuery('SHOW CONSTRAINTS');
      console.log(`   Active constraints: ${constraints.length}`);
      constraints.forEach((constraint, index) => {
        console.log(`   ${index + 1}. ${constraint.name}: ${constraint.description}`);
      });
    } catch (error) {
      console.log('   ⚠️ Could not retrieve constraints info');
    }
    
    console.log('\n🎉 Database cleanup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database cleanup failed:', error);
    process.exit(1);
  } finally {
    // Clean up
    await closeDriver();
    console.log('\n🔚 Connection closed');
  }
}

// Run the cleanup
cleanupNeo4jData();