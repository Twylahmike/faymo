import TeamManagement from "@/components/dashboard/TeamManagement";

const TeamPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Team Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage team members and their roles</p>
      </div>
      <TeamManagement />
    </div>
  );
};

export default TeamPage;
