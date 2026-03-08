import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { GripVertical } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  teamProfiles?: Record<string, string>; // user_id -> display_name
}

export default function KanbanBoard({ tasks, onStatusChange, teamProfiles = {} }: KanbanBoardProps) {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const taskId = result.draggableId;
    const newStatus = result.destination.droppableId;
    const task = tasks.find(t => t.id === taskId);
    if (task && task.status !== newStatus) {
      onStatusChange(taskId, newStatus);
    }
  };

  const getInitials = (name: string) => name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  return (
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
                              className={`bg-secondary/50 rounded-lg p-3 space-y-2 transition-shadow ${snapshot.isDragging ? "shadow-lg shadow-primary/10 ring-1 ring-primary/30" : ""}`}
                            >
                              <div className="flex items-start gap-2">
                                <div {...provided.dragHandleProps} className="mt-0.5">
                                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab active:cursor-grabbing" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{task.title}</p>
                                  {task.description && <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{task.description}</p>}
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
  );
}
