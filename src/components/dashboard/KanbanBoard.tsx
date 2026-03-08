import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useState } from "react";

const KANBAN_COLUMNS = [
  { id: "planning", label: "Planning", color: "border-muted-foreground/30" },
  { id: "in_progress", label: "In Progress", color: "border-primary/50" },
  { id: "review", label: "Review", color: "border-amber-400/50" },
  { id: "completed", label: "Completed", color: "border-green-400/50" },
];

const priorityColors: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-blue-500/10 text-blue-400",
  high: "bg-orange-500/10 text-orange-400",
  urgent: "bg-red-500/10 text-red-400",
};

interface KanbanBoardProps {
  tasks: any[];
  onStatusChange: (taskId: string, newStatus: string) => void;
  onTaskUpdate?: (taskId: string, data: { title: string; description: string; priority: string; due_date: string; assigned_to: string }) => void;
  onTaskDelete?: (taskId: string) => void;
  teamProfiles?: Record<string, string>;
  teamMembers?: { user_id: string; display_name: string }[];
}

export default function KanbanBoard({ tasks, onStatusChange, onTaskUpdate, onTaskDelete, teamProfiles = {}, teamMembers = [] }: KanbanBoardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [editTask, setEditTask] = useState<any>(null);
  const [editForm, setEditForm] = useState({ title: "", description: "", priority: "medium", due_date: "", assigned_to: "" });

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const taskId = result.draggableId;
    const newStatus = result.destination.droppableId;
    const task = tasks.find(t => t.id === taskId);
    if (task && task.status !== newStatus) {
      onStatusChange(taskId, newStatus);
    }
  };

  const openEdit = (task: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditTask(task);
    setEditForm({
      title: task.title, description: task.description || "",
      priority: task.priority || "medium", due_date: task.due_date || "",
      assigned_to: task.assigned_to || "",
    });
    setEditOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editTask || !editForm.title || !onTaskUpdate) return;
    onTaskUpdate(editTask.id, editForm);
    setEditOpen(false);
    setEditTask(null);
  };

  const getInitials = (name: string) => name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <>
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Task</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Title *</Label><Input value={editForm.title} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))} /></div>
            <div><Label>Description</Label><Textarea value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} /></div>
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
              <div><Label>Due Date</Label><Input type="date" value={editForm.due_date} onChange={e => setEditForm(p => ({ ...p, due_date: e.target.value }))} /></div>
            </div>
            {teamMembers.length > 0 && (
              <div>
                <Label>Assign To</Label>
                <Select value={editForm.assigned_to} onValueChange={v => setEditForm(p => ({ ...p, assigned_to: v }))}>
                  <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                  <SelectContent>
                    {teamMembers.map(m => (
                      <SelectItem key={m.user_id} value={m.user_id}>{m.display_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button className="w-full" onClick={handleSaveEdit}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {KANBAN_COLUMNS.map((col) => {
            const colTasks = tasks.filter(t => t.status === col.id);
            return (
              <Droppable key={col.id} droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`glass-card rounded-xl p-4 border-t-2 ${col.color} min-h-[300px] transition-colors ${snapshot.isDraggingOver ? "bg-accent/30" : ""}`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-display font-semibold text-sm">{col.label}</h3>
                      <span className="text-xs text-muted-foreground bg-secondary rounded-full px-2 py-0.5">{colTasks.length}</span>
                    </div>
                    <div className="space-y-3">
                      {colTasks.map((task, index) => {
                        const assigneeName = task.assigned_to ? teamProfiles[task.assigned_to] : null;
                        return (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`bg-secondary/50 rounded-lg p-3 space-y-2 transition-shadow group ${snapshot.isDragging ? "shadow-lg shadow-primary/10 ring-1 ring-primary/30" : ""}`}
                              >
                                <div className="flex items-start gap-2">
                                  <div {...provided.dragHandleProps} className="mt-0.5">
                                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab active:cursor-grabbing" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{task.title}</p>
                                    {task.description && <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{task.description}</p>}
                                  </div>
                                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {onTaskUpdate && (
                                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => openEdit(task, e)}>
                                        <Pencil className="h-3 w-3" />
                                      </Button>
                                    )}
                                    {onTaskDelete && (
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={(e) => e.stopPropagation()}>
                                            <Trash2 className="h-3 w-3" />
                                          </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>Delete Task?</AlertDialogTitle>
                                            <AlertDialogDescription>This will permanently delete "{task.title}". This cannot be undone.</AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => onTaskDelete(task.id)}>Delete</AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className={`text-xs rounded-full px-2 py-0.5 ${priorityColors[task.priority] || priorityColors.medium}`}>{task.priority}</span>
                                  <div className="flex items-center gap-1.5">
                                    {task.due_date && <span className="text-[10px] text-muted-foreground">{new Date(task.due_date).toLocaleDateString()}</span>}
                                    {assigneeName && (
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Avatar className="h-5 w-5">
                                              <AvatarFallback className="text-[8px] bg-primary/10 text-primary">
                                                {getInitials(assigneeName)}
                                              </AvatarFallback>
                                            </Avatar>
                                          </TooltipTrigger>
                                          <TooltipContent><p className="text-xs">{assigneeName}</p></TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>
    </>
  );
}
