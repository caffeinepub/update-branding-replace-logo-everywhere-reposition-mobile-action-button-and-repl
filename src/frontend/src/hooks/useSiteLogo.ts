import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { ExternalBlob } from '../backend';
import { toast } from 'sonner';
import { getCachedSiteLogoUrl, setCachedSiteLogoUrl, preloadImage } from '../utils/siteLogoCache';
import { useState, useEffect } from 'react';

export function useGetSiteLogo() {
  const { actor, isFetching: actorFetching } = useActor();
  const [cachedUrl, setCachedUrl] = useState<string | null>(() => getCachedSiteLogoUrl());

  const query = useQuery<string | null>({
    queryKey: ['siteLogo'],
    queryFn: async () => {
      if (!actor) return null;
      const logo = await actor.getSiteLogo();
      if (logo) {
        const url = logo.getDirectURL();
        // Update cache with fresh URL
        setCachedSiteLogoUrl(url);
        return url;
      }
      return null;
    },
    enabled: !!actor && !actorFetching,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    retry: false,
  });

  // Sync cached URL with query data when it changes
  useEffect(() => {
    if (query.data !== undefined) {
      setCachedUrl(query.data);
    }
  }, [query.data]);

  // Return cached URL immediately for initial render, then switch to query data
  return {
    ...query,
    data: query.isFetched ? query.data : cachedUrl,
  };
}

export function useSetSiteLogo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (logoBlob: ExternalBlob) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setSiteLogo(logoBlob);
      return logoBlob;
    },
    onSuccess: async (logoBlob) => {
      // Get the direct URL from the uploaded blob
      const newLogoUrl = logoBlob.getDirectURL();
      
      // Preload the new logo to ensure it's in browser cache
      try {
        await preloadImage(newLogoUrl);
      } catch (error) {
        console.warn('Failed to preload new logo:', error);
      }
      
      // Immediately update React Query cache
      queryClient.setQueryData(['siteLogo'], newLogoUrl);
      
      // Update localStorage cache
      setCachedSiteLogoUrl(newLogoUrl);
      
      // Invalidate to trigger background refresh
      queryClient.invalidateQueries({ queryKey: ['siteLogo'] });
      
      toast.success('Site logo updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update site logo');
    },
  });
}
