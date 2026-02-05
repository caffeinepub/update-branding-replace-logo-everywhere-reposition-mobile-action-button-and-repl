import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { DirectMessage, UserId } from '../backend';
import { Principal } from '@dfinity/principal';
import { toast } from 'sonner';

const POLL_INTERVAL = 3000; // 3 seconds

export function useFetchDirectMessages(participantId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<DirectMessage[]>({
    queryKey: ['directMessages', participantId],
    queryFn: async () => {
      if (!actor || !participantId) return [];
      const participant = Principal.fromText(participantId);
      const result = await actor.getDirectMessageThread(participant);
      return result || [];
    },
    enabled: !!actor && !actorFetching && !!participantId,
    refetchInterval: POLL_INTERVAL,
  });
}

export function useSendDirectMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      receiverId, 
      content, 
      attachment 
    }: { 
      receiverId: string; 
      content: string; 
      attachment?: any;
    }) => {
      if (!actor) throw new Error('Actor not available');
      const receiver = Principal.fromText(receiverId);
      await actor.sendDirectMessage(receiver, content, attachment || null);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['directMessages', variables.receiverId] });
      queryClient.invalidateQueries({ queryKey: ['directMessageThreads'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send message');
    },
  });
}

export function useFetchDirectMessageThreads() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['directMessageThreads'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getDirectMessageThreadsStats();
    },
    enabled: !!actor && !actorFetching,
  });
}
