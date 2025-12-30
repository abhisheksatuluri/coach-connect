import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from '../api/api';

export function usePayments() {
    return useQuery({
        queryKey: ['payments'],
        queryFn: () => api.entities.Payment.list('-date'),
    });
}

export function usePayment(id) {
    return useQuery({
        queryKey: ['payments', id],
        queryFn: () => api.entities.Payment.get(id),
        enabled: !!id,
    });
}

export function useCreatePayment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => api.entities.Payment.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payments'] });
        },
    });
}

export function useUpdatePayment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => api.entities.Payment.update(id, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['payments'] });
            queryClient.invalidateQueries({ queryKey: ['payments', variables.id] });
        },
    });
}

export function useDeletePayment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => api.entities.Payment.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payments'] });
        },
    });
}
