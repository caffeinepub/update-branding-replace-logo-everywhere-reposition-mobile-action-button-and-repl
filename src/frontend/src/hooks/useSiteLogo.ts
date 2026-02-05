import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { ExternalBlob } from '../backend';
import { toast } from 'sonner';

export function useGetSiteLogo() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string>({
    queryKey: ['siteLogo'],
    queryFn: async () => {
      if (!actor) return '/assets/generated/app-logo-dexfans.dim_512x512.png';
      const logo = await actor.getSiteLogo();
      if (logo) {
        return logo.getDirectURL();
      }
      return '/assets/generated/app-logo-dexfans.dim_512x512.png';
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSetSiteLogo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (logoBlob: ExternalBlob) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setSiteLogo(logoBlob);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['siteLogo'] });
      toast.success('Site logo updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update site logo');
    },
  });
}
