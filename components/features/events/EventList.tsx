'use client';

import { Event } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, Users, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useRouter } from 'next/navigation';

interface EventListProps {
  events: Event[];
  currentUserId: string;
  showManage?: boolean;
}

export default function EventList({ events, currentUserId, showManage }: EventListProps) {
  const router = useRouter();

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">イベントがありません</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <Card key={event.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(`/events/${event.id}`)}>
          <CardHeader>
            <CardTitle className="line-clamp-2">{event.title}</CardTitle>
            <CardDescription className="line-clamp-2">
              {event.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>
                {format(new Date(event.startAt), 'M月d日 HH:mm', { locale: ja })}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span className="truncate">
                {event.type === 'online' ? 'オンライン' : event.location}
              </span>
            </div>
            
            {event.maxParticipants && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>
                  {(event as any).participantCount || 0} / {event.maxParticipants}人
                </span>
              </div>
            )}
            
            {event.price && event.price > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <DollarSign className="h-4 w-4" />
                <span>
                  ¥{event.price.toLocaleString()}
                </span>
              </div>
            )}
            
            {showManage && event.organizerId === currentUserId && (
              <div className="pt-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/events/${event.id}/edit`);
                  }}
                >
                  管理
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}