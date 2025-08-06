'use client';

import dynamic from 'next/dynamic';

const FriendMap = dynamic(() => import('./FriendMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-white rounded-lg shadow-sm flex items-center justify-center" style={{ minHeight: '600px' }}>
      <p className="text-gray-500">マップを読み込み中...</p>
    </div>
  ),
});

export default FriendMap;