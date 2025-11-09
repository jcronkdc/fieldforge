import { useCallback, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { Button } from "../ui/Button";
import { FeedEvent } from "../../lib/types";
import {
  likeFeedEvent,
  unlikeFeedEvent,
  fetchFeedComments,
  addFeedComment,
  repostFeedEvent,
  undoRepostFeedEvent,
  type FeedCommentPayload,
} from "../../lib/feed";

interface FeedCardProps {
  event: FeedEvent;
  currentUserId: string | null;
  onOpenSession?: (sessionId: string) => void;
  onRequireAuth?: () => void;
}

function formatTimestamp(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const now = Date.now();
  const diff = now - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;

  if (diff < minute) return "Just now";
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  if (diff < week) return `${Math.floor(diff / day)}d ago`;
  
  // Use more concise date format for older posts
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
  });
}

function eventLabel(eventType: string) {
  switch (eventType) {
    case "angry_lips_published":
      return "Angry Lips";
    case "story_branch_created":
      return "Story Branch";
    case "chapter_added":
      return "Chapter";
    case "story_saved":
      return "Story Update";
    case "comment_added":
      return "Comment";
    case "connection_accepted":
      return "BookWorm";
    default:
      return "Activity";
  }
}

export function FeedCard({ event, currentUserId, onOpenSession, onRequireAuth }: FeedCardProps) {
  const { actor, metadata } = event;
  const sessionId = typeof metadata.sessionId === "string" ? metadata.sessionId : null;
  const [likeCount, setLikeCount] = useState(event.likeCount);
  const [liked, setLiked] = useState(event.likedByCurrentUser);
  const [likeBusy, setLikeBusy] = useState(false);
  const [repostCount, setRepostCount] = useState(event.repostCount);
  const [reposted, setReposted] = useState(event.repostedByCurrentUser);
  const [repostBusy, setRepostBusy] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [comments, setComments] = useState<FeedCommentPayload[]>([]);
  const [commentBody, setCommentBody] = useState("");
  const [commentError, setCommentError] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [commentCount, setCommentCount] = useState(event.commentCount);

  useEffect(() => {
    setLikeCount(event.likeCount);
    setLiked(event.likedByCurrentUser);
    setRepostCount(event.repostCount);
    setReposted(event.repostedByCurrentUser);
    setCommentCount(event.commentCount);
  }, [event.id, event.likeCount, event.likedByCurrentUser, event.repostCount, event.repostedByCurrentUser, event.commentCount]);

  const handleRequireAuth = useCallback(() => {
    if (!currentUserId) {
      onRequireAuth?.();
      return false;
    }
    return true;
  }, [currentUserId, onRequireAuth]);

  const toggleLike = async () => {
    if (!handleRequireAuth() || likeBusy) return;
    setLikeBusy(true);
    try {
      const result = liked
        ? await unlikeFeedEvent(event.id, currentUserId!)
        : await likeFeedEvent(event.id, currentUserId!);
      setLikeCount(result.likeCount);
      setLiked(result.liked);
    } catch (error) {
      console.error("like toggle failed", error);
    } finally {
      setLikeBusy(false);
    }
  };

  const toggleRepost = async () => {
    if (!handleRequireAuth() || repostBusy) return;
    setRepostBusy(true);
    try {
      const result = reposted
        ? await undoRepostFeedEvent(event.id, currentUserId!)
        : await repostFeedEvent(event.id, currentUserId!);
      setRepostCount(result.repostCount);
      setReposted(result.reposted);
    } catch (error) {
      console.error("repost toggle failed", error);
    } finally {
      setRepostBusy(false);
    }
  };

  const loadComments = async () => {
    setCommentsLoading(true);
    setCommentError(null);
    try {
      const { items } = await fetchFeedComments(event.id, 50, 0);
      setComments(items);
      setCommentCount((prev) => Math.max(prev, items.length));
    } catch (error) {
      setCommentError(error instanceof Error ? error.message : "Failed to load comments");
    } finally {
      setCommentsLoading(false);
    }
  };

  const toggleComments = async () => {
    if (!commentsOpen && comments.length === 0) {
      await loadComments();
    }
    setCommentsOpen((prev) => !prev);
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handleRequireAuth()) return;
    if (!commentBody.trim()) return;
    try {
      const { comment } = await addFeedComment(event.id, currentUserId!, commentBody.trim());
      setComments((prev) => [comment, ...prev]);
      setCommentBody("");
      setCommentCount((prev) => prev + 1);
    } catch (error) {
      setCommentError(error instanceof Error ? error.message : "Failed to add comment");
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?feedEvent=${encodeURIComponent(event.id)}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: event.title ?? "MythaTron", url: shareUrl });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
      }
    } catch (error) {
      console.error("share failed", error);
    }
  };

  const actorLabel = actor?.displayName ?? actor?.username ?? eventLabel(event.eventType);
  const timestamp = formatTimestamp(event.createdAt);

  return (
    <article className="rounded-3xl border border-slate-800/80 bg-black/40 p-5 shadow-sm transition hover:border-aurora/30">
      <header className="flex items-start gap-3">
        <div
          className={clsx(
            "flex h-11 w-11 items-center justify-center rounded-full border border-slate-800 bg-black/40 text-xs uppercase tracking-wide",
            actor?.avatarUrl && "border-transparent bg-transparent"
          )}
        >
          {actor?.avatarUrl ? (
            <img src={actor.avatarUrl} alt={actorLabel} className="h-11 w-11 rounded-full object-cover" />
          ) : (
            <span>{eventLabel(event.eventType).slice(0, 2)}</span>
          )}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-xs uppercase tracking-wide text-aurora-200">{eventLabel(event.eventType)}</span>
            <h3 className="text-sm font-semibold text-white">{actorLabel}</h3>
            {actor?.username ? <span className="text-xs text-slate-500">@{actor.username}</span> : null}
            <span className="text-xs text-slate-500">{timestamp}</span>
          </div>
          {event.title ? <p className="mt-2 text-sm font-semibold text-slate-100">{event.title}</p> : null}
          {event.body ? <p className="mt-2 whitespace-pre-line text-sm text-slate-300">{event.body}</p> : null}

          {sessionId ? (
            <div className="mt-3">
              <Button type="button" size="sm" variant="primary" onClick={() => onOpenSession?.(sessionId)}>
                View session
              </Button>
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <button
              type="button"
              className={clsx(
                "flex items-center gap-1 rounded-full border px-3 py-1 transition",
                liked ? "border-aurora/40 bg-aurora/10 text-aurora-100" : "border-slate-800 bg-black/40 hover:border-aurora/40 hover:text-aurora-100"
              )}
              onClick={toggleLike}
              disabled={likeBusy}
            >
              <span>♥</span>
              <span>{likeCount}</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-1 rounded-full border border-slate-800 bg-black/40 px-3 py-1 transition hover:border-aurora/40 hover:text-aurora-100"
              onClick={toggleComments}
            >
              💬<span>{commentCount}</span>
            </button>
            <button
              type="button"
              className={clsx(
                "flex items-center gap-1 rounded-full border px-3 py-1 transition",
                reposted ? "border-aurora/40 bg-aurora/10 text-aurora-100" : "border-slate-800 bg-black/40 hover:border-aurora/40 hover:text-aurora-100"
              )}
              onClick={toggleRepost}
              disabled={repostBusy}
            >
              ⟳<span>{repostCount}</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-1 rounded-full border border-slate-800 bg-black/40 px-3 py-1 transition hover:border-aurora/40 hover:text-aurora-100"
              onClick={handleShare}
            >
              ↗<span>{shareCopied ? "Copied" : "Share"}</span>
            </button>
          </div>

          {commentsOpen ? (
            <div className="mt-4 space-y-3 rounded-3xl border border-slate-800/60 bg-black/30 p-4">
              <form className="space-y-2" onSubmit={handleCommentSubmit}>
                <textarea
                  value={commentBody}
                  onChange={(e) => setCommentBody(e.target.value)}
                  rows={2}
                  placeholder={currentUserId ? "Add a comment" : "Sign in to comment"}
                  disabled={!currentUserId}
                  className="w-full rounded-2xl border border-slate-800 bg-black/60 px-3 py-2 text-sm text-white focus:border-aurora focus:outline-none focus:ring-2 focus:ring-aurora/40"
                />
                <div className="flex items-center justify-between text-xs text-slate-500">
                  {commentError ? <span className="text-rose-300">{commentError}</span> : <span>{commentBody.length}/280</span>}
                  <Button type="submit" size="sm" variant="secondary" disabled={!currentUserId || !commentBody.trim()}>
                    Post comment
                  </Button>
                </div>
              </form>
              {commentsLoading ? (
                <p className="text-xs text-slate-400">Loading comments…</p>
              ) : comments.length ? (
                <ul className="space-y-3 text-sm text-slate-200">
                  {comments.map((comment) => (
                    <li key={comment.id} className="rounded-2xl border border-slate-800/60 bg-black/40 px-3 py-2">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="font-semibold text-slate-200">{comment.actor?.displayName ?? comment.actor?.username ?? "BookWorm"}</span>
                        {comment.actor?.username ? <span>@{comment.actor.username}</span> : null}
                        <span>{formatTimestamp(comment.createdAt)}</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-200">{comment.body}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400">No comments yet.</p>
              )}
            </div>
          ) : null}
        </div>
      </header>
    </article>
  );
}


