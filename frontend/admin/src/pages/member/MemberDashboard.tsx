import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { CheckSquare, MapPin, Clock, MessageSquare, Leaf } from "lucide-react";
import { tasksApi } from "../../services/tasksApi";
import { plotService } from "../../services/plotService";

export function MemberDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    plotsCount: 0,
    pendingTasks: 0,
    upcomingTasks: 0,
    commentsCount: 0 
  });
  
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch plots for this member
        const plots = await plotService.getAll();
        
        // Fetch tasks for this member
        const tasks = await tasksApi.getAll(user.id.toString());
        
        // Calculate stats
        const pending = tasks.filter(t => t.status === 'pending' || t.status === 'in-progress').length;
        const upcoming = tasks.filter(t => t.status !== 'completed').length;
        
        setStats({
          plotsCount: plots.length,
          pendingTasks: pending,
          upcomingTasks: upcoming,
          commentsCount: 0 // Placeholder
        });
        
        // Format recent activities from tasks
        const activities = tasks
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 5)
          .map(task => ({
            title: task.title,
            date: new Date(task.date).toLocaleDateString(),
            status: task.status,
            type: "Tâche",
            color: task.status === 'completed' ? "text-green-600" : "text-orange-600"
          }));
          
        setRecentActivities(activities);
        
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return <div className="p-8 text-center">Chargement...</div>;
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* HEADER & BIENVENUE SIMPLIFIÉ */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xl border border-gray-100">
          <div className="flex flex-col">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-1">
              Bienvenue dans votre jardin, {user?.first_name}
            </h1>
            <p className="text-xl font-medium text-gray-600">
              Gérez vos parcelles et participez à la communauté.
            </p>
            <span className="inline-flex items-center mt-3 px-3 py-1 bg-[#F1FFF0] text-[#2E7D32] rounded-full text-sm font-semibold">
              <Leaf className="h-4 w-4 mr-1" />
              Connecté en tant que Membre
            </span>
          </div>
        </div>

        {/* STATISTIQUES */}
        <div className="mt-8 pt-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <CardStat
            title="Parcelles Attribuées"
            value={stats.plotsCount.toString()}
            icon={MapPin}
            color="text-emerald-600"
          />
          <CardStat
            title="Tâches en Retard"
            value="0"
            icon={Clock}
            color="text-red-600"
          />
          <CardStat
            title="Tâches à Faire"
            value={stats.pendingTasks.toString()}
            icon={CheckSquare}
            color="text-orange-600"
          />
          <CardStat
            title="Total Commentaires"
            value={stats.commentsCount.toString()}
            icon={MessageSquare}
            color="text-blue-600"
          />
        </div>

        {/* ACTIVITÉS RÉCENTES AGRÉGÉES (Fil d'activité) */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-gray-500" />
            Tâches et Actions Récentes
          </h3>
          <div className="space-y-3">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-gray-50 transition-colors`}
                >
                  <div>
                    <p className="font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {activity.date} - {activity.type}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 text-sm font-semibold rounded-full ${activity.color} bg-opacity-10 border border-current`}
                  >
                    {activity.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">Aucune activité récente.</p>
            )}
            
            <button
              onClick={() => navigate("/member/tasks")}
              className="w-full text-center text-sm font-medium text-[#2E7D32] hover:text-[#4CAF50] transition-colors pt-2"
            >
              Voir toutes les activités →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant utilitaire pour les statistiques
const CardStat = ({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  icon: any;
  color: string;
}) => (
  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex items-center justify-between">
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
    <div
      className={`w-10 h-10 rounded-full flex items-center justify-center ${color} bg-opacity-10`}
    >
      <Icon className={`h-6 w-6 ${color}`} />
    </div>
  </div>
);
