"use client";

import { useState } from "react";
import { MemeCanvas } from "@/components/MemeCanvas";
import { AuthGate } from "@/components/AuthGate";
import { db, id } from "@/lib/db";

export default function CreatePage() {
  const { user } = db.useAuth();
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  const handleShareClick = (getBlob: () => Promise<Blob | null>) => {
    setShareModalOpen(true);
    setTitle("");
    setError("");
    (window as unknown as { __pendingShareBlob?: () => Promise<Blob | null> }).__pendingShareBlob = getBlob;
  };

  const handlePost = async () => {
    const getBlob = (window as unknown as { __pendingShareBlob?: () => Promise<Blob | null> }).__pendingShareBlob;
    if (!getBlob || !title.trim()) return;

    setPosting(true);
    setError("");

    try {
      const blob = await getBlob();
      if (!blob) {
        setError("No image to share. Select a template or upload an image first.");
        setPosting(false);
        return;
      }

      const file = new File([blob], `meme-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });

      const path = `memes/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
      await db.storage.uploadFile(path, file, {
        contentType: "image/jpeg",
      });

      if (!user?.id) {
        setError("You must be signed in to share.");
        setPosting(false);
        return;
      }

      const urlResult = await db.storage.getDownloadUrl(path);
      const url =
        typeof urlResult === "string"
          ? urlResult
          : typeof (urlResult as { url?: string })?.url === "string"
            ? (urlResult as { url: string }).url
            : path;

      await db.transact([
        db.tx.memes[id()].update({
          title: title.trim(),
          imageUrl: url,
          createdAt: Date.now(),
          authorId: user.id,
        }),
      ]);

      setShareModalOpen(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to post meme");
    } finally {
      setPosting(false);
    }
  };

  return (
    <>
      <AuthGate
        fallback={
          <div className="flex flex-col">
            <MemeCanvas />
            <p className="py-4 text-center text-sm text-muted">
              Sign in to share memes to the community
            </p>
          </div>
        }
      >
        <MemeCanvas onShare={handleShareClick} />
      </AuthGate>

      {shareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6">
            <h3 className="mb-4 text-lg font-semibold text-[#e0e0e0]">
              Share to Community
            </h3>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your meme a title..."
              className="mb-4 w-full rounded-lg border border-border bg-surface2 px-4 py-3 text-[#e0e0e0] placeholder:text-muted focus:border-accent focus:outline-none"
            />
            {error && (
              <p className="mb-4 text-sm text-red-400">{error}</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setShareModalOpen(false)}
                className="flex-1 rounded-lg border border-border py-2 font-medium text-muted transition-colors hover:bg-surface2"
              >
                Cancel
              </button>
              <button
                onClick={handlePost}
                disabled={posting || !title.trim()}
                className="flex-1 rounded-lg bg-accent py-2 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {posting ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
