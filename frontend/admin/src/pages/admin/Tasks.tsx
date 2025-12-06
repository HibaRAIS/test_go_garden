import { useState, useEffect } from "react";
import { Plus, Search, User } from "lucide-react";
import { TaskCard } from "../../components/TaskCard";
import { tasksApi, Task, Member } from "../../services/tasksApi";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { useAuth } from "../../contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";

export function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editTask, setEditTask] = useState<Partial<Task> | null>(null);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
    type: "other" as Task["type"],
    status: "pending" as Task["status"],
    assignedToId: "",
  });
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    loadTasks();
    loadMembers();
  }, [user]);

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

  const loadMembers = async () => {
    try {
      const data = await tasksApi.getMembers();
      setMembers(data);
    } catch (err) {
      console.error("Failed to load members", err);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: Task["status"]) => {
    // Optimistic update
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
    try {
      await tasksApi.update(taskId, { status: newStatus });
    } catch (err) {
      console.error("Failed to update status", err);
      // Revert on error
      loadTasks();
    }
  };

  const handleAddTask = async () => {
    if (!newTask.title.trim()) return;
    
    setIsSaving(true);
    try {
      const taskData = {
        ...newTask,
        assigned_to: newTask.assignedToId ? [newTask.assignedToId] : undefined
      };
      await tasksApi.create(taskData);
      await loadTasks();
      setIsAddDialogOpen(false);
      setNewTask({
        title: "",
        description: "",
        date: new Date().toISOString().split('T')[0],
        type: "other",
        status: "pending",
        assignedToId: "",
      });
    } catch (err) {
      console.error("Failed to create task", err);
      alert("Erreur lors de la création de la tâche");
    } finally {
      setIsSaving(false);
    }
  };

  const openEditDialog = (task: Task) => {
    setEditTask({
      id: task.id,
      title: task.title,
      description: task.description || "",
      date: task.date?.split('T')[0] || task.date,
      type: task.type,
      status: task.status,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateTask = async () => {
    if (!editTask?.id || !editTask.title?.trim()) return;

    setIsUpdating(true);
    try {
      await tasksApi.update(editTask.id, {
        title: editTask.title,
        description: editTask.description,
        date: editTask.date,
        type: editTask.type,
        status: editTask.status,
      });
      await loadTasks();
      setIsEditDialogOpen(false);
      setEditTask(null);
    } catch (err) {
      console.error("Failed to update task", err);
      alert("Erreur lors de la mise à jour de la tâche");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm("Supprimer cette tâche ?")) return;

    try {
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
      await tasksApi.delete(taskId);
    } catch (err) {
      console.error("Failed to delete task", err);
      alert("Erreur lors de la suppression de la tâche");
      loadTasks();
    }
  };

  const filterTasks = (status?: Task["status"]) => {
    const normalizedTerm = searchTerm.trim().toLowerCase();
    const baseList = normalizedTerm
      ? tasks.filter((task) =>
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

  const withAssignee = (task: Task) => {
    const email = members.find((m) => String(m.id) === String(task.assignedToId))?.email;
    return { ...task, assignedTo: email || "Non assignée" };
  };

  if (loading) {
    return <div className="p-8 text-center">Chargement des tâches...</div>;
  }

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
          {user?.role === "admin" && (
            <Button 
              className="rounded-xl bg-[#2E7D32] hover:bg-[#256428]"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle tâche
            </Button>
          )}
        </div>
      </div>

      {/* Add Task Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nouvelle tâche</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Ex: Arrosage des tomates"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Détails de la tâche..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date d'échéance</Label>
              <Input
                id="date"
                type="date"
                value={newTask.date}
                onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type de tâche</Label>
              <select
                id="type"
                value={newTask.type}
                onChange={(e) => setNewTask({ ...newTask, type: e.target.value as Task["type"] })}
                className="w-full rounded-md border border-gray-300 p-2"
              >
                <option value="watering">Arrosage</option>
                <option value="weeding">Désherbage</option>
                <option value="harvest">Récolte</option>
                <option value="planting">Plantation</option>
                <option value="other">Autre</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignedTo">Assigner à un membre</Label>
              <select
                id="assignedTo"
                value={newTask.assignedToId}
                onChange={(e) => setNewTask({ ...newTask, assignedToId: e.target.value })}
                className="w-full rounded-md border border-gray-300 p-2"
              >
                <option value="">-- Aucun membre --</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({member.email})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleAddTask} 
              disabled={isSaving || !newTask.title.trim()}
              className="bg-[#4CAF50] hover:bg-[#2E7D32]"
            >
              {isSaving ? "Création..." : "Créer la tâche"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) setEditTask(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier la tâche</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Titre *</Label>
              <Input
                id="edit-title"
                value={editTask?.title ?? ""}
                onChange={(e) =>
                  setEditTask((prev) =>
                    prev ? { ...prev, title: e.target.value } : prev
                  )
                }
                placeholder="Titre de la tâche"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editTask?.description ?? ""}
                onChange={(e) =>
                  setEditTask((prev) =>
                    prev ? { ...prev, description: e.target.value } : prev
                  )
                }
                placeholder="Détails de la tâche"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-date">Date d'échéance</Label>
              <Input
                id="edit-date"
                type="date"
                value={editTask?.date ?? ""}
                onChange={(e) =>
                  setEditTask((prev) =>
                    prev ? { ...prev, date: e.target.value } : prev
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-type">Type de tâche</Label>
              <select
                id="edit-type"
                value={editTask?.type ?? "other"}
                onChange={(e) =>
                  setEditTask((prev) =>
                    prev ? { ...prev, type: e.target.value as Task["type"] } : prev
                  )
                }
                className="w-full rounded-md border border-gray-300 p-2"
              >
                <option value="watering">Arrosage</option>
                <option value="weeding">Désherbage</option>
                <option value="harvest">Récolte</option>
                <option value="planting">Plantation</option>
                <option value="other">Autre</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Statut</Label>
              <select
                id="edit-status"
                value={editTask?.status ?? "pending"}
                onChange={(e) =>
                  setEditTask((prev) =>
                    prev ? { ...prev, status: e.target.value as Task["status"] } : prev
                  )
                }
                className="w-full rounded-md border border-gray-300 p-2"
              >
                <option value="pending">À faire</option>
                <option value="in-progress">En cours</option>
                <option value="completed">Terminée</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleUpdateTask}
              disabled={isUpdating || !editTask?.title?.trim()}
              className="bg-[#4CAF50] hover:bg-[#2E7D32]"
            >
              {isUpdating ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                task={withAssignee(task)}
                onStatusChange={isAdmin ? handleStatusChange : undefined}
                onEdit={isAdmin ? openEditDialog : undefined}
                onDelete={isAdmin ? handleDeleteTask : undefined}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={withAssignee(task)}
                onStatusChange={isAdmin ? handleStatusChange : undefined}
                onEdit={isAdmin ? openEditDialog : undefined}
                onDelete={isAdmin ? handleDeleteTask : undefined}
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
                task={withAssignee(task)}
                onStatusChange={isAdmin ? handleStatusChange : undefined}
                onEdit={isAdmin ? openEditDialog : undefined}
                onDelete={isAdmin ? handleDeleteTask : undefined}
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
                task={withAssignee(task)}
                onEdit={isAdmin ? openEditDialog : undefined}
                onDelete={isAdmin ? handleDeleteTask : undefined}
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
    </div>
  );
}
