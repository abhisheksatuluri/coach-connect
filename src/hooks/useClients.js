import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export function useClients() {
    return useQuery({
        queryKey: ['clients'],
        queryFn: () => base44.entities.Client.list('-created_date'),
    });
}

export function useClient(id) {
    return useQuery({
        queryKey: ['clients', id],
        queryFn: () => base44.entities.Client.get(id),
        enabled: !!id,
    });
}

export function useCreateClient() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => base44.entities.Client.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] });
        },
    });
}

export function useUpdateClient() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => base44.entities.Client.update(id, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            queryClient.invalidateQueries({ queryKey: ['clients', variables.id] });
        },
    });
}

export function useDeleteClient() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => base44.entities.Client.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] });
        },
    });
}
