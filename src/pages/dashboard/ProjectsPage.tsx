import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CalendarDays,
  Plus,
  LayoutGrid,
  ListTodo,
  FileDown,
  GanttChart as GanttIcon,
  MessageSquare,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import KanbanBoard from "@/components/dashboard/KanbanBoard";
import GanttChart from "@/components/dashboard/GanttChart";
import ProjectComments from "@/components/dashboard/ProjectComments";

const priorityColors: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-blue-500/10 text-blue-400",
  high: "bg-orange-500/10 text-orange-400",
  urgent: "bg-red-500/10 text-red-400",
};

const ProjectsPage = () => {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [teamProfiles, setTeamProfiles] = useState<Record<string, string>>({});
  const [teamMembers, setTeamMembers] = useState<{ user_id: string; display_name: string }[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isTaskOpen, setIsTaskOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", client_id: "", priority: "medium", start_date: "", due_date: "" });
  const [editForm, setEditForm] = useState({ name: "", description: "", client_id: "", priority: "medium", start_date: "", due_date: "", status: "planning" });
  const [taskForm, setTaskForm] = useState({ title: "", description: "", priority: "medium", due_date: "", assigned_to: "" });
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());

  const fetchAll = useCallback(async () => {
    if (!user) return;
    const [projRes, clientRes, taskRes, profileRes] = await Promise.all([
      supabase.from("projects").select("*").order("created_at", { ascending: false }),
      supabase.from("clients").select("id, name"),
      supabase.from("tasks").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("user_id, display_name"),
    ]);
    setProjects(projRes.data || []);
    setClients(clientRes.data || []);
    setTasks(taskRes.data || []);
    if (profileRes.data) {
      const map: Record<string, string> = {};
      profileRes.data.forEach(p => { map[p.user_id] = p.display_name || "User"; });
      setTeamProfiles(map);
      setTeamMembers(profileRes.data.map(p => ({ user_id: p.user_id, display_name: p.display_name || "User" })));
    }
  }, [user]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    // reset selection when switching projects
    setSelectedTasks(new Set());
  }, [selectedProject]);

  const projectProgress = useMemo(() => {
    const map: Record<string, number> = {};
    projects.forEach(p => {
      const pTasks = tasks.filter(t => t.project_id === p.id);
      if (pTasks.length === 0) { map[p.id] = 0; return; }
      const completed = pTasks.filter(t => t.status === "completed").length;
      map[p.id] = Math.round((completed / pTasks.length) * 100);
    });
    return map;
  }, [projects, tasks]);

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

  const handleEditProject = async () => {
    if (!editingProject || !editForm.name) return;
    const { error } = await supabase.from("projects").update({
      name: editForm.name, description: editForm.description || null, client_id: editForm.client_id || null,
      priority: editForm.priority, start_date: editForm.start_date || null, due_date: editForm.due_date || null, status: editForm.status,
    }).eq("id", editingProject.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Project updated");
    setIsEditOpen(false);
    setEditingProject(null);
    fetchAll();
  };

  const handleDeleteProject = async (id: string) => {
    await supabase.from("tasks").delete().eq("project_id", id);
    await supabase.from("project_comments").delete().eq("project_id", id);
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Project deleted");
    if (selectedProject === id) setSelectedProject(null);
    fetchAll();
  };

  const openEditDialog = (project: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProject(project);
    setEditForm({
      name: project.name, description: project.description || "", client_id: project.client_id || "",
      priority: project.priority || "medium", start_date: project.start_date || "", due_date: project.due_date || "", status: project.status || "planning",
    });
    setIsEditOpen(true);
  };

  const handleAddTask = async () => {
    if (!user || !taskForm.title || !selectedProject) return;
    const { error } = await supabase.from("tasks").insert({
      title: taskForm.title, description: taskForm.description || null,
      project_id: selectedProject, priority: taskForm.priority, due_date: taskForm.due_date || null,
      assigned_to: taskForm.assigned_to || null, created_by: user.id,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Task added");
    setTaskForm({ title: "", description: "", priority: "medium", due_date: "", assigned_to: "" });
    setIsTaskOpen(false);
    fetchAll();
  };

  const handleTaskStatusChange = async (taskId: string, newStatus: string) => {
    const { error } = await supabase.from("tasks").update({ status: newStatus }).eq("id", taskId);
    if (error) { toast.error(error.message); return; }
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  };

  const handleTaskUpdate = async (taskId: string, data: { title: string; description: string; priority: string; due_date: string; assigned_to: string }) => {
    const { error } = await supabase.from("tasks").update({
      title: data.title, description: data.description || null,
      priority: data.priority, due_date: data.due_date || null,
      assigned_to: data.assigned_to || null,
    }).eq("id", taskId);
    if (error) { toast.error(error.message); return; }
    toast.success("Task updated");
    fetchAll();
  };

  const handleTaskDelete = async (taskId: string) => {
    const { error } = await supabase.from("tasks").delete().eq("id", taskId);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Task deleted");
    fetchAll();
  };

  // Bulk actions (table view)
  const toggleTaskSelect = (id: string) => {
    setSelectedTasks(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleTaskAll = () => {
    if (selectedProjectTasks.length === 0) return;
    if (selectedTasks.size === selectedProjectTasks.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(selectedProjectTasks.map(t => t.id)));
    }
  };

  const handleBulkTaskStatus = async (status: "todo" | "in_progress" | "completed") => {
    const ids = Array.from(selectedTasks);
    if (ids.length === 0) return;

    const { error } = await supabase.from("tasks").update({ status }).in("id", ids);
    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(`${ids.length} tasks updated`);
    setSelectedTasks(new Set());
    fetchAll();
  };

  const handleBulkTaskDelete = async () => {
    const ids = Array.from(selectedTasks);
    if (ids.length === 0) return;

    const { error } = await supabase.from("tasks").delete().in("id", ids);
    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(`${ids.length} tasks deleted`);
    setSelectedTasks(new Set());
    fetchAll();
  };

  const handleBulkTaskExport = () => {
    const ids = Array.from(selectedTasks);
    const rows = selectedProjectTasks.filter(t => ids.includes(t.id));

    const csv = ["Title,Status,Priority,Due Date,Assigned To,Created"].concat(
      rows.map(t => {
        const assignee = t.assigned_to ? (teamProfiles[t.assigned_to] || t.assigned_to) : "";
        const due = t.due_date || "";
        const safeTitle = String(t.title).replace(/"/g, '""');
        return `"${safeTitle}",${t.status || "todo"},${t.priority || ""},${due},"${assignee}",${t.created_at}`;
      }),
    ).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tasks-export.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported!");
  };

  const projectTasks = selectedProject ? tasks.filter(t => t.project_id === selectedProject) : [];
  const selectedProjectTasks = projectTasks;
  const selectedProjectData = projects.find(p => p.id === selectedProject);
  const currentProgress = selectedProject ? (projectProgress[selectedProject] || 0) : 0;

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
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={(e) => openEditDialog(selectedProjectData, e)}>
              <Pencil className="h-4 w-4 mr-1" /> Edit
            </Button>
            {isAdmin && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Project?</AlertDialogTitle>
                    <AlertDialogDescription>This will permanently delete the project and all its tasks and comments. This cannot be undone.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => handleDeleteProject(selectedProjectData.id)}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
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
                  <div>
                    <Label>Assign To</Label>
                    <Select value={taskForm.assigned_to} onValueChange={v => setTaskForm(p => ({ ...p, assigned_to: v }))}>
                      <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                      <SelectContent>
                        {teamMembers.map(m => (
                          <SelectItem key={m.user_id} value={m.user_id}>{m.display_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full" onClick={handleAddTask}>Add Task</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-muted-foreground">{currentProgress}%</span>
          </div>
          <Progress value={currentProgress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1.5">
            {projectTasks.filter(t => t.status === "completed").length} of {projectTasks.length} tasks completed
          </p>
        </div>

        <Tabs defaultValue="kanban" className="space-y-4">
          <TabsList className="bg-secondary/50">
            <TabsTrigger value="kanban" className="gap-1.5">
              <LayoutGrid className="h-3.5 w-3.5" /> Kanban
            </TabsTrigger>
            <TabsTrigger value="table" className="gap-1.5">
              <ListTodo className="h-3.5 w-3.5" /> Table
            </TabsTrigger>
            <TabsTrigger value="gantt" className="gap-1.5">
              <GanttIcon className="h-3.5 w-3.5" /> Timeline
            </TabsTrigger>
            <TabsTrigger value="chat" className="gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" /> Chat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="kanban">
            <KanbanBoard
              tasks={projectTasks}
              onStatusChange={handleTaskStatusChange}
              onTaskUpdate={handleTaskUpdate}
              onTaskDelete={handleTaskDelete}
              teamProfiles={teamProfiles}
              teamMembers={teamMembers}
            />
          </TabsContent>

          <TabsContent value="table" className="space-y-3">
            {selectedTasks.size > 0 && (
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <span className="text-sm text-muted-foreground">{selectedTasks.size} selected</span>
                <div className="flex items-center gap-2 flex-wrap">
                  <Select onValueChange={(v) => handleBulkTaskStatus(v as any)}>
                    <SelectTrigger className="h-8 w-36 text-xs">
                      <SelectValue placeholder="Set status..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">Mark Todo</SelectItem>
                      <SelectItem value="in_progress">Mark In Progress</SelectItem>
                      <SelectItem value="completed">Mark Completed</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="outline" size="sm" onClick={handleBulkTaskExport}>
                    <FileDown className="h-3.5 w-3.5 mr-1" /> Export
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-destructive border-destructive/30">
                        <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete {selectedTasks.size} tasks?</AlertDialogTitle>
                        <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleBulkTaskDelete}>
                          Delete All
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )}

            {selectedProjectTasks.length === 0 ? (
              <div className="glass-card rounded-xl p-10 text-center">
                <p className="text-sm text-muted-foreground">No tasks yet.</p>
              </div>
            ) : (
              <div className="glass-card rounded-xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox
                          checked={selectedTasks.size === selectedProjectTasks.length && selectedProjectTasks.length > 0}
                          onCheckedChange={toggleTaskAll}
                        />
                      </TableHead>
                      <TableHead>Task</TableHead>
                      <TableHead>Assignee</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Due</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedProjectTasks.map((t) => (
                      <TableRow key={t.id} data-state={selectedTasks.has(t.id) ? "selected" : undefined}>
                        <TableCell>
                          <Checkbox checked={selectedTasks.has(t.id)} onCheckedChange={() => toggleTaskSelect(t.id)} />
                        </TableCell>
                        <TableCell className="font-medium">{t.title}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {t.assigned_to ? (teamProfiles[t.assigned_to] || "—") : "—"}
                        </TableCell>
                        <TableCell>
                          <span className={`text-xs rounded-full px-2 py-0.5 ${priorityColors[t.priority || "medium"] || priorityColors.medium}`}>{t.priority || "medium"}</span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{t.due_date ? new Date(t.due_date).toLocaleDateString() : "—"}</TableCell>
                        <TableCell>
                          <Select value={t.status || "todo"} onValueChange={(v) => handleTaskStatusChange(t.id, v)}>
                            <SelectTrigger className="h-8 w-36 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="todo">Todo</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="gantt">
            <GanttChart tasks={projectTasks} />
          </TabsContent>

          <TabsContent value="chat">
            <ProjectComments projectId={selectedProject} />
          </TabsContent>
        </Tabs>
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

      {/* Edit Project Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Project</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Project Name *</Label><Input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div><Label>Description</Label><Textarea value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} /></div>
            <div>
              <Label>Client</Label>
              <Select value={editForm.client_id} onValueChange={v => setEditForm(p => ({ ...p, client_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select client..." /></SelectTrigger>
                <SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Priority</Label>
                <Select value={editForm.priority} onValueChange={v => setEditForm(p => ({ ...p, priority: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={editForm.status} onValueChange={v => setEditForm(p => ({ ...p, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Start Date</Label><Input type="date" value={editForm.start_date} onChange={e => setEditForm(p => ({ ...p, start_date: e.target.value }))} /></div>
              <div><Label>Due Date</Label><Input type="date" value={editForm.due_date} onChange={e => setEditForm(p => ({ ...p, due_date: e.target.value }))} /></div>
            </div>
            <Button className="w-full" onClick={handleEditProject}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

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
          {projects.map((project) => {
            const progress = projectProgress[project.id] || 0;
            const pTasks = tasks.filter(t => t.project_id === project.id);
            return (
              <div key={project.id} className="glass-card rounded-xl p-5 transition-all hover:glow-border cursor-pointer" onClick={() => setSelectedProject(project.id)}>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-display font-bold">{project.name}</h3>
                  <div className="flex items-center gap-1">
                    <span className={`text-xs rounded-full px-2 py-0.5 ${priorityColors[project.priority]}`}>{project.priority}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => openEditDialog(project, e)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    {isAdmin && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={(e) => e.stopPropagation()}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete "{project.name}"?</AlertDialogTitle>
                            <AlertDialogDescription>This will permanently delete this project and all its tasks. This cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => handleDeleteProject(project.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
                {project.description && <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{project.description}</p>}
                {pTasks.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-muted-foreground">{progress}% complete</span>
                      <span className="text-[10px] text-muted-foreground">{pTasks.filter(t => t.status === "completed").length}/{pTasks.length}</span>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                  </div>
                )}
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
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
