import { Calendar, User, Droplet, Scissors, ShoppingBasket, Sprout, MoreHorizontal } from 'lucide-react';
import { Task } from '../services/tasksApi';
import { Badge } from './ui/badge';

interface TaskCardProps {
  task: Task;
  onStatusChange?: (taskId: string, newStatus: Task['status']) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

const taskIcons = {
  watering: Droplet,
  weeding: Scissors,
  harvest: ShoppingBasket,
  planting: Sprout,
  other: MoreHorizontal,
};

// Couleurs par type de tâche
const taskTypeColors = {
  watering: { bg: 'bg-blue-100', text: 'text-blue-600', icon: 'text-blue-500' },
  weeding: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: 'text-yellow-600' },
  harvest: { bg: 'bg-orange-100', text: 'text-orange-600', icon: 'text-orange-500' },
  planting: { bg: 'bg-green-100', text: 'text-green-600', icon: 'text-green-500' },
  other: { bg: 'bg-purple-100', text: 'text-purple-600', icon: 'text-purple-500' },
};

const taskTypeLabels = {
  watering: 'Arrosage',
  weeding: 'Désherbage',
  harvest: 'Récolte',
  planting: 'Plantation',
  other: 'Autre',
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

export function TaskCard({ task, onStatusChange, onEdit, onDelete }: TaskCardProps) {
  const Icon = taskIcons[task.type];
  const typeColor = taskTypeColors[task.type] || taskTypeColors.other;
  
  return (
    <div className="bg-white rounded-xl p-4 border border-[#E0E0E0] hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          <div className={`p-2 rounded-lg ${typeColor.bg}`}>
            <Icon className={`h-5 w-5 ${typeColor.icon}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-gray-900">{task.title}</h4>
              <span className={`text-xs px-2 py-0.5 rounded-full ${typeColor.bg} ${typeColor.text}`}>
                {taskTypeLabels[task.type]}
              </span>
            </div>
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

      {(onEdit || onDelete) && (
        <div className="flex gap-2 mt-2">
          {onEdit && (
            <button
              onClick={() => onEdit(task)}
              className="flex-1 py-2 px-3 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Modifier
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(task.id)}
              className="flex-1 py-2 px-3 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 transition-colors"
            >
              Supprimer
            </button>
          )}
        </div>
      )}
    </div>
  );
}
