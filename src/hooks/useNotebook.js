import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from '../api/api';

export function useNotebook() {
    return useQuery({
        queryKey: ['notebook'],
        queryFn: () => api.entities.Note.list('-date'),
    });
}

export function useNote(id) {
    return useQuery({
        queryKey: ['notebook', id],
        queryFn: () => api.entities.Note.get(id),
        enabled: !!id,
    });
}

export function useCreateNote() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => api.entities.Note.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notebook'] });
        },
    });
}

export function useUpdateNote() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => api.entities.Note.update(id, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['notebook'] });
            queryClient.invalidateQueries({ queryKey: ['notebook', variables.id] });
        },
    });
}

export function useDeleteNote() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => api.entities.Note.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notebook'] });
        },
    });
}
