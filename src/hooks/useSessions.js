import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export function useSessions() {
    return useQuery({
        queryKey: ['sessions'],
        queryFn: () => base44.entities.Session.list('-date_time'),
    });
}

export function useSession(id) {
    return useQuery({
        queryKey: ['sessions', id],
        queryFn: () => base44.entities.Session.get(id),
        enabled: !!id,
    });
}

export function useCreateSession() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => base44.entities.Session.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sessions'] });
        },
    });
}

export function useUpdateSession() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => base44.entities.Session.update(id, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['sessions'] });
            queryClient.invalidateQueries({ queryKey: ['sessions', variables.id] });
        },
    });
}

export function useDeleteSession() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => base44.entities.Session.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sessions'] });
        },
    });
}
