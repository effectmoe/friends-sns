import { NextResponse } from 'next/server';
import { getDriver } from '@/lib/neo4j/driver';

export async function GET() {
  try {
    const driver = getDriver();
    await driver.verifyConnectivity();
    
    const session = driver.session();
    try {
      // Test basic query
      const result = await session.run('RETURN 1 as test');
      
      // Check for Post nodes
      const postsResult = await session.run('MATCH (p:Post) RETURN count(p) as count');
      const postCount = postsResult.records[0]?.get('count') || 0;
      
      // Check for User nodes
      const usersResult = await session.run('MATCH (u:User) RETURN count(u) as count');
      const userCount = usersResult.records[0]?.get('count') || 0;
      
      return NextResponse.json({
        status: 'connected',
        database: {
          posts: postCount.toNumber ? postCount.toNumber() : postCount,
          users: userCount.toNumber ? userCount.toNumber() : userCount,
        },
        environment: {
          NODE_ENV: process.env.NODE_ENV,
          NEO4J_URI: process.env.NEO4J_URI ? 'set' : 'not set',
        }
      });
    } finally {
      await session.close();
    }
  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json({
      status: 'error',
      error: String(error),
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}