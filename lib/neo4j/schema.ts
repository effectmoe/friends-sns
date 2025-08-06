import { runQuery } from './driver';

export async function createIndexes() {
  const indexes = [
    // User indexes
    'CREATE INDEX user_id IF NOT EXISTS FOR (u:User) ON (u.id)',
    'CREATE INDEX user_email IF NOT EXISTS FOR (u:User) ON (u.email)',
    'CREATE INDEX user_username IF NOT EXISTS FOR (u:User) ON (u.username)',
    
    // FriendRequest indexes
    'CREATE INDEX friend_request_id IF NOT EXISTS FOR (fr:FriendRequest) ON (fr.id)',
    'CREATE INDEX friend_request_status IF NOT EXISTS FOR (fr:FriendRequest) ON (fr.status)',
    
    // Message indexes
    'CREATE INDEX message_id IF NOT EXISTS FOR (m:Message) ON (m.id)',
    'CREATE INDEX message_read IF NOT EXISTS FOR (m:Message) ON (m.read)',
    
    // Event indexes
    'CREATE INDEX event_id IF NOT EXISTS FOR (e:Event) ON (e.id)',
    'CREATE INDEX event_start IF NOT EXISTS FOR (e:Event) ON (e.startAt)',
    
    // Post indexes
    'CREATE INDEX post_id IF NOT EXISTS FOR (p:Post) ON (p.id)',
    'CREATE INDEX post_visibility IF NOT EXISTS FOR (p:Post) ON (p.visibility)',
    
    // Comment indexes
    'CREATE INDEX comment_id IF NOT EXISTS FOR (c:Comment) ON (c.id)',
  ];

  for (const index of indexes) {
    try {
      await runQuery(index);
      console.log(`Index created: ${index.split(' ')[2]}`);
    } catch (error) {
      console.error(`Failed to create index: ${index}`, error);
    }
  }
}

export async function createConstraints() {
  const constraints = [
    // User constraints
    'CREATE CONSTRAINT user_id_unique IF NOT EXISTS FOR (u:User) REQUIRE u.id IS UNIQUE',
    'CREATE CONSTRAINT user_email_unique IF NOT EXISTS FOR (u:User) REQUIRE u.email IS UNIQUE',
    'CREATE CONSTRAINT user_username_unique IF NOT EXISTS FOR (u:User) REQUIRE u.username IS UNIQUE',
    
    // Other unique constraints
    'CREATE CONSTRAINT friend_request_id_unique IF NOT EXISTS FOR (fr:FriendRequest) REQUIRE fr.id IS UNIQUE',
    'CREATE CONSTRAINT message_id_unique IF NOT EXISTS FOR (m:Message) REQUIRE m.id IS UNIQUE',
    'CREATE CONSTRAINT event_id_unique IF NOT EXISTS FOR (e:Event) REQUIRE e.id IS UNIQUE',
    'CREATE CONSTRAINT post_id_unique IF NOT EXISTS FOR (p:Post) REQUIRE p.id IS UNIQUE',
    'CREATE CONSTRAINT comment_id_unique IF NOT EXISTS FOR (c:Comment) REQUIRE c.id IS UNIQUE',
  ];

  for (const constraint of constraints) {
    try {
      await runQuery(constraint);
      console.log(`Constraint created: ${constraint.split(' ')[2]}`);
    } catch (error) {
      console.error(`Failed to create constraint: ${constraint}`, error);
    }
  }
}

export async function initializeSchema() {
  console.log('Initializing Neo4j schema...');
  await createConstraints();
  await createIndexes();
  console.log('Neo4j schema initialization completed.');
}