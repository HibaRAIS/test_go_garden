import { Calendar, User, Droplet, Scissors, ShoppingBasket, Sprout, MoreHorizontal } from 'lucide-react';
import { Task } from '../lib/mock-data';
import { Badge } from './ui/badge';

interface TaskCardProps {
  task: Task;
  onStatusChange?: (taskId: string, newStatus: Task['status']) => void;
}

const taskIcons = {
  watering: Droplet,
  weeding: Scissors,
  harvest: ShoppingBasket,
  planting: Sprout,
  other: MoreHorizontal,
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
};

const statusLabels = {
  pending: 'À faire',
  'in-progress': 'En cours',
  completed: 'Terminée',
};

export function TaskCard({ task, onStatusChange }: TaskCardProps) {
  const Icon = taskIcons[task.type];
  
  return (
    <div className="bg-white rounded-xl p-4 border border-[#E0E0E0] hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="p-2 rounded-lg bg-[#4CAF50]/10">
            <Icon className="h-5 w-5 text-[#4CAF50]" />
          </div>
          <div className="flex-1">
            <h4 className="text-gray-900 mb-1">{task.title}</h4>
            {task.description && (
              <p className="text-xs text-gray-600 mb-2">{task.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{new Date(task.date).toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{task.assignedTo}</span>
              </div>
            </div>
          </div>
        </div>
        <Badge className={statusColors[task.status]}>
          {statusLabels[task.status]}
        </Badge>
      </div>
      
      {task.status !== 'completed' && onStatusChange && (
        <button
          onClick={() => onStatusChange(task.id, task.status === 'pending' ? 'in-progress' : 'completed')}
          className="w-full mt-2 py-2 px-4 rounded-lg bg-[#4CAF50] text-white hover:bg-[#2E7D32] transition-colors"
        >
          {task.status === 'pending' ? 'Commencer' : 'Terminer'}
        </button>
      )}
    </div>
  );
}
