import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Shield, ShieldCheck, User, Trash2, Mail } from "lucide-react";
import type { AppRole } from "@/hooks/useUserRole";
import { useUserRole } from "@/hooks/useUserRole";
import AddTeamMemberDialog from "./AddTeamMemberDialog";

interface TeamMember {
  user_id: string;
  role: AppRole;
  display_name: string | null;
  email: string | null;
  invite_status?: string | null;
}

const roleIcons: Record<AppRole, React.ReactNode> = {
  admin: <ShieldCheck className="h-4 w-4 text-primary" />,
  worker: <Shield className="h-4 w-4 text-muted-foreground" />,
  client: <User className="h-4 w-4 text-muted-foreground" />,
};

const TeamManagement = () => {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = useCallback(async () => {
    // Get all non-client roles
    const { data: roles, error: rolesErr } = await supabase
      .from("user_roles")
      .select("user_id, role")
      .in("role", ["admin", "worker"]);

    if (rolesErr || !roles) {
      setLoading(false);
      return;
    }

    // Get profiles + invites in parallel
    const userIds = roles.map((r) => r.user_id);
    const [{ data: profiles }, { data: invites }] = await Promise.all([
      supabase.from("profiles").select("user_id, display_name").in("user_id", userIds),
      supabase.from("member_invites").select("user_id, status, email").in("user_id", userIds),
    ]);

    const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);
    const inviteMap = new Map(invites?.map((i) => [i.user_id, i]) || []);

    const merged: TeamMember[] = roles.map((r) => ({
      user_id: r.user_id,
      role: r.role as AppRole,
      display_name: profileMap.get(r.user_id)?.display_name || null,
      email: inviteMap.get(r.user_id)?.email || null,
      invite_status: inviteMap.get(r.user_id)?.status || null,
    }));

    setMembers(merged);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleRoleChange = async (userId: string, newRole: AppRole) => {
    if (userId === user?.id) {
      toast.error("You cannot change your own role");
      return;
    }

    const { error } = await supabase
      .from("user_roles")
      .update({ role: newRole })
      .eq("user_id", userId);

    if (error) {
      toast.error("Failed to update role");
    } else {
      toast.success("Role updated successfully");
      fetchMembers();
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (userId === user?.id) {
      toast.error("You cannot remove yourself");
      return;
    }

    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId);

    if (error) {
      toast.error("Failed to remove team member");
    } else {
      toast.success("Team member removed");
      fetchMembers();
    }
  };

  const handleSendReset = async (email: string | null, name: string | null) => {
    if (!email) { toast.error("No email on file for this member"); return; }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) { toast.error("Failed to send reset link"); return; }
    toast.success(`Password reset link sent to ${name || email}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold">Team Members</h2>
          <p className="text-sm text-muted-foreground">{members.length} member{members.length !== 1 ? "s" : ""}</p>
        </div>
        {isAdmin && <AddTeamMemberDialog onMemberAdded={fetchMembers} />}
      </div>

      {members.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center">
          <Shield className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">No team members found.</p>
        </div>
      ) : (
        <div className="glass-card rounded-xl overflow-hidden border border-border">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Member</TableHead>
                <TableHead className="text-muted-foreground">Role</TableHead>
                <TableHead className="text-muted-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.user_id} className="border-border">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                        {roleIcons[member.role]}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {member.display_name || "Unnamed"}
                          {member.user_id === user?.id && (
                            <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                          )}
                        </p>
                        {member.email && (
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                        )}
                        {member.invite_status && member.user_id !== user?.id && (
                          <span className="mt-1 inline-block text-[10px] uppercase tracking-wide rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5">
                            {member.invite_status}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {member.user_id === user?.id ? (
                      <span className="rounded-full bg-primary/10 text-primary text-xs px-2.5 py-1 font-medium capitalize">
                        {member.role}
                      </span>
                    ) : (
                      <Select
                        value={member.role}
                        onValueChange={(v) => handleRoleChange(member.user_id, v as AppRole)}
                      >
                        <SelectTrigger className="w-32 bg-secondary border-border h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="worker">Worker</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {member.user_id !== user?.id && (
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" title="Send password reset"
                          onClick={() => handleSendReset(member.email, member.display_name)}>
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Remove member"
                          onClick={() => handleRemoveMember(member.user_id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;
