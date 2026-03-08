import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";

const SettingsPage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ display_name: "", bio: "", avatar_url: "" });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [passwords, setPasswords] = useState({ newPassword: "", confirmPassword: "" });
  const [changingPassword, setChangingPassword] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("display_name, bio, avatar_url").eq("user_id", user.id).single()
      .then(({ data }) => {
        if (data) setProfile({ display_name: data.display_name || "", bio: data.bio || "", avatar_url: data.avatar_url || "" });
      });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      display_name: profile.display_name,
      bio: profile.bio,
      avatar_url: profile.avatar_url,
    }).eq("user_id", user.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Profile updated");
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Max 2MB"); return; }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error } = await supabase.storage.from("media").upload(path, file, { upsert: true });
    if (error) { toast.error(error.message); setUploading(false); return; }

    const { data: urlData } = supabase.storage.from("media").getPublicUrl(path);
    const url = `${urlData.publicUrl}?t=${Date.now()}`;
    setProfile(p => ({ ...p, avatar_url: url }));

    await supabase.from("profiles").update({ avatar_url: url }).eq("user_id", user.id);
    setUploading(false);
    toast.success("Avatar updated");
  };

  const handlePasswordChange = async () => {
    if (passwords.newPassword.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (passwords.newPassword !== passwords.confirmPassword) { toast.error("Passwords don't match"); return; }

    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: passwords.newPassword });
    setChangingPassword(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Password changed");
    setPasswords({ newPassword: "", confirmPassword: "" });
  };

  const initials = (profile.display_name || user?.email || "U").slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      {/* Avatar & Profile */}
      <div className="glass-card rounded-xl p-6 space-y-4">
        <h3 className="font-display font-semibold">Profile</h3>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity"
            >
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
          </div>
          <div>
            <p className="font-medium">{profile.display_name || user?.email}</p>
            <p className="text-xs text-muted-foreground">Click the camera icon to change your avatar</p>
          </div>
        </div>

        <div>
          <Label>Display Name</Label>
          <Input value={profile.display_name} onChange={e => setProfile(p => ({ ...p, display_name: e.target.value }))} />
        </div>
        <div>
          <Label>Bio</Label>
          <Textarea value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} rows={3} />
        </div>
        <div>
          <Label>Email</Label>
          <Input value={user?.email || ""} disabled className="opacity-50" />
        </div>
        <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
      </div>

      {/* Password Change */}
      <div className="glass-card rounded-xl p-6 space-y-4">
        <h3 className="font-display font-semibold">Change Password</h3>
        <div>
          <Label>New Password</Label>
          <Input type="password" value={passwords.newPassword} onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))} placeholder="Min 6 characters" />
        </div>
        <div>
          <Label>Confirm Password</Label>
          <Input type="password" value={passwords.confirmPassword} onChange={e => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))} />
        </div>
        <Button variant="outline" onClick={handlePasswordChange} disabled={changingPassword}>
          {changingPassword ? "Changing..." : "Change Password"}
        </Button>
      </div>
    </div>
  );
};

export default SettingsPage;
