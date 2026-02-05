import { useEffect, useRef } from 'react';
import { useFetchGlobalMessages } from '../hooks/useMessages';
import MessageList from '../components/MessageList';
import MessageComposer from '../components/MessageComposer';
import { Loader2 } from 'lucide-react';

export default function GlobalChatPage() {
  const { data: messages, isLoading } = useFetchGlobalMessages();
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
        <h2 className="text-xl font-bold text-white">Global Chat</h2>
        <p className="text-sm text-purple-300">Chat with everyone</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages && messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-purple-300 mb-2">No messages yet</p>
              <p className="text-sm text-purple-400/60">Be the first to say hello!</p>
            </div>
          </div>
        ) : (
          <>
            <MessageList messages={messages || []} />
            <div ref={bottomRef} />
          </>
        )}
      </div>

      <div className="p-4 border-t border-purple-500/20 bg-black/40 backdrop-blur-sm">
        <MessageComposer />
      </div>
    </div>
  );
}
