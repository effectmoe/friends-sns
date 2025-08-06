import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function BoardLoading() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <div className="h-9 w-24 bg-gray-200 rounded animate-pulse" />
        <div className="h-5 w-48 bg-gray-200 rounded animate-pulse mt-2" />
      </div>

      <Card>
        <CardHeader>
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}