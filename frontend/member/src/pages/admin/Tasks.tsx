import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { TaskCard } from "../../components/TaskCard";
import { tasksApi, Task } from "../../services/tasksApi";
import { apiService } from "../../services/membreApi";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { useAuth } from "../../contexts/AuthContext";

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    due_date: new Date().toISOString().split("T")[0],
    type: "other",
    status: "pending",
    assigned_to: [] as string[],
  });
  const { user } = useAuth();

  useEffect(() => {
    loadTasks();
    if (user?.role === "admin") {
      loadMembers();
    }
  }, [user]);

  const loadMembers = async () => {
    if (user?.role !== "admin") return;
    try {
      const data = await apiService.getAllMembers();
      setMembers(data.members || []);
    } catch (err) {
      console.error("Failed to load members", err);
    }
  };

  const loadTasks = async () => {
    try {
      setLoading(true);
      const assignedTo = user?.role === "membre" ? String(user.id) : undefined;
      const data = await tasksApi.getAll(assignedTo);
      setTasks(data);
    } catch (err) {
      console.error("Failed to load tasks", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async () => {
    if (user?.role !== "admin") return;
    try {
      const created = await tasksApi.create({
        ...newTask,
        assigned_to: newTask.assigned_to,
      });
      setTasks([...tasks, created]);
      setIsAddOpen(false);
      setNewTask({
        title: "",
        description: "",
        due_date: new Date().toISOString().split("T")[0],
        type: "other",
        status: "pending",
        assigned_to: [],
      });
    } catch (err) {
      console.error("Failed to create task", err);
    }
  };

  const toggleMemberSelection = (memberId: string) => {
    setNewTask((prev) => ({
      ...prev,
      assigned_to: prev.assigned_to.includes(memberId)
        ? prev.assigned_to.filter((id) => id !== memberId)
        : [...prev.assigned_to, memberId],
    }));
  };

  const handleStatusChange = async (
    taskId: string,
    newStatus: Task["status"]
  ) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
    try {
      await tasksApi.update(taskId, { status: newStatus });
    } catch (err) {
      console.error("Failed to update status", err);
      loadTasks();
    }
  };

  const filterTasks = (status?: Task["status"]) => {
    const normalizedTerm = searchTerm.trim().toLowerCase();
    const baseList = normalizedTerm
      ? tasks.filter(
          (task) =>
            task.title.toLowerCase().includes(normalizedTerm) ||
            (task.description || "").toLowerCase().includes(normalizedTerm)
        )
      : tasks;

    if (!status) return baseList;
    return baseList.filter((task) => task.status === status);
  };

  const allTasks = tasks;
  const pendingTasks = filterTasks("pending");
  const inProgressTasks = filterTasks("in-progress");
  const completedTasks = filterTasks("completed");

  if (loading) {
    return <div className="p-8 text-center">Chargement des tâches...</div>;
  }

  const showCreateButton = user?.role === "admin";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl text-gray-900 mb-1">Tâches & Événements</h1>
          <p className="text-gray-600">Gérez les activités du jardin</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto sm:items-center">
          <div className="relative w-full sm:w-72">
            <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher..."
              className="pl-10 pr-3 py-2 rounded-xl border-gray-200 focus:ring-2 focus:ring-[#4CAF50]/40"
            />
          </div>
          {showCreateButton && (
            <Button
              className="rounded-xl bg-[#2E7D32] hover:bg-[#256428]"
              onClick={() => setIsAddOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle tâche
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white border border-[#E0E0E0] rounded-xl p-1">
          <TabsTrigger value="all" className="rounded-lg">
            Toutes ({allTasks.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="rounded-lg">
            À faire ({pendingTasks.length})
          </TabsTrigger>
          <TabsTrigger value="in-progress" className="rounded-lg">
            En cours ({inProgressTasks.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="rounded-lg">
            Terminées ({completedTasks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
          {pendingTasks.length === 0 && (
            <div className="bg-white rounded-xl p-12 text-center border border-[#E0E0E0]">
              <p className="text-gray-500">Aucune tâche à faire</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="in-progress" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inProgressTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
          {inProgressTasks.length === 0 && (
            <div className="bg-white rounded-xl p-12 text-center border border-[#E0E0E0]">
              <p className="text-gray-500">Aucune tâche en cours</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
          {completedTasks.length === 0 && (
            <div className="bg-white rounded-xl p-12 text-center border border-[#E0E0E0]">
              <p className="text-gray-500">Aucune tâche terminée</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Calendar Preview */}
      <div className="bg-gradient-to-br from-[#4CAF50]/10 to-[#81C784]/10 rounded-xl p-6 border border-[#4CAF50]/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-gray-900 mb-1">Vue calendrier</h3>
            <p className="text-sm text-gray-600">
              Visualisez vos tâches dans le calendrier
            </p>
          </div>
          <Button
            variant="outline"
            className="rounded-xl border-[#4CAF50] text-[#4CAF50] hover:bg-[#4CAF50] hover:text-white"
            onClick={() => (window.location.href = "/calendar")}
          >
            Ouvrir le calendrier
          </Button>
        </div>
      </div>

      {/* Légende des types de tâches */}
      <div className="bg-white rounded-xl p-4 border border-[#E0E0E0]">
        <h4 className="text-gray-900 font-medium mb-3">Légende</h4>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-blue-500" />
            <span className="text-sm text-gray-600">Arrosage</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-yellow-500" />
            <span className="text-sm text-gray-600">Désherbage</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-orange-500" />
            <span className="text-sm text-gray-600">Récolte</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-green-500" />
            <span className="text-sm text-gray-600">Plantation</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-purple-500" />
            <span className="text-sm text-gray-600">Autre</span>
          </div>
        </div>
      </div>

      {/* Add Task Dialog */}
      {showCreateButton && (
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouvelle tâche</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Titre</Label>
                <Input
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                  placeholder="Nom de la tâche"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                  placeholder="Description de la tâche"
                />
              </div>
              <div>
                <Label>Date d'échéance</Label>
                <Input
                  type="date"
                  value={newTask.due_date}
                  onChange={(e) =>
                    setNewTask({ ...newTask, due_date: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Type</Label>
                <select
                  className="w-full rounded-md border border-gray-300 p-2"
                  value={newTask.type}
                  onChange={(e) =>
                    setNewTask({ ...newTask, type: e.target.value })
                  }
                >
                  <option value="watering">Arrosage</option>
                  <option value="weeding">Désherbage</option>
                  <option value="harvest">Récolte</option>
                  <option value="planting">Plantation</option>
                  <option value="other">Autre</option>
                </select>
              </div>
              <div>
                <Label>Assigner à des membres</Label>
                <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-1">
                  {members.length === 0 ? (
                    <p className="text-sm text-gray-500 p-2">Aucun membre disponible</p>
                  ) : (
                    members.map((member) => (
                      <label
                        key={member.id}
                        className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={newTask.assigned_to.includes(member.id)}
                          onChange={() => toggleMemberSelection(member.id)}
                          className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">
                          {member.first_name} {member.last_name}
                        </span>
                        <span className="text-xs text-gray-400">({member.email})</span>
                      </label>
                    ))
                  )}
                </div>
                {newTask.assigned_to.length > 0 && (
                  <p className="text-xs text-green-600 mt-1">
                    {newTask.assigned_to.length} membre(s) sélectionné(s)
                  </p>
                )}
              </div>
              <Button
                onClick={handleAddTask}
                className="w-full rounded-xl bg-[#4CAF50] hover:bg-[#2E7D32]"
              >
                Créer la tâche
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
