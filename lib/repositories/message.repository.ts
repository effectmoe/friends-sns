import { runQuery } from '@/lib/neo4j/driver';
import { Message, MessageThread } from '@/types';

export class MessageRepository {
  static async sendMessage(senderId: string, recipientId: string, content: string): Promise<Message> {
    const query = `
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
    `;

    const result = await runQuery(query, { senderId, recipientId, content });
    
    if (result.length === 0) {
      throw new Error('メッセージを送信できませんでした。受信設定またはブロック設定を確認してください。');
    }

    const messageRecord = result[0].message;
    return {
      id: messageRecord.id,
      senderId: messageRecord.senderId,
      senderName: messageRecord.senderName,
      recipientId: messageRecord.recipientId,
      recipientName: messageRecord.recipientName,
      content: messageRecord.content,
      encrypted: messageRecord.encrypted,
      read: messageRecord.read,
      createdAt: messageRecord.createdAt,
    };
  }

  static async getConversations(userId: string): Promise<MessageThread[]> {
    const query = `
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
           message, sender
      
      WITH user, otherUser, message, sender
      ORDER BY message.createdAt DESC
      
      WITH user, otherUser, 
           COLLECT(message)[0] as lastMessage,
           COUNT(CASE WHEN NOT message.read AND sender.id != user.id THEN 1 END) as unreadCount
      
      RETURN {
        userId: otherUser.id,
        username: otherUser.username,
        avatar: otherUser.profile.avatar,
        lastMessage: lastMessage.content,
        lastMessageAt: toString(lastMessage.createdAt),
        unreadCount: unreadCount
      } as thread
      ORDER BY lastMessage.createdAt DESC
    `;

    const result = await runQuery(query, { userId });
    
    return result.map(record => {
      const thread = record.thread;
      return {
        userId: thread.userId,
        username: thread.username,
        avatar: thread.avatar,
        lastMessage: thread.lastMessage,
        lastMessageAt: thread.lastMessageAt || new Date().toISOString(),
        unreadCount: thread.unreadCount || 0,
      };
    });
  }

  static async getMessages(userId: string, otherUserId: string, limit: number = 50): Promise<Message[]> {
    const query = `
      MATCH (user:User {id: $userId})
      MATCH (otherUser:User {id: $otherUserId})
      MATCH (message:Message)
      WHERE ((user)-[:SENT]->(message)-[:SENT_TO]->(otherUser)) OR
            ((otherUser)-[:SENT]->(message)-[:SENT_TO]->(user))
      
      WITH message, user, otherUser
      MATCH (sender:User)-[:SENT]->(message)
      
      // Mark as read if recipient is viewing
      FOREACH(_ IN CASE WHEN message.read = false AND sender.id = otherUser.id THEN [1] ELSE [] END |
        SET message.read = true
      )
      
      WITH message, sender.id as senderId, sender.username as senderName
      
      RETURN message {
        .*,
        senderId: senderId,
        senderName: senderName
      } as msg
      ORDER BY message.createdAt DESC
      LIMIT $limit
    `;

    const result = await runQuery(query, { 
      userId, 
      otherUserId, 
      limit: parseInt(limit.toString()) 
    });

    return result
      .map(record => {
        const msg = record.msg;
        return {
          id: msg.id,
          senderId: msg.senderId,
          senderName: msg.senderName,
          recipientId: msg.recipientId || (msg.senderId === userId ? otherUserId : userId),
          recipientName: msg.recipientName,
          content: msg.content,
          encrypted: msg.encrypted,
          read: msg.read,
          createdAt: msg.createdAt,
        };
      })
      .reverse(); // Reverse to show oldest first
  }

  static async markAsRead(messageId: string, recipientId: string): Promise<boolean> {
    const query = `
      MATCH (message:Message {id: $messageId})-[:SENT_TO]->(recipient:User {id: $recipientId})
      SET message.read = true
      RETURN message
    `;

    const result = await runQuery(query, { messageId, recipientId });
    return result.length > 0;
  }

  static async blockUser(userId: string, blockedUserId: string): Promise<boolean> {
    const query = `
      MATCH (user:User {id: $userId})
      MATCH (blocked:User {id: $blockedUserId})
      MERGE (user)-[r:BLOCKED {level: 'full', blockedAt: datetime()}]->(blocked)
      RETURN r
    `;

    const result = await runQuery(query, { userId, blockedUserId });
    return result.length > 0;
  }

  static async unblockUser(userId: string, blockedUserId: string): Promise<boolean> {
    const query = `
      MATCH (user:User {id: $userId})-[r:BLOCKED]->(blocked:User {id: $blockedUserId})
      DELETE r
      RETURN true as success
    `;

    const result = await runQuery(query, { userId, blockedUserId });
    return result.length > 0;
  }

  static async getBlockedUsers(userId: string): Promise<any[]> {
    const query = `
      MATCH (user:User {id: $userId})-[r:BLOCKED]->(blocked:User)
      RETURN blocked {
        .*,
        blockedAt: toString(r.blockedAt)
      } as blockedUser
      ORDER BY r.blockedAt DESC
    `;

    const result = await runQuery(query, { userId });
    
    return result.map(record => {
      const user = record.blockedUser;
      return {
        ...user,
        createdAt: user.createdAt || new Date().toISOString(),
      };
    });
  }

  static async updateMessageSettings(userId: string, settings: any): Promise<boolean> {
    const query = `
      MATCH (user:User {id: $userId})
      SET user.messageSettings = $settings
      RETURN user
    `;

    const result = await runQuery(query, { userId, settings });
    return result.length > 0;
  }
}