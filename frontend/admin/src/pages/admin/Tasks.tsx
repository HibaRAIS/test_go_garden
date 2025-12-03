import { useState, useEffect } from "react";
import { Plus, User, Droplet, Scissors, ShoppingBasket, Sprout, MoreHorizontal } from "lucide-react";
import { TaskCard } from "../../components/TaskCard";
import { tasksApi, Task, Member } from "../../services/tasksApi";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
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
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
    type: "other" as Task["type"],
    status: "pending" as Task["status"],
    assignedToId: "",
  });

  useEffect(() => {
    loadTasks();
    loadMembers();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await tasksApi.getAll();
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

  const filterTasks = (status?: Task["status"]) => {
    if (!status) return tasks;
    return tasks.filter((task) => task.status === status);
  };

  const allTasks = tasks;
  const pendingTasks = filterTasks("pending");
  const inProgressTasks = filterTasks("in-progress");
  const completedTasks = filterTasks("completed");

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
        <Button 
          className="rounded-xl bg-[#4CAF50] hover:bg-[#2E7D32]"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle tâche
        </Button>
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
              <TaskCard key={task.id} task={task} />
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
            <div className="p-1.5 rounded-lg bg-blue-100">
              <Droplet className="h-4 w-4 text-blue-500" />
            </div>
            <span className="text-sm text-gray-600">Arrosage</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-yellow-100">
              <Scissors className="h-4 w-4 text-yellow-600" />
            </div>
            <span className="text-sm text-gray-600">Désherbage</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-orange-100">
              <ShoppingBasket className="h-4 w-4 text-orange-500" />
            </div>
            <span className="text-sm text-gray-600">Récolte</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-green-100">
              <Sprout className="h-4 w-4 text-green-500" />
            </div>
            <span className="text-sm text-gray-600">Plantation</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-100">
              <MoreHorizontal className="h-4 w-4 text-purple-500" />
            </div>
            <span className="text-sm text-gray-600">Autre</span>
          </div>
        </div>
      </div>
    </div>
  );
}
