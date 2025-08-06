'use client';

import { useState } from 'react';
import { Event } from '@/types';
import { joinEvent, leaveEvent } from '@/app/actions/events';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, MapPin, Users, DollarSign, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface EventDetailProps {
  event: Event;
  participants: any[];
  currentUserId: string;
  isOrganizer: boolean;
  isParticipating: boolean;
}

export default function EventDetail({ event, participants, currentUserId, isOrganizer, isParticipating }: EventDetailProps) {
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const handleJoin = async () => {
    setJoining(true);
    try {
      const result = await joinEvent(event.id);
      if (!result.success) {
        alert('イベントへの参加に失敗しました');
      }
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = async () => {
    if (!confirm('本当に参加をキャンセルしますか？')) return;
    
    setLeaving(true);
    try {
      const result = await leaveEvent(event.id);
      if (!result.success) {
        alert('キャンセルに失敗しました');
      }
    } finally {
      setLeaving(false);
    }
  };

  const isFull = event.maxParticipants ? participants.length >= event.maxParticipants : false;

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>イベント詳細</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">説明</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{event.description}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  開催日時
                </h3>
                <p className="text-gray-600">
                  {format(new Date(event.startAt), 'yyyy年M月d日 HH:mm', { locale: ja })}
                </p>
                <p className="text-sm text-gray-500">
                  〜 {format(new Date(event.endAt), 'HH:mm', { locale: ja })}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  開催場所
                </h3>
                <p className="text-gray-600">
                  {event.type === 'online' ? (
                    <>
                      オンライン開催
                      {event.location && (
                        <span className="block text-sm mt-1">{event.location}</span>
                      )}
                    </>
                  ) : (
                    event.location
                  )}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  参加人数
                </h3>
                <p className="text-gray-600">
                  {participants.length}人
                  {event.maxParticipants && (
                    <span> / 定員 {event.maxParticipants}人</span>
                  )}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  参加費
                </h3>
                <p className="text-gray-600">
                  {event.price && event.price > 0 ? (
                    `¥${event.price.toLocaleString()}`
                  ) : (
                    '無料'
                  )}
                </p>
              </div>
            </div>

            {event.cancelPolicy && (
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  キャンセルポリシー
                </h3>
                <p className="text-gray-600 whitespace-pre-wrap">{event.cancelPolicy}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>参加者 ({participants.length}人)</CardTitle>
          </CardHeader>
          <CardContent>
            {participants.length === 0 ? (
              <p className="text-gray-500">まだ参加者がいません</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {participants.map((participant) => (
                  <div key={participant.id} className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={participant.profile?.avatar} />
                      <AvatarFallback>
                        {participant.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{participant.username}</p>
                      {participant.id === (event as any).organizerId && (
                        <span className="text-xs text-blue-600">主催者</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>アクション</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {isOrganizer ? (
              <>
                <Button className="w-full" variant="outline">
                  イベントを編集
                </Button>
                <Button className="w-full" variant="destructive">
                  イベントを削除
                </Button>
              </>
            ) : isParticipating ? (
              <Button 
                className="w-full" 
                variant="outline"
                onClick={handleLeave}
                disabled={leaving}
              >
                {leaving ? '処理中...' : '参加をキャンセル'}
              </Button>
            ) : (
              <Button 
                className="w-full"
                onClick={handleJoin}
                disabled={joining || isFull}
              >
                {joining ? '処理中...' : isFull ? '満員' : 'イベントに参加'}
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>主催者</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>
                  {(event as any).organizerName?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{(event as any).organizerName}</p>
                <p className="text-sm text-gray-500">イベント主催者</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}