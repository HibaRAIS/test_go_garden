import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { Map, User, ListTodo, Leaf, ArrowLeft } from 'lucide-react';
import api from '../lib/api';
import { Navbar } from '../components/Navbar';
import { LoadingSpinner } from '../components/LoadingStates';
import { ErrorMessage } from '../components/ErrorMessage';

export function ParcellesPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['plots'],
    queryFn: async () => {
      const response = await api.parcelles.get('/api/plots');
      return response.data;
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Toutes les Parcelles</h1>
        
        {isLoading && <LoadingSpinner />}
        {error && <ErrorMessage message={error.message} />}
        
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map((plot) => (
              <Link key={plot.id} to={`/parcelles/${plot.id}`} className="card hover:shadow-lg">
                <h3 className="text-lg font-semibold mb-2">{plot.name}</h3>
                <p className="text-sm text-gray-600">{plot.location_ref}</p>
                <p className="text-sm text-gray-500 mt-2">{plot.size_sqm} m²</p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export function ParcelleDetailPage() {
  const { id } = useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ['plot-details', id],
    queryFn: async () => {
      const response = await api.parcelles.get(`/api/plots/${id}/details`);
      return response.data;
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Link to="/parcelles" className="inline-flex items-center text-primary-600 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour aux parcelles
        </Link>

        {isLoading && <LoadingSpinner />}
        {error && <ErrorMessage message={error.message} />}

        {data && (
          <div className="space-y-6">
            <div className="card">
              <h1 className="text-2xl font-bold mb-4">{data.plot.name}</h1>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Emplacement</p>
                  <p className="font-medium">{data.plot.location_ref || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Superficie</p>
                  <p className="font-medium">{data.plot.size_sqm} m²</p>
                </div>
              </div>
            </div>

            {data.owner && (
              <div className="card">
                <h2 className="font-semibold mb-2 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Propriétaire
                </h2>
                <p className="text-gray-700">{data.owner.name}</p>
                <p className="text-sm text-gray-500">{data.owner.email}</p>
              </div>
            )}

            {data.plant_info && (
              <div className="card">
                <h2 className="font-semibold mb-2 flex items-center">
                  <Leaf className="w-5 h-5 mr-2" />
                  Plante Cultivée
                </h2>
                <p className="font-medium">{data.plant_info.name}</p>
                <p className="text-sm text-gray-600">{data.plant_info.scientific_name}</p>
              </div>
            )}

            <div className="card">
              <h2 className="font-semibold mb-4 flex items-center">
                <ListTodo className="w-5 h-5 mr-2" />
                Tâches ({data.tasks?.length || 0})
              </h2>
              {data.tasks?.length > 0 ? (
                <div className="space-y-2">
                  {data.tasks.map((task) => (
                    <div key={task.id} className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium">{task.title}</p>
                      {task.description && <p className="text-sm text-gray-600">{task.description}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Aucune tâche</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
