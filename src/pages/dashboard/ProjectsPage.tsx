import { useAuth } from "@/contexts/AuthContext";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Plus } from "lucide-react";
import { toast } from "sonner";
import KanbanBoard from "@/components/dashboard/KanbanBoard";

const priorityColors: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-blue-500/10 text-blue-400",
  high: "bg-orange-500/10 text-orange-400",
  urgent: "bg-red-500/10 text-red-400",
};

const ProjectsPage = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isTaskOpen, setIsTaskOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", client_id: "", priority: "medium", start_date: "", due_date: "" });
  const [taskForm, setTaskForm] = useState({ title: "", description: "", priority: "medium", due_date: "" });

  const fetchAll = useCallback(async () => {
    if (!user) return;
    const [projRes, clientRes, taskRes] = await Promise.all([
      supabase.from("projects").select("*").order("created_at", { ascending: false }),
      supabase.from("clients").select("id, name"),
      supabase.from("tasks").select("*").order("created_at", { ascending: false }),
    ]);
    setProjects(projRes.data || []);
    setClients(clientRes.data || []);
    setTasks(taskRes.data || []);
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleAddProject = async () => {
    if (!user || !form.name) return;
    const { error } = await supabase.from("projects").insert({
      name: form.name, description: form.description || null, client_id: form.client_id || null,
      priority: form.priority, start_date: form.start_date || null, due_date: form.due_date || null, created_by: user.id,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Project created");
    setForm({ name: "", description: "", client_id: "", priority: "medium", start_date: "", due_date: "" });
    setIsOpen(false);
    fetchAll();
  };

  const handleAddTask = async () => {
    if (!user || !taskForm.title || !selectedProject) return;
    const { error } = await supabase.from("tasks").insert({
      title: taskForm.title, description: taskForm.description || null,
      project_id: selectedProject, priority: taskForm.priority, due_date: taskForm.due_date || null, created_by: user.id,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Task added");
    setTaskForm({ title: "", description: "", priority: "medium", due_date: "" });
    setIsTaskOpen(false);
    fetchAll();
  };

  const handleTaskStatusChange = async (taskId: string, newStatus: string) => {
    const { error } = await supabase.from("tasks").update({ status: newStatus }).eq("id", taskId);
    if (error) { toast.error(error.message); return; }
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  };

  const projectTasks = selectedProject ? tasks.filter(t => t.project_id === selectedProject) : [];
  const selectedProjectData = projects.find(p => p.id === selectedProject);

  if (selectedProject && selectedProjectData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setSelectedProject(null)}>← Back</Button>
            <div>
              <h1 className="font-display text-2xl font-bold">{selectedProjectData.name}</h1>
              <p className="text-sm text-muted-foreground">
                {clients.find(c => c.id === selectedProjectData.client_id)?.name || "No client"} ·{" "}
                <span className={`inline-block rounded-full px-2 py-0.5 text-xs ${priorityColors[selectedProjectData.priority]}`}>
                  {selectedProjectData.priority}
                </span>
              </p>
            </div>
          </div>
          <Dialog open={isTaskOpen} onOpenChange={setIsTaskOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-full"><Plus className="h-4 w-4 mr-1" /> Add Task</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Task</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Title *</Label><Input value={taskForm.title} onChange={e => setTaskForm(p => ({ ...p, title: e.target.value }))} /></div>
                <div><Label>Description</Label><Textarea value={taskForm.description} onChange={e => setTaskForm(p => ({ ...p, description: e.target.value }))} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Priority</Label>
                    <Select value={taskForm.priority} onValueChange={v => setTaskForm(p => ({ ...p, priority: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Due Date</Label><Input type="date" value={taskForm.due_date} onChange={e => setTaskForm(p => ({ ...p, due_date: e.target.value }))} /></div>
                </div>
                <Button className="w-full" onClick={handleAddTask}>Add Task</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <KanbanBoard tasks={projectTasks} onStatusChange={handleTaskStatusChange} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your projects and tasks</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-purple-500 hover:bg-purple-600 text-white">
              <Plus className="h-4 w-4 mr-1" /> New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Project</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Project Name *</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
              <div>
                <Label>Client</Label>
                <Select value={form.client_id} onValueChange={v => setForm(p => ({ ...p, client_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select client..." /></SelectTrigger>
                  <SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={v => setForm(p => ({ ...p, priority: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Start Date</Label><Input type="date" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} /></div>
                <div><Label>Due Date</Label><Input type="date" value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} /></div>
              </div>
              <Button className="w-full" onClick={handleAddProject}>Create Project</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {projects.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-400/10">
            <CalendarDays className="h-8 w-8 text-purple-400" />
          </div>
          <h2 className="font-display text-xl font-bold mb-2">No projects yet</h2>
          <p className="text-muted-foreground">Create your first project.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div key={project.id} className="glass-card rounded-xl p-5 transition-all hover:glow-border cursor-pointer" onClick={() => setSelectedProject(project.id)}>
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-display font-bold">{project.name}</h3>
                <span className={`text-xs rounded-full px-2 py-0.5 ${priorityColors[project.priority]}`}>{project.priority}</span>
              </div>
              {project.description && <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{project.description}</p>}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{clients.find(c => c.id === project.client_id)?.name || "No client"}</span>
                <span className={`rounded-full px-2 py-0.5 ${
                  project.status === "completed" ? "bg-green-500/10 text-green-400" :
                  project.status === "in_progress" ? "bg-primary/10 text-primary" :
                  "bg-muted text-muted-foreground"
                }`}>{(project.status || "planning").replace("_", " ")}</span>
              </div>
              {project.due_date && <p className="text-xs text-muted-foreground mt-2">Due: {new Date(project.due_date).toLocaleDateString()}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
