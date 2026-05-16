"use client";

import { useState, useCallback, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const VALID_DOC_EXTS = ["pdf", "pptx", "ppt", "docx", "doc"];

function isValidDoc(file: File) {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return VALID_DOC_EXTS.includes(ext);
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type Status = "idle" | "uploading" | "creating" | "redirecting" | "error";

export function ProgramUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [statusMsg, setStatusMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const router = useRouter();

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && isValidDoc(f)) setFile(f);
    else toast.error("Please upload a PDF, PPTX, or DOCX file.");
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && isValidDoc(f)) setFile(f);
    else if (f) toast.error("Please upload a PDF, PPTX, or DOCX file.");
  };

  const handleGenerate = async () => {
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      toast.error("File too large. Maximum size is 20 MB.");
      return;
    }

    try {
      setStatus("uploading");
      setStatusMsg("Uploading file...");

      const uploadUrl = await generateUploadUrl();
      const uploadRes = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });
      if (!uploadRes.ok) throw new Error("Failed to upload file to storage.");
      const { storageId } = await uploadRes.json();

      setStatus("creating");
      setStatusMsg("Analyzing document...");

      const genRes = await fetch("/api/programs/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceType: "document",
          storageId,
          fileName: file.name,
          mimeType: file.type,
        }),
      });

      if (!genRes.ok) {
        const err = await genRes.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to create study program.");
      }

      const { programId } = await genRes.json();

      setStatus("redirecting");
      setStatusMsg("Redirecting to your course...");

      // Fire-and-forget chapter generation — runs in background while user is on the study page
      fetch("/api/programs/generate-chapters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ programId }),
      }).catch(console.error);

      router.push(`/dashboard/programs/${programId}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setStatus("error");
      setStatusMsg(msg);
      toast.error(msg);
    }
  };

  const isLoading = status !== "idle" && status !== "error";

  return (
    <div className="space-y-5">
      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !isLoading && inputRef.current?.click()}
        className={cn(
          "relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all",
          dragging
            ? "border-[#5C6BC0] bg-[#EEF0FB]"
            : file
            ? "border-[#5C6BC0] bg-[#F7F8FB]"
            : "border-[#DCDEE7] bg-white hover:border-[#5C6BC0] hover:bg-[#F7F8FB]",
          isLoading && "pointer-events-none opacity-60"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.pptx,.ppt,.docx,.doc"
          className="hidden"
          onChange={handleFileChange}
        />

        {file ? (
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EEF0FB] flex items-center justify-center shrink-0">
              <FileText size={20} className="text-[#5C6BC0]" />
            </div>
            <div className="text-left flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#15172B] truncate">{file.name}</p>
              <p className="text-xs text-[#6A6F87]">{formatBytes(file.size)}</p>
            </div>
            {!isLoading && (
              <button
                onClick={e => { e.stopPropagation(); setFile(null); }}
                className="text-[#8D92A8] hover:text-[#D9534F] transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <Upload size={28} className="mx-auto text-[#DCDEE7]" />
            <p className="text-sm font-semibold text-[#15172B]">Drop your document here</p>
            <p className="text-xs text-[#8D92A8]">PDF, PPTX, DOCX · Max 20 MB</p>
          </div>
        )}
      </div>

      {/* Status / error message */}
      {statusMsg && (
        <p className={cn(
          "text-sm text-center",
          status === "error" ? "text-[#D9534F]" : "text-[#5C6BC0]"
        )}>
          {isLoading && <Loader2 size={13} className="inline mr-1.5 animate-spin" />}
          {statusMsg}
        </p>
      )}

      <Button
        onClick={handleGenerate}
        disabled={!file || isLoading}
        className="w-full bg-[#5C6BC0] hover:bg-[#4F5BAE] text-white h-11 text-base font-semibold gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            {statusMsg}
          </>
        ) : (
          "Generate Study Program"
        )}
      </Button>

      <p className="text-xs text-[#8D92A8] text-center">
        Generation takes 1–3 minutes for full course content
      </p>
    </div>
  );
}
