'use client';

import { useState } from 'react';
import { signInWithOAuth } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Github, Mail, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState<'google' | 'github' | null>(null);

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    try {
      setIsLoading(provider);
      
      // Clear any existing session cookies first
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      
      // Add a small delay to ensure cookies are cleared
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Now proceed with OAuth
      await signInWithOAuth(provider);
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(null);
    }
  };

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
          <Button 
            type="submit" 
            className="w-full" 
            variant="outline"
            disabled={isLoading !== null}
          >
            {isLoading === 'google' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Mail className="mr-2 h-4 w-4" />
            )}
            Googleでログイン
          </Button>
        </form>
        
        <form action={async () => {
          'use server';
          await signInWithOAuth('github');
        }}>
          <Button 
            type="submit" 
            className="w-full" 
            variant="outline"
            disabled={isLoading !== null}
          >
            {isLoading === 'github' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Github className="mr-2 h-4 w-4" />
            )}
            GitHubでログイン
          </Button>
        </form>
        
        <div className="border-t pt-4">
          <p className="text-center text-sm text-gray-600">
            アカウントをお持ちでない方も、ログインすると自動的にアカウントが作成されます
          </p>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <p className="text-xs text-blue-800">
              <strong>ログインの問題がある場合：</strong>
            </p>
            <ul className="text-xs text-blue-700 mt-2 space-y-1">
              <li>• ブラウザのシークレット/プライベートモードを使用</li>
              <li>• ブラウザのCookieをクリア</li>
              <li>• 別のブラウザを試す</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}