import { useQuery } from '@tanstack/react-query';
import { Map, ListTodo, MessageSquare, Leaf } from 'lucide-react';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { Navbar } from '../components/Navbar';
import { LoadingSpinner, CardSkeleton } from '../components/LoadingStates';
import { ErrorMessage } from '../components/ErrorMessage';

export function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard', user?.id],
    queryFn: async () => {
      const response = await api.membres.get(`/api/profile/dashboard/${user.id}`);
      return response.data;
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Bienvenue, {user?.name} 👋
          </h1>
          <p className="text-gray-600 mt-2">Voici un aperçu de votre activité</p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && <ErrorMessage message={error.message} onRetry={refetch} />}

        {/* Success State */}
        {data && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                icon={Map}
                label="Mes Parcelles"
                value={data._metadata?.plots_count || 0}
                color="blue"
              />
              <StatCard
                icon={ListTodo}
                label="Tâches Assignées"
                value={data._metadata?.tasks_count || 0}
                color="green"
              />
              <StatCard
                icon={MessageSquare}
                label="Commentaires"
                value={data._metadata?.comments_count || 0}
                color="purple"
              />
            </div>

            {/* Mes Parcelles */}
            <Section title="Mes Parcelles" icon={Map}>
              {data.plots?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.plots.map((plot) => (
                    <PlotCard key={plot.id} plot={plot} />
                  ))}
                </div>
              ) : (
                <EmptyState message="Aucune parcelle pour le moment" />
              )}
            </Section>

            {/* Mes Tâches */}
            <Section title="Mes Tâches" icon={ListTodo}>
              {data.tasks?.length > 0 ? (
                <div className="space-y-3">
                  {data.tasks.slice(0, 5).map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              ) : (
                <EmptyState message="Aucune tâche assignée" />
              )}
            </Section>

            {/* Mes Commentaires */}
            <Section title="Mes Derniers Commentaires" icon={MessageSquare}>
              {data.comments?.length > 0 ? (
                <div className="space-y-3">
                  {data.comments.slice(0, 5).map((comment) => (
                    <CommentCard key={comment.id} comment={comment} />
                  ))}
                </div>
              ) : (
                <EmptyState message="Aucun commentaire pour le moment" />
              )}
            </Section>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <div>
      <div className="flex items-center space-x-2 mb-4">
        <Icon className="w-5 h-5 text-gray-700" />
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function PlotCard({ plot }) {
  return (
    <div className="card hover:shadow-lg transition-shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{plot.name}</h3>
      <p className="text-sm text-gray-600 mb-2">{plot.location_ref || 'Emplacement non spécifié'}</p>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">{plot.size_sqm} m²</span>
        {plot.current_plant_id && (
          <span className="flex items-center text-primary-600">
            <Leaf className="w-4 h-4 mr-1" />
            Cultivée
          </span>
        )}
      </div>
    </div>
  );
}

function TaskCard({ task }) {
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-medium text-gray-900">{task.title}</h4>
          {task.description && (
            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
          )}
        </div>
        {task.due_date && (
          <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
            {new Date(task.due_date).toLocaleDateString('fr-FR')}
          </span>
        )}
      </div>
    </div>
  );
}

function CommentCard({ comment }) {
  return (
    <div className="card">
      <p className="text-gray-700">{comment.text}</p>
      <p className="text-xs text-gray-500 mt-2">
        {new Date(comment.created_at).toLocaleDateString('fr-FR')}
      </p>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="text-center py-12 bg-gray-100 rounded-xl">
      <p className="text-gray-500">{message}</p>
    </div>
  );
}
