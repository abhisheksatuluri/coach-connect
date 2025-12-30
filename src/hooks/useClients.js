import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from '../api/api';

export function useClients() {
    return useQuery({
        queryKey: ['clients'],
        queryFn: () => api.entities.Client.list('-created_date'),
    });
}

export function useClient(id) {
    return useQuery({
        queryKey: ['clients', id],
        queryFn: () => api.entities.Client.get(id),
        enabled: !!id,
    });
}

export function useCreateClient() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => api.entities.Client.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] });
        },
    });
}

export function useUpdateClient() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => api.entities.Client.update(id, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            queryClient.invalidateQueries({ queryKey: ['clients', variables.id] });
        },
    });
}

export function useDeleteClient() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => api.entities.Client.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] });
        },
    });
}
