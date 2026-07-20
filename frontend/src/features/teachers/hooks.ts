import { useQuery } from '@tanstack/react-query';
import { teachersApi, type TeacherListParams } from './api';

export const teacherKeys = {
  all: ['teachers'] as const,
  list: (params: TeacherListParams) => ['teachers', 'list', params] as const,
  detail: (id: number) => ['teachers', 'detail', id] as const,
  slots: (id: number) => ['teachers', 'slots', id] as const,
};

export function useTeachers(params: TeacherListParams) {
  return useQuery({
    queryKey: teacherKeys.list(params),
    queryFn: () => teachersApi.list(params),
  });
}

export function useTeacher(id: number) {
  return useQuery({
    queryKey: teacherKeys.detail(id),
    queryFn: () => teachersApi.detail(id),
    enabled: Number.isFinite(id) && id > 0,
  });
}

export function useTeacherSlots(id: number) {
  return useQuery({
    queryKey: teacherKeys.slots(id),
    queryFn: () => teachersApi.slots(id),
    enabled: Number.isFinite(id) && id > 0,
  });
}
