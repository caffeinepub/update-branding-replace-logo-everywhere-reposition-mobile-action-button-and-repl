import { useState } from 'react';
import { useSendMessage } from '../hooks/useMessages';
import { useSendDirectMessage } from '../hooks/useDirectMessages';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Image as ImageIcon, X } from 'lucide-react';
import { ExternalBlob } from '../backend';
import { toast } from 'sonner';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface MessageComposerProps {
  mode?: 'global' | 'dm';
  recipientId?: string;
  placeholder?: string;
}

export default function MessageComposer({ mode = 'global', recipientId, placeholder = 'Type a message...' }: MessageComposerProps) {
  const [content, setContent] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const sendGlobalMessage = useSendMessage();
  const sendDM = useSendDirectMessage();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Please select a valid image (JPG, PNG, or WebP)');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setAttachment(file);
  };

  const handleSend = async () => {
    if (!content.trim() && !attachment) return;

    try {
      let attachmentBlob;
      if (attachment) {
        const arrayBuffer = await attachment.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        attachmentBlob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
          setUploadProgress(percentage);
        });
      }

      if (mode === 'dm' && recipientId) {
        await sendDM.mutateAsync({
          receiverId: recipientId,
          content: content.trim(),
          attachment: attachmentBlob,
        });
      } else {
        await sendGlobalMessage.mutateAsync({
          content: content.trim(),
          attachment: attachmentBlob,
        });
      }

      setContent('');
      setAttachment(null);
      setUploadProgress(0);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isPending = mode === 'dm' ? sendDM.isPending : sendGlobalMessage.isPending;

  return (
    <div className="space-y-2">
      {attachment && (
        <div className="flex items-center gap-2 p-2 bg-purple-900/20 rounded-lg border border-purple-500/30">
          <ImageIcon className="w-4 h-4 text-purple-400" />
          <span className="text-sm text-purple-200 flex-1 truncate">{attachment.name}</span>
          <button
            onClick={() => setAttachment(null)}
            className="text-purple-400 hover:text-purple-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="w-full bg-purple-900/20 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-600 to-purple-700 h-2 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      <div className="flex gap-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          rows={1}
          className="flex-1 bg-black/50 border-purple-500/30 text-white placeholder:text-purple-300/40 focus:border-purple-500 focus:ring-purple-500/20 resize-none"
        />

        <input
          type="file"
          id={`file-upload-${mode}`}
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />

        <Button
          type="button"
          onClick={() => document.getElementById(`file-upload-${mode}`)?.click()}
          variant="outline"
          size="icon"
          className="border-purple-500/30 text-purple-300 hover:bg-purple-900/30 hover:text-white"
        >
          <ImageIcon className="w-5 h-5" />
        </Button>

        <Button
          onClick={handleSend}
          disabled={(!content.trim() && !attachment) || isPending}
          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg shadow-purple-500/30"
        >
          {isPending ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      </div>
    </div>
  );
}
