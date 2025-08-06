import { getUser } from '@/app/actions/auth';
import { getEventById, getEventParticipants } from '@/app/actions/events';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import EventDetail from '@/components/features/events/EventDetail';
import { notFound } from 'next/navigation';

interface Props {
  params: {
    id: string;
  };
}

export default async function EventDetailPage({ params }: Props) {
  const user = await getUser();
  
  if (!user) {
    return null;
  }

  const [event, participants] = await Promise.all([
    getEventById(params.id),
    getEventParticipants(params.id),
  ]);

  if (!event) {
    notFound();
  }

  const isOrganizer = event.organizerId === user.id;
  const isParticipating = participants.some(p => p.id === user.id);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{event.title}</h2>
        <p className="text-gray-600 mt-2">{event.type === 'online' ? 'オンライン' : 'オフライン'}イベント</p>
      </div>

      <EventDetail 
        event={event}
        participants={participants}
        currentUserId={user.id}
        isOrganizer={isOrganizer}
        isParticipating={isParticipating}
      />
    </div>
  );
}