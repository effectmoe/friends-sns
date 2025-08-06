import { driver } from '@/lib/neo4j/driver';
import { Event, EventParticipant } from '@/types';
import { DateTime } from 'neo4j-driver';

export class EventRepository {
  static async createEvent(event: Partial<Event>, organizerId: string): Promise<Event> {
    const session = driver.session();
    try {
      const result = await session.run(
        `
        MATCH (organizer:User {id: $organizerId})
        CREATE (event:Event {
          id: randomUUID(),
          title: $title,
          description: $description,
          type: $type,
          location: $location,
          maxParticipants: $maxParticipants,
          price: $price,
          currency: $currency,
          reminderSettings: $reminderSettings,
          cancelPolicy: $cancelPolicy,
          startAt: datetime($startAt),
          endAt: datetime($endAt),
          createdAt: datetime()
        })
        CREATE (organizer)-[:CREATED]->(event)
        RETURN event {
          .*,
          organizerId: organizer.id,
          organizerName: organizer.username
        } as event
        `,
        {
          organizerId,
          title: event.title,
          description: event.description,
          type: event.type || 'offline',
          location: event.location,
          maxParticipants: event.maxParticipants || null,
          price: event.price || 0,
          currency: event.currency || 'JPY',
          reminderSettings: event.reminderSettings || {
            twoDaysBefore: true,
            oneDayBefore: true,
            customHours: []
          },
          cancelPolicy: event.cancelPolicy || '',
          startAt: event.startAt,
          endAt: event.endAt,
        }
      );

      const createdEvent = result.records[0].get('event');
      return {
        ...createdEvent,
        startAt: createdEvent.startAt?.toString() || new Date().toISOString(),
        endAt: createdEvent.endAt?.toString() || new Date().toISOString(),
        createdAt: createdEvent.createdAt?.toString() || new Date().toISOString(),
      };
    } finally {
      await session.close();
    }
  }

  static async getEvents(filter?: {
    type?: 'online' | 'offline';
    organizerId?: string;
    participantId?: string;
    upcoming?: boolean;
  }): Promise<Event[]> {
    const session = driver.session();
    try {
      let query = `
        MATCH (event:Event)
        OPTIONAL MATCH (organizer:User)-[:CREATED]->(event)
        OPTIONAL MATCH (participant:User)-[:PARTICIPATING]->(event)
      `;

      const where: string[] = [];
      const params: any = {};

      if (filter?.type) {
        where.push('event.type = $type');
        params.type = filter.type;
      }

      if (filter?.organizerId) {
        where.push('organizer.id = $organizerId');
        params.organizerId = filter.organizerId;
      }

      if (filter?.participantId) {
        where.push('participant.id = $participantId');
        params.participantId = filter.participantId;
      }

      if (filter?.upcoming) {
        where.push('event.startAt > datetime()');
      }

      if (where.length > 0) {
        query += ` WHERE ${where.join(' AND ')}`;
      }

      query += `
        WITH event, organizer, COUNT(DISTINCT participant) as participantCount
        RETURN event {
          .*,
          organizerId: organizer.id,
          organizerName: organizer.username,
          participantCount: participantCount
        } as eventData
        ORDER BY event.startAt ASC
      `;

      const result = await session.run(query, params);

      return result.records.map(record => {
        const event = record.get('eventData');
        return {
          ...event,
          startAt: event.startAt?.toString() || new Date().toISOString(),
          endAt: event.endAt?.toString() || new Date().toISOString(),
          createdAt: event.createdAt?.toString() || new Date().toISOString(),
        };
      });
    } finally {
      await session.close();
    }
  }

  static async getEventById(eventId: string): Promise<Event | null> {
    const session = driver.session();
    try {
      const result = await session.run(
        `
        MATCH (event:Event {id: $eventId})
        OPTIONAL MATCH (organizer:User)-[:CREATED]->(event)
        OPTIONAL MATCH (participant:User)-[:PARTICIPATING]->(event)
        WITH event, organizer, COUNT(DISTINCT participant) as participantCount
        RETURN event {
          .*,
          organizerId: organizer.id,
          organizerName: organizer.username,
          participantCount: participantCount
        } as eventData
        `,
        { eventId }
      );

      if (result.records.length === 0) {
        return null;
      }

      const event = result.records[0].get('eventData');
      return {
        ...event,
        startAt: event.startAt?.toString() || new Date().toISOString(),
        endAt: event.endAt?.toString() || new Date().toISOString(),
        createdAt: event.createdAt?.toString() || new Date().toISOString(),
      };
    } finally {
      await session.close();
    }
  }

