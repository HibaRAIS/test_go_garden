import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { tasksApi, Task } from "../../services/tasksApi";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Badge } from "../../components/ui/badge";

const taskTypeColors: Record<string, string> = {
  watering: "bg-blue-500",
  weeding: "bg-yellow-500",
  harvest: "bg-orange-500",
  planting: "bg-green-500",
  other: "bg-purple-500",
};

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadTasks();
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

  const handleMarkComplete = async () => {
    if (!selectedTask) return;
    try {
      await tasksApi.update(selectedTask.id, { status: "completed" });
      setTasks(tasks.map(t => t.id === selectedTask.id ? { ...t, status: "completed" } : t));
      setSelectedTask({ ...selectedTask, status: "completed" });
    } catch (err) {
      console.error("Failed to update task", err);
    }
  };

  const handleMarkIncomplete = async () => {
    if (!selectedTask) return;
    try {
      await tasksApi.update(selectedTask.id, { status: "pending" });
      setTasks(tasks.map(t => t.id === selectedTask.id ? { ...t, status: "pending" } : t));
      setSelectedTask({ ...selectedTask, status: "pending" });
    } catch (err) {
      console.error("Failed to update task", err);
    }
  };

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();
  const monthName = currentDate.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  const days = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const getTasksForDay = (day: number) => {
    return tasks.filter((task) => {
      if (!task.date) return false;
      const taskDate = new Date(task.date);
      return (
        taskDate.getFullYear() === currentDate.getFullYear() &&
        taskDate.getMonth() === currentDate.getMonth() &&
        taskDate.getDate() === day
      );
    });
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsDetailOpen(true);
  };

  const today = new Date();
  const isToday = (day: number) => {
    return (
      today.getFullYear() === currentDate.getFullYear() &&
      today.getMonth() === currentDate.getMonth() &&
      today.getDate() === day
    );
  };

  if (loading) {
    return <div className="p-8 text-center">Chargement du calendrier...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-gray-900 mb-1 capitalize">
            {monthName}
          </h1>
          <p className="text-gray-600">Planifiez vos activités au jardin</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={previousMonth}
            className="rounded-xl"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={nextMonth}
            className="rounded-xl"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl border border-[#E0E0E0] overflow-hidden">
        {/* Days header */}
        <div className="grid grid-cols-7 border-b border-[#E0E0E0]">
          {days.map((day) => (
            <div key={day} className="p-4 text-center bg-[#F8F5F0]">
              <span className="text-gray-600">{day}</span>
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {/* Empty cells for days before month starts */}
          {Array.from({
            length: firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1,
          }).map((_, index) => (
            <div
              key={`empty-${index}`}
              className="min-h-24 p-2 border-b border-r border-[#E0E0E0] bg-gray-50"
            />
          ))}

          {/* Days of the month */}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const dayTasks = getTasksForDay(day);
            const isTodayDay = isToday(day);

            return (
              <div
                key={day}
                className={`min-h-24 p-2 border-b border-r border-[#E0E0E0] hover:bg-[#F8F5F0] transition-colors ${
                  isTodayDay ? "bg-[#4CAF50]/5" : ""
                }`}
              >
                <div
                  className={`text-sm mb-2 ${
                    isTodayDay ? "text-[#4CAF50]" : "text-gray-700"
                  }`}
                >
                  {isTodayDay && (
                    <span className="inline-block h-6 w-6 rounded-full bg-[#4CAF50] text-white text-center leading-6 mr-1">
                      {day}
                    </span>
                  )}
                  {!isTodayDay && day}
                </div>
                <div className="space-y-1">
                  {dayTasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => handleTaskClick(task)}
                      className={`w-full text-left px-2 py-1 rounded text-xs text-white ${
                        taskTypeColors[task.type]
                      } hover:opacity-80 transition-opacity truncate`}
                    >
                      {task.title}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-xl p-6 border border-[#E0E0E0]">
        <h3 className="text-gray-900 mb-4">Légende</h3>
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

      {/* Task Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedTask?.title}</DialogTitle>
          </DialogHeader>

          {selectedTask && (
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-600 mb-1">Date</p>
                <p className="text-gray-900">
                  {new Date(selectedTask.date).toLocaleDateString("fr-FR", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-600 mb-1">Assigné à</p>
                <p className="text-gray-900">{selectedTask.assignedTo}</p>
              </div>

              <div>
                <p className="text-xs text-gray-600 mb-1">Statut</p>
                <Badge
                  className={
                    selectedTask.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : selectedTask.status === "in-progress"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-yellow-100 text-yellow-800"
                  }
                >
                  {selectedTask.status === "completed"
                    ? "Terminée"
                    : selectedTask.status === "in-progress"
                    ? "En cours"
                    : "À faire"}
                </Badge>
              </div>

              {selectedTask.description && (
                <div>
                  <p className="text-xs text-gray-600 mb-1">Description</p>
                  <p className="text-gray-700">{selectedTask.description}</p>
                </div>
              )}

              <div className="flex gap-2">
                {selectedTask.status !== "completed" && (
                  <Button 
                    className="flex-1 rounded-xl bg-[#4CAF50] hover:bg-[#2E7D32]"
                    onClick={handleMarkComplete}
                  >
                    Marquer comme terminée
                  </Button>
                )}
                {selectedTask.status === "completed" && (
                  <Button 
                    className="flex-1 rounded-xl"
                    variant="outline"
                    onClick={handleMarkIncomplete}
                  >
                    Marquer non terminée
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
