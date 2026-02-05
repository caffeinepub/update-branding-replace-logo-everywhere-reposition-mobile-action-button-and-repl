import { useEffect, useRef } from 'react';
import { useFetchDirectMessages } from '../hooks/useDirectMessages';
import { useGetUserProfile } from '../hooks/useProfile';
import DirectMessageList from '../components/DirectMessageList';
import MessageComposer from '../components/MessageComposer';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UserAvatar from '../components/UserAvatar';

interface DirectMessagePageProps {
  participantId: string;
  onBack: () => void;
  onAvatarClick: (userId: string) => void;
}

export default function DirectMessagePage({ participantId, onBack, onAvatarClick }: DirectMessagePageProps) {
  const { data: messages, isLoading } = useFetchDirectMessages(participantId);
  const { data: participantProfile } = useGetUserProfile(participantId);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-2" />
          <p className="text-purple-300">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-black/20">
      <div className="p-4 border-b border-purple-500/20 bg-black/40 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Button
            onClick={onBack}
            variant="ghost"
            size="icon"
            className="text-purple-300 hover:text-white hover:bg-purple-900/30"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <button
            onClick={() => onAvatarClick(participantId)}
            className="flex items-center gap-3 flex-1 hover:bg-purple-900/20 rounded-lg p-2 transition-colors"
          >
            <UserAvatar profile={participantProfile} size="sm" />
            <div className="text-left">
              <h2 className="text-lg font-bold text-white">
                {participantProfile?.displayName || 'User'}
              </h2>
              <p className="text-sm text-purple-300">Direct Message</p>
            </div>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages && messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-purple-300 mb-2">No messages yet</p>
              <p className="text-sm text-purple-400/60">Start the conversation!</p>
            </div>
          </div>
        ) : (
          <>
            <DirectMessageList 
              messages={messages || []} 
              onAvatarClick={onAvatarClick}
            />
            <div ref={bottomRef} />
          </>
        )}
      </div>

      <div className="p-4 border-t border-purple-500/20 bg-black/40 backdrop-blur-sm">
        <MessageComposer 
          mode="dm"
          recipientId={participantId}
          placeholder={`Message ${participantProfile?.displayName || 'user'}...`}
        />
      </div>
    </div>
  );
}
