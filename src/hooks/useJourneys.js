import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export function useJourneys() {
    return useQuery({
        queryKey: ['journeys'],
        queryFn: () => base44.entities.Journey.list(),
    });
}

export function useJourney(id) {
    return useQuery({
        queryKey: ['journeys', id],
        queryFn: () => base44.entities.Journey.get(id),
        enabled: !!id,
    });
}

export function useCreateJourney() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => base44.entities.Journey.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['journeys'] });
        },
    });
}

export function useUpdateJourney() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => base44.entities.Journey.update(id, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['journeys'] });
            queryClient.invalidateQueries({ queryKey: ['journeys', variables.id] });
        },
    });
}

export function useDeleteJourney() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => base44.entities.Journey.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['journeys'] });
        },
    });
}
