import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from '../api/api';

export function useTasks() {
    return useQuery({
        queryKey: ['tasks'],
        queryFn: () => api.entities.Task.list(),
    });
}

export function useTask(id) {
    return useQuery({
        queryKey: ['tasks', id],
        queryFn: () => api.entities.Task.get(id),
        enabled: !!id,
    });
}

export function useCreateTask() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => api.entities.Task.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
    });
}

export function useUpdateTask() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => api.entities.Task.update(id, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            queryClient.invalidateQueries({ queryKey: ['tasks', variables.id] });
        },
    });
}

export function useDeleteTask() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => api.entities.Task.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
    });
}
