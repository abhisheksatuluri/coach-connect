import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from '../api/api';

export function useKnowledgeBase() {
    return useQuery({
        queryKey: ['knowledgeBase'],
        queryFn: () => api.entities.KnowledgeBase.list(),
    });
}

export function useArticle(id) {
    return useQuery({
        queryKey: ['knowledgeBase', id],
        queryFn: () => api.entities.KnowledgeBase.get(id),
        enabled: !!id,
    });
}

export function useCreateArticle() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => api.entities.KnowledgeBase.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['knowledgeBase'] });
        },
    });
}

export function useUpdateArticle() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => api.entities.KnowledgeBase.update(id, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['knowledgeBase'] });
            queryClient.invalidateQueries({ queryKey: ['knowledgeBase', variables.id] });
        },
    });
}

export function useDeleteArticle() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => api.entities.KnowledgeBase.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['knowledgeBase'] });
        },
    });
}
