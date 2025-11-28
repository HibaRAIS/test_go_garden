import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { BookOpen, ArrowLeft, MessageSquare, Map, ListTodo } from 'lucide-react';
import api from '../lib/api';
import { Navbar } from '../components/Navbar';
import { LoadingSpinner } from '../components/LoadingStates';
import { ErrorMessage } from '../components/ErrorMessage';

export function CataloguePage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['plants'],
    queryFn: async () => {
      const response = await api.catalogue.get('/api/plants');
      return response.data;
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Catalogue des Plantes</h1>

        {isLoading && <LoadingSpinner />}
        {error && <ErrorMessage message={error.message} />}

        {data && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map((plant) => (
              <Link key={plant.id} to={`/catalogue/${plant.id}`} className="card hover:shadow-lg">
                <h3 className="text-lg font-semibold mb-1">{plant.name}</h3>
                <p className="text-sm text-gray-600 italic mb-2">{plant.scientific_name}</p>
                <p className="text-sm text-gray-700 line-clamp-2">{plant.description}</p>
                <p className="text-xs text-primary-600 mt-2">🌱 {plant.planting_season}</p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export function PlantDetailPage() {
  const { id } = useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ['plant-report', id],
    queryFn: async () => {
      const response = await api.catalogue.get(`/api/plants/${id}/report`);
      return response.data;
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Link to="/catalogue" className="inline-flex items-center text-primary-600 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour au catalogue
        </Link>

        {isLoading && <LoadingSpinner />}
        {error && <ErrorMessage message={error.message} />}

        {data && (
          <div className="space-y-6">
            <div className="card">
              <h1 className="text-3xl font-bold mb-2">{data.plant.name}</h1>
              <p className="text-gray-600 italic mb-4">{data.plant.scientific_name}</p>
              <p className="text-gray-700 mb-4">{data.plant.description}</p>
              <div className="inline-block bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm">
                🌱 {data.plant.planting_season}
              </div>
            </div>

            <div className="card">
              <h2 className="font-semibold mb-4 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Commentaires ({data.comments?.length || 0})
              </h2>
              {data.comments?.length > 0 ? (
                <div className="space-y-3">
                  {data.comments.map((comment) => (
                    <div key={comment.id} className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-700 mb-2">{comment.text}</p>
                      <p className="text-xs text-gray-500">
                        Par {comment.author_name} • {new Date(comment.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Aucun commentaire</p>
              )}
            </div>

            <div className="card">
              <h2 className="font-semibold mb-4 flex items-center">
                <Map className="w-5 h-5 mr-2" />
                Parcelles Cultivant cette Plante ({data.plots_cultivating?.length || 0})
              </h2>
              {data.plots_cultivating?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {data.plots_cultivating.map((plot) => (
                    <div key={plot.id} className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium">{plot.name}</p>
                      <p className="text-sm text-gray-600">{plot.size_sqm} m²</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Non cultivée actuellement</p>
              )}
            </div>

            <div className="card">
              <h2 className="font-semibold mb-4 flex items-center">
                <ListTodo className="w-5 h-5 mr-2" />
                Tâches Associées ({data.related_tasks?.length || 0})
              </h2>
              {data.related_tasks?.length > 0 ? (
                <div className="space-y-2">
                  {data.related_tasks.map((task) => (
                    <div key={task.id} className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium">{task.title}</p>
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
