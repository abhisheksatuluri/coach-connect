import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export function usePractitioners() {
    return useQuery({
        queryKey: ['practitioners'],
        queryFn: () => base44.entities.Practitioner.list(),
    });
}

export function usePractitioner(id) {
    return useQuery({
        queryKey: ['practitioners', id],
        queryFn: () => base44.entities.Practitioner.get(id),
        enabled: !!id,
    });
}

export function useCreatePractitioner() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => base44.entities.Practitioner.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['practitioners'] });
        },
    });
}

export function useUpdatePractitioner() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => base44.entities.Practitioner.update(id, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['practitioners'] });
            queryClient.invalidateQueries({ queryKey: ['practitioners', variables.id] });
        },
    });
}

export function useDeletePractitioner() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => base44.entities.Practitioner.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['practitioners'] });
        },
    });
}
