import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Message, MessageId } from '../backend';
import { toast } from 'sonner';

const POLL_INTERVAL = 3000; // 3 seconds

export function useFetchGlobalMessages() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Message[]>({
    queryKey: ['globalMessages'],
    queryFn: async () => {
      if (!actor) return [];
      // Fetch all messages (fromTimestamp = 0)
      return actor.fetchGlobalMessages(BigInt(0));
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: POLL_INTERVAL,
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ content, attachment }: { content: string; attachment?: any }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.sendMessage('global', content, attachment || null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['globalMessages'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send message');
    },
  });
}

export function useUpdateMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      messageId, 
      newContent, 
      newAttachment 
    }: { 
      messageId: bigint; 
      newContent?: string; 
      newAttachment?: any;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateMessage('global', messageId, newContent || null, newAttachment || null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['globalMessages'] });
      toast.success('Message updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update message');
    },
  });
}

export function useDeleteMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageId: MessageId) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteGlobalMessage(messageId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['globalMessages'] });
      toast.success('Message deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete message');
    },
  });
}
