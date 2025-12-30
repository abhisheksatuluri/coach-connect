import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from '../api/api';

export function useJourneys() {
    return useQuery({
        queryKey: ['journeys'],
        queryFn: () => api.entities.Journey.list(),
    });
}

export function useJourney(id) {
    return useQuery({
        queryKey: ['journeys', id],
        queryFn: () => api.entities.Journey.get(id),
        enabled: !!id,
    });
}

export function useCreateJourney() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => api.entities.Journey.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['journeys'] });
        },
    });
}

export function useUpdateJourney() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => api.entities.Journey.update(id, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['journeys'] });
            queryClient.invalidateQueries({ queryKey: ['journeys', variables.id] });
        },
    });
}

export function useDeleteJourney() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => api.entities.Journey.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['journeys'] });
        },
    });
}
