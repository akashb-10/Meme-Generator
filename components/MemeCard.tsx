"use client";


type MemeCardProps = {
  meme: {
    id: string;
    title: string;
    imageUrl: string;
    createdAt: number;
    authorId: string;
  };
  upvoteCount: number;
  hasUpvoted: boolean;
  onUpvote: () => void;
  isAuthenticated: boolean;
};

export function MemeCard({
  meme,
  upvoteCount,
  hasUpvoted,
  onUpvote,
  isAuthenticated,
}: MemeCardProps) {
  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = meme.imageUrl;
    a.download = `meme-${meme.id}.jpg`;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.click();
  };

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface">
      <div className="relative aspect-square overflow-hidden bg-[#0a0a14]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={meme.imageUrl}
          alt={meme.title}
          className="h-full w-full object-contain"
        />
      </div>
      <div className="flex flex-col gap-2 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-[#e0e0e0]">
          {meme.title}
        </h3>
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onUpvote}
            disabled={!isAuthenticated}
            title={
              isAuthenticated
                ? hasUpvoted
                  ? "Remove upvote"
                  : "Upvote"
                : "Sign in to upvote"
            }
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
              hasUpvoted
                ? "bg-accent text-white"
                : "border border-border bg-surface2 text-muted hover:border-accent hover:text-accent"
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <span>▲</span>
            <span>{upvoteCount}</span>
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-accent hover:text-accent"
          >
            Download
          </button>
        </div>
      </div>
    </article>
  );
}
