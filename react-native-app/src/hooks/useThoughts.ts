import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { thoughtService } from '../services';
import { QUERY_KEYS } from '../constants';
import type { Thought, CreateThoughtData, TimeFilter } from '../types';
import { getDateRange } from '../utils';

interface UseThoughtsOptions {
  timeFilter?: TimeFilter;
  enabled?: boolean;
}

export const useThoughts = (options: UseThoughtsOptions = {}) => {
  const { timeFilter, enabled = true } = options;
  
  const getDateRangeForFilter = () => {
    if (!timeFilter || timeFilter === 'all') return { from: undefined, to: undefined };
    
    const days = timeFilter === '7days' ? 7 : 30;
    const { from, to } = getDateRange(days);
    return { from, to };
  };

  const { from, to } = getDateRangeForFilter();

  return useQuery({
    queryKey: [QUERY_KEYS.THOUGHTS, timeFilter],
    queryFn: () => thoughtService.getThoughts(from, to),
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCreateThought = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateThoughtData) => thoughtService.createThought(data),
    onSuccess: () => {
      // Invalidate all thought queries to refresh data
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.THOUGHTS] });
    },
  });
};

export const useDeleteThought = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (thoughtId: string) => thoughtService.deleteThought(thoughtId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.THOUGHTS] });
    },
  });
};

export const useThoughtStats = (thoughts: Thought[]) => {
  const stats = {
    totalThoughts: thoughts.length,
    averageIntensity: 0,
    mostCommonDistortion: 'None',
  };

  if (thoughts.length > 0) {
    // Calculate average intensity
    const totalIntensity = thoughts.reduce((sum, thought) => sum + (thought.intensity || 0), 0);
    stats.averageIntensity = Math.round((totalIntensity / thoughts.length) * 10) / 10;

    // Find most common distortion
    const distortionCounts: Record<string, number> = {};
    thoughts.forEach(thought => {
      if (thought.cognitive_distortion) {
        distortionCounts[thought.cognitive_distortion] = 
          (distortionCounts[thought.cognitive_distortion] || 0) + 1;
      }
    });

    const mostCommon = Object.entries(distortionCounts)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (mostCommon) {
      stats.mostCommonDistortion = mostCommon[0];
    }
  }

  return stats;
};