'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { getCurrentUser } from '@/lib/actions/user.actions';
import { updateUserProfile } from '@/lib/actions/profile.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, Camera, User, Settings, Bell, Shield, Link } from 'lucide-react';
import { User as UserType } from '@/types';

export default function ProfilePage() {
  const { user } = useSupabase();
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Form states
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [acceptFrom, setAcceptFrom] = useState<'all' | 'friends' | 'none'>('all');
  const [emailNotifications, setEmailNotifications] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;
    
    try {
      const userData = await getCurrentUser();
      if (userData) {
        setCurrentUser(userData);
        setNickname(userData.profile.nickname || '');
        setBio(userData.profile.bio || '');
        setAvatar(userData.profile.avatar || '');
        setAcceptFrom(userData.messageSettings.acceptFrom);
        setEmailNotifications(userData.messageSettings.emailNotifications);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setMessage({ type: 'error', text: 'プロフィールの読み込みに失敗しました' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!currentUser) return;
    
    setSaving(true);
    setMessage(null);
    
    try {
      const success = await updateUserProfile(currentUser.id, {
        profile: {
          nickname,
          bio,
          avatar,
        },
        messageSettings: {
          acceptFrom,
          emailNotifications,
        },
      });
      
      if (success) {
        setMessage({ type: 'success', text: 'プロフィールを更新しました' });
        // Reload profile to get latest data
        await loadUserProfile();
      } else {
        setMessage({ type: 'error', text: 'プロフィールの更新に失敗しました' });
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage({ type: 'error', text: 'プロフィールの更新に失敗しました' });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would upload this to a storage service
      // For now, we'll just create a local URL
      const url = URL.createObjectURL(file);
      setAvatar(url);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>プロフィール情報が見つかりません</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">プロフィール設定</h1>
        <p className="text-muted-foreground mt-2">
          あなたのプロフィール情報と設定を管理します
        </p>
      </div>

      {message && (
        <Alert className={`mb-6 ${message.type === 'error' ? 'border-red-500' : 'border-green-500'}`}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            プロフィール
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            プライバシー
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            アカウント
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>基本情報</CardTitle>
              <CardDescription>
                他のユーザーに表示される情報を設定します
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatar || user?.user_metadata?.avatar_url} />
                  <AvatarFallback>
                    {nickname?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Label htmlFor="avatar-upload" className="cursor-pointer">
                    <div className="flex items-center gap-2 text-sm text-primary hover:underline">
                      <Camera className="h-4 w-4" />
                      プロフィール画像を変更
                    </div>
                  </Label>
                  <Input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    JPG, PNG, GIF (最大 5MB)
                  </p>
                </div>
              </div>

              {/* Nickname */}
              <div className="space-y-2">
                <Label htmlFor="nickname">ニックネーム</Label>
                <Input
                  id="nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="表示名を入力"
                />
                <p className="text-xs text-muted-foreground">
                  他のユーザーに表示される名前です
                </p>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">自己紹介</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="自己紹介を入力"
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  最大 500文字まで入力できます
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>メッセージ設定</CardTitle>
              <CardDescription>
                メッセージの受信設定を管理します
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Message Accept Settings */}
              <div className="space-y-3">
                <Label>メッセージを受信する相手</Label>
                <RadioGroup value={acceptFrom} onValueChange={(value: any) => setAcceptFrom(value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="all" />
                    <Label htmlFor="all" className="font-normal cursor-pointer">
                      すべてのユーザー
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="friends" id="friends" />
                    <Label htmlFor="friends" className="font-normal cursor-pointer">
                      友達のみ
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="none" id="none" />
                    <Label htmlFor="none" className="font-normal cursor-pointer">
                      受信しない
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Email Notifications */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="email-notifications"
                  checked={emailNotifications}
                  onCheckedChange={(checked) => setEmailNotifications(checked as boolean)}
                />
                <Label htmlFor="email-notifications" className="font-normal cursor-pointer">
                  <div>
                    <p>メール通知を受信する</p>
                    <p className="text-xs text-muted-foreground">
                      新しいメッセージや友達リクエストの通知をメールで受け取ります
                    </p>
                  </div>
                </Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>アカウント情報</CardTitle>
              <CardDescription>
                アカウントの基本情報です
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">メールアドレス</p>
                <p className="text-sm text-muted-foreground">{currentUser.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium">ユーザー名</p>
                <p className="text-sm text-muted-foreground">@{currentUser.username}</p>
              </div>
              <div>
                <p className="text-sm font-medium">ユーザーID</p>
                <p className="text-sm text-muted-foreground font-mono">{currentUser.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium">登録日</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(currentUser.createdAt).toLocaleDateString('ja-JP')}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>連携アカウント</CardTitle>
              <CardDescription>
                外部サービスとの連携を管理します
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Link className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Google</p>
                    <p className="text-sm text-muted-foreground">
                      {user?.user_metadata?.email || '未連携'}
                    </p>
                  </div>
                </div>
                {user?.app_metadata?.provider === 'google' && (
                  <span className="text-sm text-green-600">連携済み</span>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="mt-8 flex justify-end">
        <Button onClick={handleSaveProfile} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              保存中...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              変更を保存
            </>
          )}
        </Button>
      </div>
    </div>
  );
}