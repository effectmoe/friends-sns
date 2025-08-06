'use server';

import { EventRepository } from '@/lib/repositories/event.repository';
import { getUser } from './auth';
import { revalidatePath } from 'next/cache';
import { Event } from '@/types';

export async function createEvent(eventData: Partial<Event>) {
  const user = await getUser();
  if (!user) {
    throw new Error('認証が必要です');
  }

  try {
    const event = await EventRepository.createEvent(eventData, user.id);
    revalidatePath('/events');
    return { success: true, event };
  } catch (error) {
    console.error('Error creating event:', error);
    return { 
      success: false, 
      error: 'イベントの作成に失敗しました' 
    };
  }
}

export async function getEvents(filter?: {
  type?: 'online' | 'offline';
  organizerId?: string;
  participantId?: string;
  upcoming?: boolean;
}) {
  try {
    return await EventRepository.getEvents(filter);
  } catch (error) {
    console.error('Error getting events:', error);
    return [];
  }
}

export async function getEventById(eventId: string) {
  try {
    return await EventRepository.getEventById(eventId);
  } catch (error) {
    console.error('Error getting event:', error);
    return null;
  }
}

export async function joinEvent(eventId: string, paymentId?: string) {
  const user = await getUser();
  if (!user) {
    throw new Error('認証が必要です');
  }

  try {
    const result = await EventRepository.joinEvent(eventId, user.id, paymentId);
    revalidatePath('/events');
    revalidatePath(`/events/${eventId}`);
    return { success: result };
  } catch (error) {
    console.error('Error joining event:', error);
    return { 
      success: false, 
      error: 'イベントへの参加に失敗しました' 
    };
  }
}

export async function leaveEvent(eventId: string) {
  const user = await getUser();
  if (!user) {
    throw new Error('認証が必要です');
  }

  try {
    const result = await EventRepository.leaveEvent(eventId, user.id);
    revalidatePath('/events');
    revalidatePath(`/events/${eventId}`);
    return { success: result };
  } catch (error) {
    console.error('Error leaving event:', error);
    return { 
      success: false, 
      error: 'イベントからの退出に失敗しました' 
    };
  }
}

export async function getEventParticipants(eventId: string) {
  try {
    return await EventRepository.getEventParticipants(eventId);
  } catch (error) {
    console.error('Error getting participants:', error);
    return [];
  }
}

export async function updateEvent(eventId: string, updates: Partial<Event>) {
  const user = await getUser();
  if (!user) {
    throw new Error('認証が必要です');
  }

  try {
    const event = await EventRepository.updateEvent(eventId, updates);
    revalidatePath('/events');
    revalidatePath(`/events/${eventId}`);
    return { success: true, event };
  } catch (error) {
    console.error('Error updating event:', error);
    return { 
      success: false, 
      error: 'イベントの更新に失敗しました' 
    };
  }
}

export async function deleteEvent(eventId: string) {
  const user = await getUser();
  if (!user) {
    throw new Error('認証が必要です');
  }

  try {
    const result = await EventRepository.deleteEvent(eventId, user.id);
    revalidatePath('/events');
    return { success: result };
  } catch (error) {
    console.error('Error deleting event:', error);
    return { 
      success: false, 
      error: 'イベントの削除に失敗しました' 
    };
  }
}