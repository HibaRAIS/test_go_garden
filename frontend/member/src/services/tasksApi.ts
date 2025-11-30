
const API_BASE_URL = import.meta.env.VITE_TACHES_API_URL || "http://localhost:8003/api";

export interface Task {
  id: string;
  title: string;
  date: string;
  assignedTo?: string;
  assignedToId?: string;
  status: 'pending' | 'in-progress' | 'completed';
  type: 'watering' | 'weeding' | 'harvest' | 'planting' | 'other';
  description?: string;
}

export const tasksApi = {
  getAll: async (assignedTo?: string): Promise<Task[]> => {
    const url = assignedTo 
      ? `${API_BASE_URL}/tasks?assigned_to=${assignedTo}` 
      : `${API_BASE_URL}/tasks`;
      
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch tasks");
    const data = await response.json();
    return data.map((t: any) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      date: t.due_date,
      status: t.status || 'pending',
      type: t.type || 'other',
      assignedToId: t.assignments?.[0]?.member_id,
      assignedTo: "Member", // Placeholder
    }));
  },

  create: async (task: Partial<Task>) => {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: task.title,
        description: task.description,
        due_date: task.date,
        status: task.status,
        type: task.type
      }),
    });
    if (!response.ok) throw new Error("Failed to create task");
    return response.json();
  },

  update: async (id: string, updates: Partial<Task>) => {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: updates.title,
        description: updates.description,
        due_date: updates.date,
        status: updates.status,
        type: updates.type
      }),
    });
    if (!response.ok) throw new Error("Failed to update task");
    return response.json();
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete task");
  }
};
