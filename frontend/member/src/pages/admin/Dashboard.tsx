import {
  MapPin,
  Users,
  CheckSquare,
  Leaf,
  Calendar as CalendarIcon,
  ArrowRight,
} from "lucide-react";
import { StatCard } from "../../components/StatCard";
import { TaskCard } from "../../components/TaskCard";
import { currentUser, plots, tasks, users } from "../../lib/mock-data";
import { Link } from "react-router-dom";

export function Dashboard() {
  const occupiedPlots = plots.filter((p) => p.status === "occupied").length;
  const pendingTasks = tasks.filter(
    (t) => t.status === "pending" || t.status === "in-progress"
  ).length;
  const upcomingTasks = tasks
    .filter((t) => t.status !== "completed")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-[#4CAF50] to-[#81C784] rounded-2xl p-8 text-white">
        <h1 className="text-3xl text-white mb-2">
          Bonjour {currentUser.name.split(" ")[0]} 🌞
        </h1>
        <p className="text-white/90">Bienvenue dans votre jardin partagé</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Parcelles occupées"
          value={occupiedPlots}
          icon={MapPin}
          bgColor="bg-green-100"
          iconColor="text-[#4CAF50]"
        />
        <StatCard
          title="Membres actifs"
          value={users.length}
          icon={Users}
          bgColor="bg-blue-100"
          iconColor="text-blue-500"
        />
        <StatCard
          title="Tâches à venir"
          value={pendingTasks}
          icon={CheckSquare}
          bgColor="bg-yellow-100"
          iconColor="text-yellow-500"
        />
        <StatCard
          title="Plantes suivies"
          value={plots.filter((p) => p.currentPlant).length}
          icon={Leaf}
          bgColor="bg-purple-100"
          iconColor="text-purple-500"
        />
      </div>

      {/* Upcoming Tasks Section */}
      <div className="bg-white rounded-2xl p-6 border border-[#E0E0E0]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-[#4CAF50]" />
            <h2 className="text-xl text-gray-900">Prochaines tâches</h2>
          </div>
          <Link
            to="/tasks"
            className="flex items-center gap-1 text-[#4CAF50] hover:text-[#2E7D32] transition-colors"
          >
            <span className="text-sm">Voir tout</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcomingTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>

        {upcomingTasks.length === 0 && (
          <div className="text-center py-12">
            <CheckSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Aucune tâche à venir</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/plots"
          className="bg-white rounded-xl p-6 border border-[#E0E0E0] hover:shadow-lg transition-all group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-900 mb-1">Gérer les parcelles</h3>
              <p className="text-xs text-gray-600">Voir toutes les parcelles</p>
            </div>
            <MapPin className="h-8 w-8 text-[#4CAF50] group-hover:scale-110 transition-transform" />
          </div>
        </Link>

        <Link
          to="/plants"
          className="bg-white rounded-xl p-6 border border-[#E0E0E0] hover:shadow-lg transition-all group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-900 mb-1">Catalogue plantes</h3>
              <p className="text-xs text-gray-600">Découvrir les plantes</p>
            </div>
            <Leaf className="h-8 w-8 text-[#4CAF50] group-hover:scale-110 transition-transform" />
          </div>
        </Link>

        <Link
          to="/gallery"
          className="bg-white rounded-xl p-6 border border-[#E0E0E0] hover:shadow-lg transition-all group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-900 mb-1">Galerie photos</h3>
              <p className="text-xs text-gray-600">Voir les dernières photos</p>
            </div>
            <CalendarIcon className="h-8 w-8 text-[#4CAF50] group-hover:scale-110 transition-transform" />
          </div>
        </Link>
      </div>
    </div>
  );
}
