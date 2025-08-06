'use client';

import { useState } from 'react';
import { createEvent } from '@/app/actions/events';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';

export default function CreateEventDialog() {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'offline' as 'online' | 'offline',
    location: '',
    startAt: '',
    endAt: '',
    maxParticipants: '',
    price: '',
    cancelPolicy: '',
    reminderSettings: {
      twoDaysBefore: true,
      oneDayBefore: true,
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setCreating(true);
    try {
      const result = await createEvent({
        ...formData,
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : undefined,
        price: formData.price ? parseFloat(formData.price) : 0,
        currency: 'JPY',
      });

      if (result.success) {
        setOpen(false);
        setFormData({
          title: '',
          description: '',
          type: 'offline',
          location: '',
          startAt: '',
          endAt: '',
          maxParticipants: '',
          price: '',
          cancelPolicy: '',
          reminderSettings: {
            twoDaysBefore: true,
            oneDayBefore: true,
          },
        });
      } else {
        alert(result.error || 'イベントの作成に失敗しました');
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          イベントを作成
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>新規イベント作成</DialogTitle>
          <DialogDescription>
            イベントの詳細を入力してください
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">イベント名 *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">説明 *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              required
            />
          </div>

          <div>
            <Label>開催形式 *</Label>
            <RadioGroup
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value as 'online' | 'offline' })}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="offline" id="offline" />
                <Label htmlFor="offline">オフライン</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="online" id="online" />
                <Label htmlFor="online">オンライン</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="location">
              {formData.type === 'online' ? 'URL（Zoomリンクなど）' : '開催場所'} *
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder={formData.type === 'online' ? 'https://zoom.us/...' : '東京都渋谷区...'}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startAt">開始日時 *</Label>
              <Input
                id="startAt"
                type="datetime-local"
                value={formData.startAt}
                onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="endAt">終了日時 *</Label>
              <Input
                id="endAt"
                type="datetime-local"
                value={formData.endAt}
                onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maxParticipants">定員（空欄で無制限）</Label>
              <Input
                id="maxParticipants"
                type="number"
                min="1"
                value={formData.maxParticipants}
                onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                placeholder="10"
              />
            </div>
            <div>
              <Label htmlFor="price">参加費（円）</Label>
              <Input
                id="price"
                type="number"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="cancelPolicy">キャンセルポリシー</Label>
            <Textarea
              id="cancelPolicy"
              value={formData.cancelPolicy}
              onChange={(e) => setFormData({ ...formData, cancelPolicy: e.target.value })}
              rows={3}
              placeholder="キャンセルに関する規定を記入..."
            />
          </div>

          <div className="space-y-2">
            <Label>リマインダー設定</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="twoDaysBefore"
                checked={formData.reminderSettings.twoDaysBefore}
                onCheckedChange={(checked) => 
                  setFormData({
                    ...formData,
                    reminderSettings: {
                      ...formData.reminderSettings,
                      twoDaysBefore: checked as boolean,
                    },
                  })
                }
              />
              <Label htmlFor="twoDaysBefore">2日前にリマインド</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="oneDayBefore"
                checked={formData.reminderSettings.oneDayBefore}
                onCheckedChange={(checked) => 
                  setFormData({
                    ...formData,
                    reminderSettings: {
                      ...formData.reminderSettings,
                      oneDayBefore: checked as boolean,
                    },
                  })
                }
              />
              <Label htmlFor="oneDayBefore">1日前にリマインド</Label>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              キャンセル
            </Button>
            <Button type="submit" disabled={creating}>
              {creating ? '作成中...' : 'イベントを作成'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}