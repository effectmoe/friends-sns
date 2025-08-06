'use server';

import { runQuery } from '@/lib/neo4j';

export async function getRecentPostsCount(): Promise<number> {
  try {
    const result = await runQuery(
      `
      MATCH (p:Post)
      WHERE p.createdAt > datetime() - duration('P7D')
      RETURN count(p) as count
      `,
      {}
    );

    return result.records[0]?.get('count')?.toNumber() || 0;
  } catch (error) {
    console.error('Error getting recent posts count:', error);
    return 0;
  }
}