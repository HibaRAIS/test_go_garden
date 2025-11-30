import { useAuth } from "../../contexts/AuthContext";
// import { Button } from "../../components/ui/button"; // Suppression : Plus besoin du composant Button
import { useNavigate } from "react-router-dom";
import {
  TreePine,
  User,
  Sprout,
  CheckSquare,
  MapPin,
  Clock,
  MessageSquare,
  Leaf,
  Calendar,
} from "lucide-react";

// Les données menuItems ne sont plus utilisées dans le JSX, mais on les garde pour référence.
const menuItems = [
  {
    title: "Mes Tâches",
    description: "Voir et compléter mes tâches d'entretien.",
    icon: CheckSquare,
    path: "/member/tasks",
    color: "text-orange-600",
  },
  {
    title: "Mes Parcelles",
    description: "Gérer mes parcelles attribuées et leur état.",
    icon: TreePine,
    path: "/member/plots",
    color: "text-emerald-600",
  },
  {
    title: "Catalogue",
    description: "Explorer les plantes et poster des commentaires.",
    icon: Sprout,
    path: "/member/gallery",
    color: "text-green-600",
  },
  {
    title: "Mon Profil",
    description: "Modifier mes infos personnelles et compétences.",
    icon: User,
    path: "/member/profile",
    color: "text-blue-600",
  },
];

// Données d'activité simulées
const recentActivities = [
  {
    title: "Arrosage parcelle B2",
    date: "Aujourd'hui, 14:00",
    status: "Terminé",
    type: "Tâche",
    color: "text-green-600",
  },
  {
    title: "Récolte tomates",
    date: "Demain, 10:00",
    status: "Planifié",
    type: "Tâche",
    color: "text-orange-600",
  },
  {
    title: "Avis sur les salades",
    date: "Hier, 16:00",
    status: "Nouveau",
    type: "Commentaire",
    color: "text-blue-600",
  },
];

export function MemberDashboard() {
  const { user, logout } = useAuth(); // 'logout' n'est plus utilisé mais conservé par sécurité
  const navigate = useNavigate();

  // La fonction de déconnexion est conservée au cas où elle est appelée ailleurs
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* HEADER & BIENVENUE SIMPLIFIÉ */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xl border border-gray-100">
          <div className="flex flex-col">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-1">
              Bienvenue dans votre jardin
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
            value="2"
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
            value="1"
            icon={CheckSquare}
            color="text-orange-600"
          />
          <CardStat
            title="Total Commentaires"
            value="12"
            icon={MessageSquare}
            color="text-blue-600"
          />
        </div>

        {/* NAVIGATION GRID (SUPPRIMÉ) */}
        {/* L'ancienne grille de navigation a été retirée ici. */}

        {/* ACTIVITÉS RÉCENTES AGRÉGÉES (Fil d'activité) */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-gray-500" />
            Tâches et Actions Récentes
          </h3>
          <div className="space-y-3">
            {recentActivities.map((activity, index) => (
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
                {/* L'utilisation de `border-current` garantit que la bordure prend la couleur du texte */}
                <span
                  className={`px-3 py-1 text-sm font-semibold rounded-full ${activity.color} bg-opacity-10 border border-current`}
                >
                  {activity.status}
                </span>
              </div>
            ))}
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
