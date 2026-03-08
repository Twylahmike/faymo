import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Upload, X, FileIcon, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface FileUploadProps {
  folder?: string;
  onUpload: (url: string, fileName: string) => void;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
}

export default function FileUpload({ folder = "general", onUpload, accept = "image/*,video/*,.pdf,.doc,.docx", maxSizeMB = 10, className }: FileUploadProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File too large (max ${maxSizeMB}MB)`);
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${folder}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage.from("media").upload(path, file);
    if (error) {
      toast.error("Upload failed: " + error.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("media").getPublicUrl(path);
    const url = urlData.publicUrl;

    if (file.type.startsWith("image/")) setPreview(url);
    onUpload(url, file.name);
    toast.success("File uploaded");
    setUploading(false);
  };

  return (
    <div className={className}>
      <input ref={inputRef} type="file" accept={accept} onChange={handleUpload} className="hidden" />
      {preview ? (
        <div className="relative rounded-lg overflow-hidden border border-border/50">
          <img src={preview} alt="Preview" className="w-full h-32 object-cover" />
          <button
            className="absolute top-1 right-1 bg-background/80 rounded-full p-1"
            onClick={() => { setPreview(null); if (inputRef.current) inputRef.current.value = ""; }}
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full border-2 border-dashed border-border/50 rounded-lg p-6 text-center hover:border-primary/50 hover:bg-accent/30 transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 mx-auto text-primary animate-spin" />
          ) : (
            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          )}
          <p className="text-sm text-muted-foreground">{uploading ? "Uploading..." : "Click to upload a file"}</p>
          <p className="text-xs text-muted-foreground mt-1">Max {maxSizeMB}MB</p>
        </button>
      )}
    </div>
  );
}
