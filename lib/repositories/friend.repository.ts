import { runQuery, runWriteTransaction } from '@/lib/neo4j/driver';
import { FriendRequest, FriendRelation, User } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export class FriendRepository {
  // Friend Request Methods
  static async createFriendRequest(data: {
    senderId: string;
    recipientId: string;
    message?: string;
  }): Promise<FriendRequest | null> {
    // Check if they are already friends
    const isFriend = await this.isFriend(data.senderId, data.recipientId);
    if (isFriend) {
      return null;
    }

    // Check if there's already a pending request
    const existingRequest = await this.getPendingRequest(data.senderId, data.recipientId);
    if (existingRequest) {
      return existingRequest;
    }

    const id = uuidv4();
    const requestedAt = new Date().toISOString();

    const request = await runWriteTransaction(async (tx) => {
      const result = await tx.run(
        `
        MATCH (sender:User {id: $senderId}), (recipient:User {id: $recipientId})
        CREATE (sender)-[:SENT_REQUEST]->(fr:FriendRequest {
          id: $id,
          status: 'pending',
          message: $message,
          requestedAt: datetime($requestedAt)
        })-[:SENT_TO]->(recipient)
        RETURN fr
        `,
        {
          id,
          senderId: data.senderId,
          recipientId: data.recipientId,
          message: data.message || '',
          requestedAt,
        }
      );

      if (result.records.length === 0) {
        return null;
      }

      return result.records[0].get('fr').properties;
    });

    if (!request) {
      return null;
    }

    return this.formatFriendRequest(request, data.senderId, data.recipientId);
  }

  static async acceptFriendRequest(requestId: string): Promise<boolean> {
    const respondedAt = new Date().toISOString();

    return await runWriteTransaction(async (tx) => {
      // First, get the request details
      const requestResult = await tx.run(
        `
        MATCH (sender:User)-[:SENT_REQUEST]->(fr:FriendRequest {id: $requestId})-[:SENT_TO]->(recipient:User)
        RETURN sender.id as senderId, recipient.id as recipientId, fr
        `,
        { requestId }
      );

      if (requestResult.records.length === 0) {
        return false;
      }

      const record = requestResult.records[0];
      const senderId = record.get('senderId');
      const recipientId = record.get('recipientId');

      // Update request status
      await tx.run(
        `
        MATCH (fr:FriendRequest {id: $requestId})
        SET fr.status = 'accepted', fr.respondedAt = datetime($respondedAt)
        `,
        { requestId, respondedAt }
      );

      // Create friend relationship (recipient adds sender as friend)
      await tx.run(
        `
        MATCH (recipient:User {id: $recipientId}), (sender:User {id: $senderId})
        CREATE (recipient)-[:ADDED_AS_FRIEND {addedAt: datetime($addedAt)}]->(sender)
        `,
        { recipientId, senderId, addedAt: respondedAt }
      );

      return true;
    });
  }

  static async rejectFriendRequest(requestId: string): Promise<boolean> {
    const respondedAt = new Date().toISOString();

    return await runWriteTransaction(async (tx) => {
      const result = await tx.run(
        `
        MATCH (fr:FriendRequest {id: $requestId})
        SET fr.status = 'rejected', fr.respondedAt = datetime($respondedAt)
        RETURN fr
        `,
        { requestId, respondedAt }
      );

      return result.records.length > 0;
    });
  }

  static async getPendingRequest(
    senderId: string,
    recipientId: string
  ): Promise<FriendRequest | null> {
    const results = await runQuery<{ fr: any }>(
      `
      MATCH (sender:User {id: $senderId})-[:SENT_REQUEST]->(fr:FriendRequest {status: 'pending'})-[:SENT_TO]->(recipient:User {id: $recipientId})
      RETURN fr
      `,
      { senderId, recipientId }
    );

    if (results.length === 0) {
      return null;
    }

    return this.formatFriendRequest(results[0].fr, senderId, recipientId);
  }

  static async getReceivedRequests(
    userId: string,
    status?: 'pending' | 'accepted' | 'rejected'
  ): Promise<(FriendRequest & { sender: User })[]> {
    const query = status
      ? `
        MATCH (sender:User)-[:SENT_REQUEST]->(fr:FriendRequest {status: $status})-[:SENT_TO]->(recipient:User {id: $userId})
        RETURN fr, sender
        ORDER BY fr.requestedAt DESC
        `
      : `
        MATCH (sender:User)-[:SENT_REQUEST]->(fr:FriendRequest)-[:SENT_TO]->(recipient:User {id: $userId})
        RETURN fr, sender
        ORDER BY fr.requestedAt DESC
        `;

    const results = await runQuery<{ fr: any; sender: any }>(
      query,
      status ? { userId, status } : { userId }
    );

    return results.map((result) => ({
      ...this.formatFriendRequest(result.fr, result.sender.id, userId),
      sender: this.formatUser(result.sender),
    }));
  }

  static async getSentRequests(
    userId: string,
    status?: 'pending' | 'accepted' | 'rejected'
  ): Promise<(FriendRequest & { recipient: User })[]> {
    const query = status
      ? `
        MATCH (sender:User {id: $userId})-[:SENT_REQUEST]->(fr:FriendRequest {status: $status})-[:SENT_TO]->(recipient:User)
        RETURN fr, recipient
        ORDER BY fr.requestedAt DESC
        `
      : `
        MATCH (sender:User {id: $userId})-[:SENT_REQUEST]->(fr:FriendRequest)-[:SENT_TO]->(recipient:User)
        RETURN fr, recipient
        ORDER BY fr.requestedAt DESC
        `;

    const results = await runQuery<{ fr: any; recipient: any }>(
      query,
      status ? { userId, status } : { userId }
    );

    return results.map((result) => ({
      ...this.formatFriendRequest(result.fr, userId, result.recipient.id),
      recipient: this.formatUser(result.recipient),
    }));
  }

  // Friend Relationship Methods
  static async addFriend(userId: string, friendId: string): Promise<boolean> {
    // Check if already friends
    const isFriend = await this.isFriend(userId, friendId);
    if (isFriend) {
      return true;
    }

    const addedAt = new Date().toISOString();

    return await runWriteTransaction(async (tx) => {
      const result = await tx.run(
        `
        MATCH (user:User {id: $userId}), (friend:User {id: $friendId})
        CREATE (user)-[:ADDED_AS_FRIEND {addedAt: datetime($addedAt)}]->(friend)
        RETURN user, friend
        `,
        { userId, friendId, addedAt }
      );

      return result.records.length > 0;
    });
  }

  static async removeFriend(userId: string, friendId: string): Promise<boolean> {
    return await runWriteTransaction(async (tx) => {
      const result = await tx.run(
        `
        MATCH (user:User {id: $userId})-[r:ADDED_AS_FRIEND]->(friend:User {id: $friendId})
        DELETE r
        RETURN count(r) as deleted
        `,
        { userId, friendId }
      );

      return result.records[0].get('deleted').toInt() > 0;
    });
  }

  static async isFriend(userId: string, friendId: string): Promise<boolean> {
    const results = await runQuery<{ exists: boolean }>(
      `
      MATCH (user:User {id: $userId})-[:ADDED_AS_FRIEND]->(friend:User {id: $friendId})
      RETURN count(*) > 0 as exists
      `,
      { userId, friendId }
    );

    return results[0]?.exists || false;
  }

  static async getFriends(userId: string): Promise<(User & { addedAt: Date })[]> {
    const results = await runQuery<{ friend: any; addedAt: any }>(
      `
      MATCH (user:User {id: $userId})-[r:ADDED_AS_FRIEND]->(friend:User)
      RETURN friend, r.addedAt as addedAt
      ORDER BY r.addedAt DESC
      `,
      { userId }
    );

    return results.map((result) => {
      // runQuery now converts DateTime to ISO strings automatically
      const addedAt = new Date(result.addedAt || new Date().toISOString());
      
      return {
        ...this.formatUser(result.friend),
        addedAt,
      };
    });
  }

  static async getMutualFriends(userId: string, targetId: string): Promise<User[]> {
    const results = await runQuery<{ mutual: any }>(
      `
      MATCH (user:User {id: $userId})-[:ADDED_AS_FRIEND]->(mutual:User)<-[:ADDED_AS_FRIEND]-(target:User {id: $targetId})
      RETURN mutual
      `,
      { userId, targetId }
    );

    return results.map((result) => this.formatUser(result.mutual));
  }

  static async getFriendConnectionMap(
    userId: string,
    depth: number = 2
  ): Promise<{ nodes: any[]; edges: any[] }> {
    try {
      console.log('getFriendConnectionMap called with userId:', userId);
      
      // Simple approach: get the user first
      const userResult = await runQuery<{ user: any }>(
        `MATCH (user:User {id: $userId}) RETURN user`,
        { userId }
      );

      console.log('User query result:', userResult);

      if (userResult.length === 0) {
        console.log('No user found with id:', userId);
        return { nodes: [], edges: [] };
      }

      // runQuery already extracts properties, so userResult[0] contains { user: properties }
      const currentUser = userResult[0].user;
      console.log('Current user data:', currentUser);
      
      // Additional null check
      if (!currentUser || !currentUser.id) {
        console.log('User data is incomplete:', currentUser);
        return { nodes: [], edges: [] };
      }

      // Get friends and their connections
      const friendsResult = await runQuery<{ friend: any; rel: any }>(
        `
        MATCH (user:User {id: $userId})-[rel:ADDED_AS_FRIEND]-(friend:User)
        RETURN friend, rel
        `,
        { userId }
      );

      // Build nodes array
      const nodes = [{
        id: currentUser.id,
        label: currentUser.username,
        ...currentUser,
      }];

      const edges = [];
      const friendIds = new Set<string>();

      // Add direct friends
      friendsResult.forEach(result => {
        // runQuery already extracts properties
        const friend = result.friend;
        const rel = result.rel;
        
        if (friend && friend.id && !friendIds.has(friend.id)) {
          friendIds.add(friend.id);
          nodes.push({
            id: friend.id,
            label: friend.username || friend.id,
            ...friend,
          });
          
          // Add edge
          edges.push({
            source: currentUser.id,
            target: friend.id,
            addedAt: rel?.addedAt,
          });
        }
      });

      // If depth > 1, get friend-of-friend connections
      if (depth > 1 && friendIds.size > 0) {
        const secondDegreeResult = await runQuery<{ f1: any; f2: any; rel: any }>(
          `
          MATCH (user:User {id: $userId})-[:ADDED_AS_FRIEND]-(f1:User)-[rel:ADDED_AS_FRIEND]-(f2:User)
          WHERE f2.id <> $userId AND f2.id IN $friendIds
          RETURN f1, f2, rel
          `,
          { userId, friendIds: Array.from(friendIds) }
        );

        secondDegreeResult.forEach(result => {
          // runQuery already extracts properties
          const f1 = result.f1;
          const f2 = result.f2;
          const rel = result.rel;
          
          if (f1?.id && f2?.id) {
            edges.push({
              source: f1.id,
              target: f2.id,
              addedAt: rel?.addedAt,
            });
          }
        });
      }

      return { nodes, edges };
    } catch (error) {
      console.error('Error in getFriendConnectionMap:', error);
      // Return empty if there's an error
      return { nodes: [], edges: [] };
    }
  }

  // Helper methods
  private static formatFriendRequest(
    data: any,
    senderId: string,
    recipientId: string
  ): FriendRequest {
    // runQuery now converts DateTime to ISO strings automatically
    return {
      id: data.id,
      senderId,
      recipientId,
      status: data.status,
      message: data.message || undefined,
      requestedAt: new Date(data.requestedAt || new Date().toISOString()),
      respondedAt: data.respondedAt ? new Date(data.respondedAt) : undefined,
    };
  }

  private static formatUser(data: any): User {
    // runQuery now converts DateTime to ISO strings automatically
    const createdAtDate = new Date(data.createdAt || new Date().toISOString());
    
    return {
      id: data.id,
      email: data.email,
      username: data.username,
      profile: {
        nickname: data.profileNickname || data.username,
        avatar: data.profileAvatar || null,
        bio: data.profileBio || null,
      },
      messageSettings: {
        acceptFrom: data.messageSettingsAcceptFrom || 'all',
        emailNotifications: data.messageSettingsEmailNotifications !== false,
      },
      createdAt: createdAtDate,
    };
  }
}