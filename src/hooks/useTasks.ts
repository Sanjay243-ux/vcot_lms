import { useMemo } from 'react';

import { useLmsContext } from '@/context/LmsContext';
import type { Task, TaskFilter } from '@/types/database';

export function useTasks(filter: TaskFilter = 'all', searchQuery = '') {
  const {
    tasks,
    dashboard,
    isLoadingData,
    dataError,
    refreshAll,
    createTask,
    setTaskStatus,
  } = useLmsContext();

  const filteredTasks = useMemo<Task[]>(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesStatus = filter === 'all' ? true : task.status === filter;
      if (!matchesStatus) return false;

      if (!normalizedQuery) return true;

      return (
        task.title.toLowerCase().includes(normalizedQuery) ||
        task.course_name.toLowerCase().includes(normalizedQuery) ||
        task.description.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [tasks, filter, searchQuery]);

  const counts = useMemo(
    () => ({
      all: tasks.length,
      pending: tasks.filter((t) => t.status === 'pending').length,
      completed: tasks.filter((t) => t.status === 'completed').length,
    }),
    [tasks]
  );

  const getTaskById = (id: string): Task | undefined =>
    tasks.find((task) => task.id === id);

  return {
    tasks,
    filteredTasks,
    counts,
    dashboard,
    isLoadingData,
    dataError,
    refreshAll,
    createTask,
    setTaskStatus,
    getTaskById,
  };
}