  static async joinEvent(eventId: string, userId: string, paymentId?: string): Promise<boolean> {
    const session = driver.session();
    try {
      const result = await session.run(
        `
        MATCH (event:Event {id: $eventId})
        MATCH (user:User {id: $userId})
        
        // Check if event is not full
        OPTIONAL MATCH (participant:User)-[:PARTICIPATING]->(event)
        WITH event, user, COUNT(participant) as currentParticipants
        WHERE event.maxParticipants IS NULL OR currentParticipants < event.maxParticipants
        
        // Check if user is not already participating
        WHERE NOT EXISTS((user)-[:PARTICIPATING]->(event))
        
        CREATE (user)-[r:PARTICIPATING {
          joinedAt: datetime(),
          paymentId: $paymentId
        }]->(event)
        
        RETURN r
        `,
        { eventId, userId, paymentId: paymentId || null }
      );

      return result.records.length > 0;
    } catch (error) {
      console.error('Error joining event:', error);
      return false;
    } finally {
      await session.close();
    }
  }

  static async leaveEvent(eventId: string, userId: string): Promise<boolean> {
    const session = driver.session();
    try {
      const result = await session.run(
        `
        MATCH (user:User {id: $userId})-[r:PARTICIPATING]->(event:Event {id: $eventId})
        DELETE r
        RETURN true as success
        `,
        { eventId, userId }
      );

      return result.records.length > 0;
    } finally {
      await session.close();
    }
  }

  static async getEventParticipants(eventId: string): Promise<any[]> {
    const session = driver.session();
    try {
      const result = await session.run(
        `
        MATCH (participant:User)-[r:PARTICIPATING]->(event:Event {id: $eventId})
        RETURN participant {
          .*,
          joinedAt: toString(r.joinedAt),
          paymentId: r.paymentId
        } as participantData
        ORDER BY r.joinedAt ASC
        `,
        { eventId }
      );

      return result.records.map(record => {
        const participant = record.get('participantData');
        return {
          ...participant,
          createdAt: participant.createdAt?.toString() || new Date().toISOString(),
        };
      });
    } finally {
      await session.close();
    }
  }

  static async updateEvent(eventId: string, updates: Partial<Event>): Promise<Event | null> {
    const session = driver.session();
    try {
      const setStatements = [];
      const params: any = { eventId };

      if (updates.title !== undefined) {
        setStatements.push('event.title = $title');
        params.title = updates.title;
      }

      if (updates.description !== undefined) {
        setStatements.push('event.description = $description');
        params.description = updates.description;
      }

      if (updates.location !== undefined) {
        setStatements.push('event.location = $location');
        params.location = updates.location;
      }

      if (updates.maxParticipants !== undefined) {
        setStatements.push('event.maxParticipants = $maxParticipants');
        params.maxParticipants = updates.maxParticipants;
      }

      if (updates.startAt !== undefined) {
        setStatements.push('event.startAt = datetime($startAt)');
        params.startAt = updates.startAt;
      }

      if (updates.endAt !== undefined) {
        setStatements.push('event.endAt = datetime($endAt)');
        params.endAt = updates.endAt;
      }

      if (setStatements.length === 0) {
        return await this.getEventById(eventId);
      }

      const result = await session.run(
        `
        MATCH (event:Event {id: $eventId})
        SET ${setStatements.join(', ')}
        WITH event
        OPTIONAL MATCH (organizer:User)-[:CREATED]->(event)
        RETURN event {
          .*,
          organizerId: organizer.id,
          organizerName: organizer.username
        } as eventData
        `,
        params
      );

      if (result.records.length === 0) {
        return null;
      }

      const event = result.records[0].get('eventData');
      return {
        ...event,
        startAt: event.startAt?.toString() || new Date().toISOString(),
        endAt: event.endAt?.toString() || new Date().toISOString(),
        createdAt: event.createdAt?.toString() || new Date().toISOString(),
      };
    } finally {
      await session.close();
    }
  }

  static async deleteEvent(eventId: string, organizerId: string): Promise<boolean> {
    const session = driver.session();
    try {
      const result = await session.run(
        `
        MATCH (organizer:User {id: $organizerId})-[:CREATED]->(event:Event {id: $eventId})
        DETACH DELETE event
        RETURN true as success
        `,
        { eventId, organizerId }
      );

      return result.records.length > 0;
    } finally {
      await session.close();
    }
  }
}