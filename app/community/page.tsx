"use client";

import { useMemo } from "react";
import { db, id } from "@/lib/db";
import { MemeCard } from "@/components/MemeCard";

export default function CommunityPage() {
  const { isLoading, error, data } = db.useQuery({
    memes: {
      $: { order: { createdAt: "desc" } },
    },
    upvotes: {},
  });

  const { user } = db.useAuth();

  const { memesWithCounts, upvotesByMeme } = useMemo(() => {
    const memes = data?.memes ?? [];
    const upvotes = data?.upvotes ?? [];

    const upvotesByMeme: Record<string, { count: number; userUpvoted: boolean }> = {};
    for (const m of memes) {
      upvotesByMeme[m.id] = { count: 0, userUpvoted: false };
    }
    for (const u of upvotes) {
      if (upvotesByMeme[u.memeId]) {
        upvotesByMeme[u.memeId].count += 1;
        if (user?.id && u.userId === user.id) {
          upvotesByMeme[u.memeId].userUpvoted = true;
        }
      }
    }

    return {
      memesWithCounts: memes.map((m) => ({
        ...m,
        upvoteCount: upvotesByMeme[m.id]?.count ?? 0,
        hasUpvoted: upvotesByMeme[m.id]?.userUpvoted ?? false,
      })),
      upvotesByMeme,
    };
  }, [data?.memes, data?.upvotes, user?.id]);

  const handleUpvote = async (memeId: string, hasUpvoted: boolean) => {
    if (!user?.id) return;

    const existingUpvote = (data?.upvotes ?? []).find(
      (u) => u.memeId === memeId && u.userId === user.id
    );

    if (hasUpvoted && existingUpvote) {
      await db.transact([db.tx.upvotes[existingUpvote.id].delete()]);
    } else if (!hasUpvoted) {
      await db.transact([
        db.tx.upvotes[id()].update({
          memeId,
          userId: user.id,
        }),
      ]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <span className="text-muted">Loading memes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-red-400">Error: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-53px)] p-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-6 text-xl font-bold text-[#e0e0e0]">
          Community Memes
        </h2>

        {!user && (
          <div className="mb-6 rounded-lg border border-border bg-surface p-4 text-center text-sm text-muted">
            Sign in to upvote memes
          </div>
        )}

        {memesWithCounts.length === 0 ? (
          <div className="flex min-h-[30vh] flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-surface/50">
            <p className="text-muted">No memes yet. Be the first to share!</p>
            <a
              href="/create"
              className="rounded-lg bg-accent px-4 py-2 font-semibold text-white transition-opacity hover:opacity-90"
            >
              Create a meme
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {memesWithCounts.map((meme) => (
              <MemeCard
                key={meme.id}
                meme={meme}
                upvoteCount={meme.upvoteCount}
                hasUpvoted={meme.hasUpvoted}
                onUpvote={() =>
                  handleUpvote(meme.id, meme.hasUpvoted)
                }
                isAuthenticated={!!user}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
