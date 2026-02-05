import { useState, useRef, useEffect } from 'react';
import type { DirectMessage } from '../backend';
import { useGetAllProfiles } from '../hooks/useProfile';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import UserAvatar from './UserAvatar';
import { formatDistanceToNow } from 'date-fns';

interface DirectMessageListProps {
  messages: DirectMessage[];
  onAvatarClick: (userId: string) => void;
}

export default function DirectMessageList({ messages, onAvatarClick }: DirectMessageListProps) {
  const { data: profiles } = useGetAllProfiles();
  const { identity } = useInternetIdentity();

  const getProfile = (userId: string) => {
    return profiles?.find(p => p.userId.toString() === userId);
  };

  const formatTime = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <div className="space-y-4">
      {messages.map((message) => {
        const profile = getProfile(message.senderId.toString());
        const isOwnMessage = identity?.getPrincipal().toString() === message.senderId.toString();

        return (
          <div
            key={message.id.toString()}
            className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <button
              onClick={() => onAvatarClick(message.senderId.toString())}
              className="focus:outline-none focus:ring-2 focus:ring-purple-500/50 rounded-full"
            >
              <UserAvatar profile={profile} size="sm" />
            </button>

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

              <div
                className={`
                  px-4 py-2 rounded-2xl shadow-lg
                  ${isOwnMessage 
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-purple-500/20' 
                    : 'bg-black/60 text-purple-100 border border-purple-500/20'
                  }
                `}
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
            </div>
          </div>
        );
      })}
    </div>
  );
}
