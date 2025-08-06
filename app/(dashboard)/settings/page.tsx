'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Shield, Globe, Palette, Key, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [language, setLanguage] = useState('ja');
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    friendRequests: true,
    messages: true,
    events: true,
    posts: false,
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">設定</h2>
        <p className="text-gray-600 mt-2">アプリケーションの設定を管理します</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            一般
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            通知
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            プライバシー
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            アカウント
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>外観</CardTitle>
              <CardDescription>
                アプリケーションの見た目をカスタマイズします
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label>テーマ</Label>
                <RadioGroup value={theme} onValueChange={(value: any) => setTheme(value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="light" id="light" />
                    <Label htmlFor="light" className="font-normal cursor-pointer">
                      ライト
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dark" id="dark" />
                    <Label htmlFor="dark" className="font-normal cursor-pointer">
                      ダーク
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="system" id="system" />
                    <Label htmlFor="system" className="font-normal cursor-pointer">
                      システム設定に従う
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>言語と地域</CardTitle>
              <CardDescription>
                表示言語と地域設定を変更します
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label>言語</Label>
                <RadioGroup value={language} onValueChange={setLanguage}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ja" id="ja" />
                    <Label htmlFor="ja" className="font-normal cursor-pointer">
                      日本語
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="en" id="en" />
                    <Label htmlFor="en" className="font-normal cursor-pointer">
                      English
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>通知設定</CardTitle>
              <CardDescription>
                通知の受信方法と内容を設定します
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="email-notif"
                    checked={notifications.email}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, email: checked as boolean })
                    }
                  />
                  <Label htmlFor="email-notif" className="font-normal cursor-pointer">
                    メール通知を受信する
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="push-notif"
                    checked={notifications.push}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, push: checked as boolean })
                    }
                  />
                  <Label htmlFor="push-notif" className="font-normal cursor-pointer">
                    プッシュ通知を受信する
                  </Label>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <p className="text-sm font-medium">通知する内容</p>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="friend-req-notif"
                    checked={notifications.friendRequests}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, friendRequests: checked as boolean })
                    }
                  />
                  <Label htmlFor="friend-req-notif" className="font-normal cursor-pointer">
                    友達リクエスト
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="message-notif"
                    checked={notifications.messages}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, messages: checked as boolean })
                    }
                  />
                  <Label htmlFor="message-notif" className="font-normal cursor-pointer">
                    新しいメッセージ
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="event-notif"
                    checked={notifications.events}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, events: checked as boolean })
                    }
                  />
                  <Label htmlFor="event-notif" className="font-normal cursor-pointer">
                    イベントの招待・更新
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="post-notif"
                    checked={notifications.posts}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, posts: checked as boolean })
                    }
                  />
                  <Label htmlFor="post-notif" className="font-normal cursor-pointer">
                    掲示板の新しい投稿
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Settings */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>プロフィールの公開設定</CardTitle>
              <CardDescription>
                プロフィール情報の公開範囲を設定します
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label>プロフィールを表示できる人</Label>
                <RadioGroup defaultValue="friends">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="everyone" id="everyone" />
                    <Label htmlFor="everyone" className="font-normal cursor-pointer">
                      全員
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="friends" id="friends-only" />
                    <Label htmlFor="friends-only" className="font-normal cursor-pointer">
                      友達のみ
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="none" id="private" />
                    <Label htmlFor="private" className="font-normal cursor-pointer">
                      非公開
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ブロックリスト</CardTitle>
              <CardDescription>
                ブロックしているユーザーを管理します
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                現在ブロックしているユーザーはいません
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Settings */}
        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>パスワード変更</CardTitle>
              <CardDescription>
                アカウントのパスワードを変更します
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline">
                <Key className="h-4 w-4 mr-2" />
                パスワードを変更
              </Button>
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">危険な操作</CardTitle>
              <CardDescription>
                これらの操作は取り消すことができません
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  アカウントを削除
                </Button>
                <p className="text-sm text-gray-500 mt-2">
                  アカウントとすべてのデータが完全に削除されます
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button>変更を保存</Button>
      </div>
    </div>
  );
}