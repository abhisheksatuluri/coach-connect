import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export function useKnowledgeBase() {
    return useQuery({
        queryKey: ['knowledgeBase'],
        queryFn: () => base44.entities.KnowledgeBase.list(),
    });
}

export function useArticle(id) {
    return useQuery({
        queryKey: ['knowledgeBase', id],
        queryFn: () => base44.entities.KnowledgeBase.get(id),
        enabled: !!id,
    });
}

export function useCreateArticle() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => base44.entities.KnowledgeBase.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['knowledgeBase'] });
        },
    });
}

export function useUpdateArticle() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => base44.entities.KnowledgeBase.update(id, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['knowledgeBase'] });
            queryClient.invalidateQueries({ queryKey: ['knowledgeBase', variables.id] });
        },
    });
}

export function useDeleteArticle() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => base44.entities.KnowledgeBase.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['knowledgeBase'] });
        },
    });
}
