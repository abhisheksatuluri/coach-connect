import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from '../api/api';

export function usePractitioners() {
    return useQuery({
        queryKey: ['practitioners'],
        queryFn: () => api.entities.Practitioner.list(),
    });
}

export function usePractitioner(id) {
    return useQuery({
        queryKey: ['practitioners', id],
        queryFn: () => api.entities.Practitioner.get(id),
        enabled: !!id,
    });
}

export function useCreatePractitioner() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => api.entities.Practitioner.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['practitioners'] });
        },
    });
}

export function useUpdatePractitioner() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => api.entities.Practitioner.update(id, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['practitioners'] });
            queryClient.invalidateQueries({ queryKey: ['practitioners', variables.id] });
        },
    });
}

export function useDeletePractitioner() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => api.entities.Practitioner.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['practitioners'] });
        },
    });
}
