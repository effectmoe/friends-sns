import { runQuery, runWriteTransaction } from '@/lib/neo4j/driver';
import { User } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export class UserRepository {
  static async create(data: {
    email: string;
    username: string;
    profile?: Partial<User['profile']>;
  }): Promise<User> {
    const id = uuidv4();
    const createdAt = new Date().toISOString();
    
    const user = await runWriteTransaction(async (tx) => {
      const result = await tx.run(
        `
        CREATE (u:User {
          id: $id,
          email: $email,
          username: $username,
          profileNickname: $profileNickname,
          profileAvatar: $profileAvatar,
          profileBio: $profileBio,
          messageSettingsAcceptFrom: $messageSettingsAcceptFrom,
          messageSettingsEmailNotifications: $messageSettingsEmailNotifications,
          createdAt: datetime($createdAt)
        })
        RETURN u
        `,
        {
          id,
          email: data.email,
          username: data.username,
          profileNickname: data.profile?.nickname || data.username,
          profileAvatar: data.profile?.avatar || null,
          profileBio: data.profile?.bio || null,
          messageSettingsAcceptFrom: 'all',
          messageSettingsEmailNotifications: true,
          createdAt,
        }
      );
      
      return result.records[0].get('u').properties;
    });
    
    return this.formatUser(user);
  }

  static async findById(id: string): Promise<User | null> {
    const results = await runQuery<{ u: any }>(
      'MATCH (u:User {id: $id}) RETURN u',
      { id }
    );
    
    if (results.length === 0) {
      return null;
    }
    
    return this.formatUser(results[0].u);
  }

  static async findByEmail(email: string): Promise<User | null> {
    const results = await runQuery<{ u: any }>(
      'MATCH (u:User {email: $email}) RETURN u',
      { email }
    );
    
    if (results.length === 0) {
      return null;
    }
    
    console.log('Query result:', results[0]);
    console.log('User data:', results[0].u);
    
    return this.formatUser(results[0].u);
  }

  static async findByUsername(username: string): Promise<User | null> {
    const results = await runQuery<{ u: any }>(
      'MATCH (u:User {username: $username}) RETURN u',
      { username }
    );
    
    if (results.length === 0) {
      return null;
    }
    
    return this.formatUser(results[0].u);
  }

  static async update(
    id: string,
    data: Partial<Omit<User, 'id' | 'createdAt'>>
  ): Promise<User | null> {
    const user = await runWriteTransaction(async (tx) => {
      const result = await tx.run(
        `
        MATCH (u:User {id: $id})
        SET u += $data
        RETURN u
        `,
        {
          id,
          data,
        }
      );
      
      if (result.records.length === 0) {
        return null;
      }
      
      return result.records[0].get('u').properties;
    });
    
    if (!user) {
      return null;
    }
    
    return this.formatUser(user);
  }

  static async updateProfile(
    id: string,
    profile: Partial<User['profile']>
  ): Promise<User | null> {
    const user = await runWriteTransaction(async (tx) => {
      const setClause = [];
      const params: any = { id };
      
      if (profile.nickname !== undefined) {
        setClause.push('u.profileNickname = $profileNickname');
        params.profileNickname = profile.nickname;
      }
      if (profile.avatar !== undefined) {
        setClause.push('u.profileAvatar = $profileAvatar');
        params.profileAvatar = profile.avatar;
      }
      if (profile.bio !== undefined) {
        setClause.push('u.profileBio = $profileBio');
        params.profileBio = profile.bio;
      }
      
      if (setClause.length === 0) {
        return await this.findById(id);
      }
      
      const result = await tx.run(
        `
        MATCH (u:User {id: $id})
        SET ${setClause.join(', ')}
        RETURN u
        `,
        params
      );
      
      if (result.records.length === 0) {
        return null;
      }
      
      return result.records[0].get('u').properties;
    });
    
    if (!user) {
      return null;
    }
    
    return this.formatUser(user);
  }

  static async updateMessageSettings(
    id: string,
    settings: Partial<User['messageSettings']>
  ): Promise<User | null> {
    const user = await runWriteTransaction(async (tx) => {
      const setClause = [];
      const params: any = { id };
      
      if (settings.acceptFrom !== undefined) {
        setClause.push('u.messageSettingsAcceptFrom = $messageSettingsAcceptFrom');
        params.messageSettingsAcceptFrom = settings.acceptFrom;
      }
      if (settings.emailNotifications !== undefined) {
        setClause.push('u.messageSettingsEmailNotifications = $messageSettingsEmailNotifications');
        params.messageSettingsEmailNotifications = settings.emailNotifications;
      }
      
      if (setClause.length === 0) {
        return await this.findById(id);
      }
      
      const result = await tx.run(
        `
        MATCH (u:User {id: $id})
        SET ${setClause.join(', ')}
        RETURN u
        `,
        params
      );
      
      if (result.records.length === 0) {
        return null;
      }
      
      return result.records[0].get('u').properties;
    });
    
    if (!user) {
      return null;
    }
    
    return this.formatUser(user);
  }

  static async search(query: string, limit: number = 10): Promise<User[]> {
    const results = await runQuery<{ u: any }>(
      `
      MATCH (u:User)
      WHERE u.username =~ $pattern OR u.profileNickname =~ $pattern
      RETURN u
      LIMIT $limit
      `,
      {
        pattern: `(?i).*${query}.*`,
        limit,
      }
    );
    
    return results.map((result) => this.formatUser(result.u));
  }

  private static formatUser(data: any): User {
    // Convert Neo4j DateTime to JavaScript Date
    const createdAt = data.createdAt;
    let createdAtDate: Date;
    
    if (createdAt && typeof createdAt === 'object' && 'toStandardDate' in createdAt) {
      // Neo4j DateTime object
      createdAtDate = createdAt.toStandardDate();
    } else if (createdAt && typeof createdAt === 'object' && 'year' in createdAt) {
      // Neo4j DateTime properties
      createdAtDate = new Date(
        createdAt.year.low || createdAt.year,
        (createdAt.month.low || createdAt.month) - 1,
        createdAt.day.low || createdAt.day,
        createdAt.hour.low || createdAt.hour || 0,
        createdAt.minute.low || createdAt.minute || 0,
        createdAt.second.low || createdAt.second || 0
      );
    } else {
      // String or already a Date
      createdAtDate = new Date(createdAt);
    }
    
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