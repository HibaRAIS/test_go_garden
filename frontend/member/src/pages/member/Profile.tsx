import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Award,
  Edit2,
  LogOut,
  MapPin,
  CheckSquare,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { useAuth } from "../../contexts/AuthContext";
import { apiService, Member } from "../../services/membreApi";
import { Link } from "react-router-dom";

// API URLs
const PLOTS_API_URL = import.meta.env.VITE_PARCELLES_API_URL || "http://localhost:8002/api";
const TASKS_API_URL = import.meta.env.VITE_TACHES_API_URL || "http://localhost:8003/api";
const CATALOGUE_API_URL = import.meta.env.VITE_CATALOGUE_API_URL || "http://localhost:8004/api";

interface Comment {
  id: string;
  text: string;
  plant_id: string;
  plant_name?: string;
  author_id: string;
  created_at: string;
}

interface Plot {
  id: string;
  name: string;
  location_ref?: string;
  size_sqm?: number;
  surface?: number;
  current_plant_id?: string;
  member_id?: string;
  occupantid?: string;
  image?: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  due_date?: string;
  type?: string;
}

export function Profile() {
  const { user, logout } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<Member | null>(null);
  const [userPlots, setUserPlots] = useState<Plot[]>([]);
  const [userTasks, setUserTasks] = useState<Task[]>([]);
  const [userComments, setUserComments] = useState<Comment[]>([]);

  useEffect(() => {
    loadUserProfile();
    loadUserData();
  }, []);

  async function loadUserProfile() {
    try {
      const profile = await apiService.getCurrentUser();
      setUserData(profile);
    } catch (error) {
      console.error("Error loading user profile:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadUserData() {
    try {
      const savedUser = localStorage.getItem("user");
      if (!savedUser) return;
      
      const currentUser = JSON.parse(savedUser);
      
      // Load plots assigned to current user
      const plotsResponse = await fetch(`${PLOTS_API_URL}/plots`);
      if (plotsResponse.ok) {
        const allPlots = await plotsResponse.json();
        // Check both member_id and occupantid for compatibility
        const myPlots = allPlots.filter((p: Plot) => 
          p.member_id === currentUser.id || p.occupantid === currentUser.id
        );
        setUserPlots(myPlots);
      }

      // Load tasks assigned to current user
      const tasksResponse = await fetch(`${TASKS_API_URL}/tasks?assigned_to=${currentUser.id}`);
      if (tasksResponse.ok) {
        const tasks = await tasksResponse.json();
        setUserTasks(tasks);
      } else {
        // If filter doesn't work, get all tasks
        const allTasksResponse = await fetch(`${TASKS_API_URL}/tasks`);
        if (allTasksResponse.ok) {
          const allTasks = await allTasksResponse.json();
          setUserTasks(allTasks.slice(0, 5)); // Show first 5 tasks
        }
      }
      
      // Load user's comments
      const commentsResponse = await fetch(`${CATALOGUE_API_URL}/comments?author_id=${currentUser.id}`);
      if (commentsResponse.ok) {
        const comments = await commentsResponse.json();
        // Fetch plant names for comments
        const plantsResponse = await fetch(`${CATALOGUE_API_URL}/plants`);
        if (plantsResponse.ok) {
          const plants = await plantsResponse.json();
          const plantMap: { [key: string]: string } = {};
          plants.forEach((p: { id: string; name: string }) => {
            plantMap[p.id] = p.name;
          });
          const commentsWithPlantNames = comments.map((c: Comment) => ({
            ...c,
            plant_name: plantMap[c.plant_id] || 'Plante inconnue'
          }));
          setUserComments(commentsWithPlantNames);
        } else {
          setUserComments(comments);
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  }

  async function handleSignOut() {
    try {
      await logout();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#4CAF50] border-t-transparent"></div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-gray-500">Erreur lors du chargement du profil</p>
        </div>
      </div>
    );
  }

  const displayName = `${userData.first_name} ${userData.last_name}`.trim();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
        <p className="text-gray-600 mt-1">
          Gérez vos informations personnelles
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="w-30 h-30 bg-gradient-to-br from-[#4CAF50] to-[#81C784] rounded-2xl flex items-center justify-center flex-shrink-0">
            <User size={140} className="text-white" />
          </div>

          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {displayName}
            </h2>
            <div className="flex items-center gap-2 mb-6">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  userData.role === "admin"
                    ? "bg-purple-100 text-purple-800"
                    : "bg-[#4CAF50]/10 text-[#4CAF50]"
                }`}
              >
                {userData.role === "admin" ? "Administrateur" : "Membre"}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => setShowEditModal(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4CAF50] hover:bg-[#2E7D32]"
              >
                <Edit2 size={18} />
                Modifier mes infos
              </Button>
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="inline-flex items-center justify-center gap-2 rounded-xl"
              >
                <LogOut size={18} />
                Se déconnecter
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Informations personnelles
          </h3>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#4CAF50]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <User className="text-[#4CAF50]" size={20} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">
                  Nom complet
                </p>
                <p className="text-gray-900 font-medium mt-1">{displayName}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">
                  Email
                </p>
                <p className="text-gray-900 font-medium mt-1">
                  {userData.email}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Phone className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">
                  Téléphone
                </p>
                <p className="text-gray-900 font-medium mt-1">
                  {userData.phone || "Non renseigné"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Calendar className="text-orange-600" size={20} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">
                  Date d'inscription
                </p>
                <p className="text-gray-900 font-medium mt-1">
                  {new Date(userData.join_date).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            {userData.skills && (
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Award className="text-purple-600" size={20} />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">
                    Compétences
                  </p>
                  <p className="text-gray-900 font-medium mt-1">
                    {userData.skills}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mes Commentaires */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <MessageCircle className="text-purple-600" size={20} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Mes Commentaires
              </h3>
            </div>
            <Link
              to="/member/gallery"
              className="flex items-center gap-1 text-[#4CAF50] hover:text-[#2E7D32] transition-colors"
            >
              <span className="text-sm">Voir la galerie</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {userComments.length > 0 ? (
            <div className="space-y-3">
              {userComments.slice(0, 5).map((comment) => (
                <div
                  key={comment.id}
                  className="border border-gray-200 rounded-xl p-4 hover:border-purple-300 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm font-medium text-purple-600">
                      {comment.plant_name}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(comment.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{comment.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-gray-600 mb-4">
                Vous n'avez pas encore laissé de commentaires.
              </p>
              <Link
                to="/member/gallery"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#4CAF50] text-white rounded-lg hover:bg-[#2E7D32] transition-colors"
              >
                <span>Découvrir les plantes</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Section Mes Parcelles */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#4CAF50]/10 rounded-xl flex items-center justify-center">
              <MapPin className="text-[#4CAF50]" size={20} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">
              Mes Parcelles
            </h3>
          </div>
          <Link
            to="/tasks"
            className="flex items-center gap-1 text-[#4CAF50] hover:text-[#2E7D32] transition-colors"
          >
            <span className="text-sm">Voir tout</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {userPlots.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {userPlots.map((plot) => (
              <div
                key={plot.id}
                className="border border-gray-200 rounded-xl p-4 hover:border-[#4CAF50] hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{plot.name}</h4>
                  <span
                    className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      plot.member_id || plot.occupantid
                        ? "bg-[#4CAF50]/10 text-[#4CAF50]"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {plot.member_id || plot.occupantid ? "Occupée" : "Libre"}
                  </span>
                </div>

                <div className="text-xs text-gray-500 space-y-1">
                  {(plot.size_sqm || plot.surface) && <p>Surface: {plot.size_sqm || plot.surface} m²</p>}
                  {plot.location_ref && <p>Sol: {plot.location_ref}</p>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Aucune parcelle assignée</p>
          </div>
        )}
      </div>

      {/* Section Mes Tâches */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <CheckSquare className="text-blue-600" size={20} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Mes Tâches</h3>
          </div>
          <Link
            to="/tasks"
            className="flex items-center gap-1 text-[#4CAF50] hover:text-[#2E7D32] transition-colors"
          >
            <span className="text-sm">Voir tout</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {userTasks.length > 0 ? (
          <div className="space-y-3">
            {userTasks.map((task) => (
              <div
                key={task.id}
                className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:bg-blue-50 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{task.title}</h4>
                  <span
                    className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      task.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : task.status === "in-progress"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-orange-100 text-orange-800"
                    }`}
                  >
                    {task.status === "completed"
                      ? "Complétée"
                      : task.status === "in-progress"
                      ? "En cours"
                      : "En attente"}
                  </span>
                </div>

                {task.description && (
                  <p className="text-sm text-gray-600 mb-2">
                    {task.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500">
                  {task.due_date && (
                    <span>
                      Échéance:{" "}
                      {new Date(task.due_date).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </span>
                  )}
                  {task.type && (
                    <span className="text-gray-600 capitalize">
                      {task.type}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Aucune tâche assignée</p>
          </div>
        )}
      </div>

      {showEditModal && (
        <EditProfileModal
          userData={userData}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            loadUserProfile();
          }}
        />
      )}
    </div>
  );
}

function EditProfileModal({
  userData,
  onClose,
  onSuccess,
}: {
  userData: Member;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    first_name: userData.first_name,
    last_name: userData.last_name,
    phone: userData.phone || "",
    skills: userData.skills || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await apiService.updateMember(userData.id, formData);
      onSuccess();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setError(error.message || "Erreur lors de la modification du profil");
    } finally {
      setLoading(false);
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-6">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Modifier mes informations
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prénom *
              </label>
              <Input
                type="text"
                value={formData.first_name}
                onChange={(e) =>
                  handleInputChange("first_name", e.target.value)
                }
                className="rounded-xl"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom *
              </label>
              <Input
                type="text"
                value={formData.last_name}
                onChange={(e) => handleInputChange("last_name", e.target.value)}
                className="rounded-xl"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Téléphone
            </label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              className="rounded-xl"
              placeholder="0123456789"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Compétences
            </label>
            <textarea
              value={formData.skills}
              onChange={(e) => handleInputChange("skills", e.target.value)}
              rows={3}
              placeholder="Décrivez vos compétences en jardinage..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent resize-none"
            />
          </div>

          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-xl py-3 text-base"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-[#4CAF50] hover:bg-[#2E7D32] py-3 text-base"
            >
              {loading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
