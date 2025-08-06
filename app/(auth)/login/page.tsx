import { signInWithOAuth } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Github, Mail } from 'lucide-react';

export default function LoginPage() {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Friends SNSにログイン
        </CardTitle>
        <CardDescription className="text-center">
          ソーシャルアカウントでログインしてください
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form action={async () => {
          'use server';
          await signInWithOAuth('google');
        }}>
          <Button type="submit" className="w-full" variant="outline">
            <Mail className="mr-2 h-4 w-4" />
            Googleでログイン
          </Button>
        </form>
        
        <form action={async () => {
          'use server';
          await signInWithOAuth('github');
        }}>
          <Button type="submit" className="w-full" variant="outline">
            <Github className="mr-2 h-4 w-4" />
            GitHubでログイン
          </Button>
        </form>
        
        <p className="text-center text-sm text-gray-600 mt-4">
          アカウントをお持ちでない方も、ログインすると自動的にアカウントが作成されます
        </p>
      </CardContent>
    </Card>
  );
}