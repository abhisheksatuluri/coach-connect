import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from '../api/api';

export function useSessions() {
    return useQuery({
        queryKey: ['sessions'],
        queryFn: () => api.entities.Session.list('-date_time'),
    });
}

export function useSession(id) {
    return useQuery({
        queryKey: ['sessions', id],
        queryFn: () => api.entities.Session.get(id),
        enabled: !!id,
    });
}

export function useCreateSession() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => api.entities.Session.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sessions'] });
        },
    });
}

export function useUpdateSession() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => api.entities.Session.update(id, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['sessions'] });
            queryClient.invalidateQueries({ queryKey: ['sessions', variables.id] });
        },
    });
}

export function useDeleteSession() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => api.entities.Session.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sessions'] });
        },
    });
}
