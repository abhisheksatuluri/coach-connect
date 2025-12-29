import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export function usePayments() {
    return useQuery({
        queryKey: ['payments'],
        queryFn: () => base44.entities.Payment.list('-date'),
    });
}

export function usePayment(id) {
    return useQuery({
        queryKey: ['payments', id],
        queryFn: () => base44.entities.Payment.get(id),
        enabled: !!id,
    });
}

export function useCreatePayment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => base44.entities.Payment.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payments'] });
        },
    });
}

export function useUpdatePayment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => base44.entities.Payment.update(id, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['payments'] });
            queryClient.invalidateQueries({ queryKey: ['payments', variables.id] });
        },
    });
}

export function useDeletePayment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => base44.entities.Payment.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payments'] });
        },
    });
}
