'use client';

import { CompareTask } from '@/shared/types/compare';

import { ModelCard } from './model-card';

interface ComparisonGridProps {
  tasks: CompareTask[];
  selectedTaskId: string | null;
  onSelect: (taskId: string) => void;
  isLoading: boolean;
}

export function ComparisonGrid({
  tasks,
  selectedTaskId,
  onSelect,
  isLoading,
}: ComparisonGridProps) {
  if (tasks.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {tasks.map((task) => (
        <ModelCard
          key={task.id}
          task={task}
          isSelected={selectedTaskId === task.id}
          onSelect={() => onSelect(task.id)}
          disabled={isLoading}
        />
      ))}
    </div>
  );
}
