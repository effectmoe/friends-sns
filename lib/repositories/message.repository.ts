import { driver } from '@/lib/neo4j/driver';
import { Message, MessageThread } from '@/types';
import { DateTime } from 'neo4j-driver';

export class MessageRepository {
  static async sendMessage(senderId: string, recipientId: string, content: string): Promise<Message> {
    const session = driver.session();
    try {
      const result = await session.run(
        `
        MATCH (sender:User {id: $senderId})
        MATCH (recipient:User {id: $recipientId})
        
        // Check if recipient accepts messages from sender
        WITH sender, recipient
        WHERE recipient.messageSettings.acceptFrom = 'all' OR 
              (recipient.messageSettings.acceptFrom = 'friends_only' AND 
               EXISTS((sender)-[:ADDED_AS_FRIEND]->(recipient)))
        
        // Check if sender is not blocked
        WHERE NOT EXISTS((recipient)-[:BLOCKED]->(sender))
        
        CREATE (message:Message {
          id: randomUUID(),
          content: $content,
          encrypted: false,
          read: false,
          createdAt: datetime()
        })
        CREATE (sender)-[:SENT]->(message)-[:SENT_TO]->(recipient)
        
        RETURN message {
          .*,
          senderId: sender.id,
          senderName: sender.username,
          recipientId: recipient.id,
          recipientName: recipient.username
        } as message
        `,
        { senderId, recipientId, content }
      );

      if (result.records.length === 0) {
        throw new Error('メッセージを送信できませんでした。受信設定またはブロック設定を確認してください。');
      }

      const message = result.records[0].get('message');
      return {
        ...message,
        createdAt: message.createdAt?.toString() || new Date().toISOString(),
      };
    } finally {
      await session.close();
    }
  }

  static async getConversations(userId: string): Promise<MessageThread[]> {
    const session = driver.session();
    try {
      const result = await session.run(
        `
        MATCH (user:User {id: $userId})
        MATCH (message:Message)
        WHERE (user)-[:SENT]->(message) OR (message)-[:SENT_TO]->(user)
        
        WITH user, message
        MATCH (sender:User)-[:SENT]->(message)-[:SENT_TO]->(recipient:User)
        
        WITH user, 
             CASE 
               WHEN sender.id = user.id THEN recipient 
               ELSE sender 
             END as otherUser,
             message
        
        WITH user, otherUser, message
        ORDER BY message.createdAt DESC
        
        WITH user, otherUser, 
             COLLECT(message)[0] as lastMessage,
             COUNT(CASE WHEN NOT message.read AND otherUser.id = sender.id THEN 1 END) as unreadCount
        
        RETURN {
          userId: otherUser.id,
          username: otherUser.username,
          avatar: otherUser.profile.avatar,
          lastMessage: lastMessage.content,
          lastMessageAt: toString(lastMessage.createdAt),
          unreadCount: unreadCount
        } as thread
        ORDER BY lastMessage.createdAt DESC
        `,
        { userId }
      );

      return result.records.map(record => {
        const thread = record.get('thread');
        return {
          ...thread,
          lastMessageAt: thread.lastMessageAt || new Date().toISOString(),
        };
      });
    } finally {
      await session.close();
    }
  }

  static async getMessages(userId: string, otherUserId: string, limit: number = 50): Promise<Message[]> {
    const session = driver.session();
    try {
      const result = await session.run(
        `
        MATCH (user:User {id: $userId})
        MATCH (otherUser:User {id: $otherUserId})
        MATCH (message:Message)
        WHERE ((user)-[:SENT]->(message)-[:SENT_TO]->(otherUser)) OR
              ((otherUser)-[:SENT]->(message)-[:SENT_TO]->(user))
        
        WITH message, user, otherUser
        MATCH (sender:User)-[:SENT]->(message)
        
        // Mark as read if recipient is viewing
        WHERE message.read = false AND sender.id = otherUser.id
        SET message.read = true
        
        WITH message, sender.id as senderId, sender.username as senderName
        
        RETURN message {
          .*,
          senderId: senderId,
          senderName: senderName
        } as msg
        ORDER BY message.createdAt DESC
        LIMIT $limit
        `,
        { userId, otherUserId, limit: parseInt(limit.toString()) }
      );

      return result.records
        .map(record => {
          const msg = record.get('msg');
          return {
            ...msg,
            createdAt: msg.createdAt?.toString() || new Date().toISOString(),
          };
        })
        .reverse(); // Reverse to show oldest first
    } finally {
      await session.close();
    }
  }

  static async markAsRead(messageId: string, recipientId: string): Promise<boolean> {
    const session = driver.session();
    try {
      const result = await session.run(
        `
        MATCH (message:Message {id: $messageId})-[:SENT_TO]->(recipient:User {id: $recipientId})
        SET message.read = true
        RETURN message
        `,
        { messageId, recipientId }
      );

      return result.records.length > 0;
    } finally {
      await session.close();
    }
  }

  static async blockUser(userId: string, blockedUserId: string): Promise<boolean> {
    const session = driver.session();
    try {
      const result = await session.run(
        `
        MATCH (user:User {id: $userId})
        MATCH (blocked:User {id: $blockedUserId})
        MERGE (user)-[r:BLOCKED {level: 'full', blockedAt: datetime()}]->(blocked)
        RETURN r
        `,
        { userId, blockedUserId }
      );

      return result.records.length > 0;
    } finally {
      await session.close();
    }
  }

  static async unblockUser(userId: string, blockedUserId: string): Promise<boolean> {
    const session = driver.session();
    try {
      const result = await session.run(
        `
        MATCH (user:User {id: $userId})-[r:BLOCKED]->(blocked:User {id: $blockedUserId})
        DELETE r
        RETURN true as success
        `,
        { userId, blockedUserId }
      );

      return result.records.length > 0;
    } finally {
      await session.close();
    }
  }

  static async getBlockedUsers(userId: string): Promise<any[]> {
    const session = driver.session();
    try {
      const result = await session.run(
        `
        MATCH (user:User {id: $userId})-[r:BLOCKED]->(blocked:User)
        RETURN blocked {
          .*,
          blockedAt: toString(r.blockedAt)
        } as blockedUser
        ORDER BY r.blockedAt DESC
        `,
        { userId }
      );

      return result.records.map(record => {
        const user = record.get('blockedUser');
        return {
          ...user,
          createdAt: user.createdAt?.toString() || new Date().toISOString(),
        };
      });
    } finally {
      await session.close();
    }
  }

  static async updateMessageSettings(userId: string, settings: any): Promise<boolean> {
    const session = driver.session();
    try {
      const result = await session.run(
        `
        MATCH (user:User {id: $userId})
        SET user.messageSettings = $settings
        RETURN user
        `,
        { userId, settings }
      );

      return result.records.length > 0;
    } finally {
      await session.close();
    }
  }
}