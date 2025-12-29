import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export function useNotebook() {
    return useQuery({
        queryKey: ['notebook'],
        queryFn: () => base44.entities.Note.list('-created_at'),
    });
}

export function useNote(id) {
    return useQuery({
        queryKey: ['notebook', id],
        queryFn: () => base44.entities.Note.get(id),
        enabled: !!id,
    });
}

export function useCreateNote() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => base44.entities.Note.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notebook'] });
        },
    });
}

export function useUpdateNote() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => base44.entities.Note.update(id, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['notebook'] });
            queryClient.invalidateQueries({ queryKey: ['notebook', variables.id] });
        },
    });
}

export function useDeleteNote() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => base44.entities.Note.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notebook'] });
        },
    });
}
