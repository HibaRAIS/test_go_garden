import { useQuery } from '@tanstack/react-query';
import { ListTodo } from 'lucide-react';
import api from '../lib/api';
import { Navbar } from '../components/Navbar';
import { LoadingSpinner } from '../components/LoadingStates';
import { ErrorMessage } from '../components/ErrorMessage';

export function TachesPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const response = await api.taches.get('/api/tasks');
      return response.data;
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 flex items-center">
          <ListTodo className="w-8 h-8 mr-3 text-primary-600" />
          Toutes les Tâches
        </h1>

        {isLoading && <LoadingSpinner />}
        {error && <ErrorMessage message={error.message} />}

        {data && (
          <div className="space-y-3">
            {data.length > 0 ? (
              data.map((task) => (
                <div key={task.id} className="card">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{task.title}</h3>
                      {task.description && (
                        <p className="text-gray-600 mt-1">{task.description}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                        {task.due_date && (
                          <span>📅 {new Date(task.due_date).toLocaleDateString('fr-FR')}</span>
                        )}
                        {task.plot_id && <span>📍 Parcelle associée</span>}
                        {task.plant_id && <span>🌱 Plante associée</span>}
                      </div>
                    </div>
                    {task.due_date && (
                      <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm">
                        {new Date(task.due_date).toLocaleDateString('fr-FR', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-gray-100 rounded-xl">
                <p className="text-gray-500">Aucune tâche pour le moment</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
