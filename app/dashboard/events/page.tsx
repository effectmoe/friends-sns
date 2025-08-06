import { getUser } from '@/app/actions/auth';
import { getEvents } from '@/app/actions/events';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EventList from '@/components/features/events/EventList';
import CreateEventDialog from '@/components/features/events/CreateEventDialog';

export default async function EventsPage() {
  const user = await getUser();
  
  if (!user) {
    return null;
  }

  const [allEvents, myEvents, participatingEvents] = await Promise.all([
    getEvents({ upcoming: true }),
    getEvents({ organizerId: user.id }),
    getEvents({ participantId: user.id }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">イベント</h2>
          <p className="text-gray-600 mt-2">イベントの作成・参加ができます</p>
        </div>
        <CreateEventDialog />
      </div>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">
            開催予定 ({allEvents.length})
          </TabsTrigger>
          <TabsTrigger value="my-events">
            主催イベント ({myEvents.length})
          </TabsTrigger>
          <TabsTrigger value="participating">
            参加予定 ({participatingEvents.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          <Card>
            <CardHeader>
              <CardTitle>開催予定のイベント</CardTitle>
              <CardDescription>
                これから開催されるイベント一覧です
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EventList events={allEvents} currentUserId={user.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-events">
          <Card>
            <CardHeader>
              <CardTitle>主催イベント</CardTitle>
              <CardDescription>
                あなたが主催しているイベント一覧です
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EventList events={myEvents} currentUserId={user.id} showManage />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="participating">
          <Card>
            <CardHeader>
              <CardTitle>参加予定のイベント</CardTitle>
              <CardDescription>
                参加申込済みのイベント一覧です
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EventList events={participatingEvents} currentUserId={user.id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}