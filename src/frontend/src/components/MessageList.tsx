import { useState, useRef, useEffect } from 'react';
import type { Message } from '../backend';
import { useGetAllProfiles } from '../hooks/useProfile';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useDeleteMessage } from '../hooks/useMessages';
import UserAvatar from './UserAvatar';
import { formatDistanceToNow } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MessageListProps {
  messages: Message[];
}

export default function MessageList({ messages }: MessageListProps) {
  const { data: profiles } = useGetAllProfiles();
  const { identity } = useInternetIdentity();
  const deleteMessage = useDeleteMessage();
  const [longPressMessageId, setLongPressMessageId] = useState<string | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const getProfile = (userId: string) => {
    return profiles?.find(p => p.userId.toString() === userId);
  };

  const formatTime = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const handlePressStart = (messageId: string, isOwnMessage: boolean) => {
    if (!isOwnMessage) return;

    longPressTimerRef.current = setTimeout(() => {
      setLongPressMessageId(messageId);
    }, 500); // 500ms for long press
  };

  const handlePressEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleDelete = (messageId: bigint) => {
    deleteMessage.mutate(messageId);
    setLongPressMessageId(null);
  };

  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      {messages.map((message) => {
        const profile = getProfile(message.senderId.toString());
        const isOwnMessage = identity?.getPrincipal().toString() === message.senderId.toString();
        const showDeleteButton = longPressMessageId === message.id.toString();

        return (
          <div
            key={message.id.toString()}
            className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <UserAvatar profile={profile} size="sm" />

            <div className={`flex-1 max-w-lg ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col`}>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-sm font-semibold ${isOwnMessage ? 'text-purple-300' : 'text-purple-200'}`}>
                  {profile?.displayName || message.senderUsername}
                </span>
                <span className="text-xs text-purple-400/60">
                  {formatTime(message.createdAt)}
                </span>
                {message.edited && (
                  <span className="text-xs text-purple-400/60 italic">(edited)</span>
                )}
              </div>

              <div className="relative">
                <div
                  className={`
                    px-4 py-2 rounded-2xl shadow-lg
                    ${isOwnMessage 
                      ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-purple-500/20' 
                      : 'bg-black/60 text-purple-100 border border-purple-500/20'
                    }
                  `}
                  onMouseDown={() => handlePressStart(message.id.toString(), isOwnMessage)}
                  onMouseUp={handlePressEnd}
                  onMouseLeave={handlePressEnd}
                  onTouchStart={() => handlePressStart(message.id.toString(), isOwnMessage)}
                  onTouchEnd={handlePressEnd}
                  onTouchCancel={handlePressEnd}
                  style={{ userSelect: 'none' }}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>

                  {message.attachment && (
                    <img
                      src={message.attachment.getDirectURL()}
                      alt="Attachment"
                      className="mt-2 rounded-lg max-w-full max-h-64 object-contain"
                    />
                  )}
                </div>

                {showDeleteButton && (
                  <div className={`absolute top-0 ${isOwnMessage ? 'left-0 -translate-x-12' : 'right-0 translate-x-12'}`}>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => handleDelete(message.id)}
                      disabled={deleteMessage.isPending}
                      className="h-8 w-8 rounded-full shadow-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
