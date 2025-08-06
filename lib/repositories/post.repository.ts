import { runQuery } from '@/lib/neo4j/driver';
import { Post, User } from '@/types';

export class PostRepository {
  static async create(data: {
    userId: string;
    content: string;
    images?: string[];
  }): Promise<Post | null> {
    const query = `
      MATCH (u:User {id: $userId})
      CREATE (p:Post {
        id: randomUUID(),
        content: $content,
        images: $images,
        likes: 0,
        comments: 0,
        shares: 0,
        createdAt: datetime(),
        updatedAt: datetime()
      })
      CREATE (u)-[:POSTED]->(p)
      RETURN p {
        .*, 
        author: u {.*}
      } as post
    `;

    const result = await runQuery(query, {
      userId: data.userId,
      content: data.content,
      images: data.images || [],
    });

    return result[0]?.post || null;
  }

  static async getRecentPosts(limit: number = 20): Promise<Post[]> {
    const query = `
      MATCH (p:Post)<-[:POSTED]-(u:User)
      RETURN p {
        .*, 
        author: u {.*},
        likedByMe: EXISTS((me:User {id: $currentUserId})-[:LIKES]->(p)),
        savedByMe: EXISTS((me:User {id: $currentUserId})-[:SAVED]->(p))
      } as post
      ORDER BY p.createdAt DESC
      LIMIT $limit
    `;

    const result = await runQuery(query, {
      limit,
      currentUserId: '', // Will be set in component
    });

    return result.map(r => r.post);
  }

  static async getUserPosts(userId: string, limit: number = 20): Promise<Post[]> {
    const query = `
      MATCH (u:User {id: $userId})-[:POSTED]->(p:Post)
      RETURN p {
        .*, 
        author: u {.*}
      } as post
      ORDER BY p.createdAt DESC
      LIMIT $limit
    `;

    const result = await runQuery(query, {
      userId,
      limit,
    });

    return result.map(r => r.post);
  }

  static async likePost(postId: string, userId: string): Promise<boolean> {
    const query = `
      MATCH (u:User {id: $userId}), (p:Post {id: $postId})
      MERGE (u)-[l:LIKES]->(p)
      ON CREATE SET 
        l.createdAt = datetime(),
        p.likes = COALESCE(p.likes, 0) + 1
      RETURN l
    `;

    const result = await runQuery(query, { postId, userId });
    return result.length > 0;
  }

  static async unlikePost(postId: string, userId: string): Promise<boolean> {
    const query = `
      MATCH (u:User {id: $userId})-[l:LIKES]->(p:Post {id: $postId})
      DELETE l
      SET p.likes = CASE WHEN p.likes > 0 THEN p.likes - 1 ELSE 0 END
      RETURN true as success
    `;

    const result = await runQuery(query, { postId, userId });
    return result[0]?.success || false;
  }

  static async addComment(data: {
    postId: string;
    userId: string;
    content: string;
  }): Promise<boolean> {
    const query = `
      MATCH (u:User {id: $userId}), (p:Post {id: $postId})
      CREATE (c:Comment {
        id: randomUUID(),
        content: $content,
        createdAt: datetime()
      })
      CREATE (u)-[:COMMENTED]->(c)-[:ON]->(p)
      SET p.comments = COALESCE(p.comments, 0) + 1
      RETURN c
    `;

    const result = await runQuery(query, {
      postId: data.postId,
      userId: data.userId,
      content: data.content,
    });

    return result.length > 0;
  }

  static async savePost(postId: string, userId: string): Promise<boolean> {
    const query = `
      MATCH (u:User {id: $userId}), (p:Post {id: $postId})
      MERGE (u)-[s:SAVED]->(p)
      ON CREATE SET s.createdAt = datetime()
      RETURN s
    `;

    const result = await runQuery(query, { postId, userId });
    return result.length > 0;
  }

  static async unsavePost(postId: string, userId: string): Promise<boolean> {
    const query = `
      MATCH (u:User {id: $userId})-[s:SAVED]->(p:Post {id: $postId})
      DELETE s
      RETURN true as success
    `;

    const result = await runQuery(query, { postId, userId });
    return result[0]?.success || false;
  }

  static async deletePost(postId: string, userId: string): Promise<boolean> {
    const query = `
      MATCH (u:User {id: $userId})-[:POSTED]->(p:Post {id: $postId})
      DETACH DELETE p
      RETURN true as success
    `;

    const result = await runQuery(query, { postId, userId });
    return result[0]?.success || false;
  }
}