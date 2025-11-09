import { useState, useEffect, useRef, useCallback } from "react";
import clsx from "clsx";
import { formatDistanceToNow } from "../../lib/utils";
import { Button } from "../ui/Button";

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: 'text' | 'image' | 'file' | 'system';
  createdAt: string;
  editedAt?: string;
  senderUsername?: string;
  senderDisplayName?: string;
  senderAvatarUrl?: string;
  reactions?: Array<{
    reaction: string;
    count: number;
    hasReacted: boolean;
  }>;
}

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
  onReaction?: (messageId: string, reaction: string) => void;
}

function MessageBubble({ 
  message, 
  isOwn, 
  showSender,
  onReaction 
}: { 
  message: Message; 
  isOwn: boolean;
  showSender: boolean;
  onReaction?: (reaction: string) => void;
}) {
  const [showReactions, setShowReactions] = useState(false);
  const commonReactions = ['👍', '❤️', '😂', '🔥', '👏'];

  if (message.messageType === 'system') {
    return (
      <div className="flex justify-center my-4">
        <span className="text-xs text-slate-500 bg-slate-900/50 px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div className={clsx("flex gap-3 group", isOwn ? "flex-row-reverse" : "flex-row")}>
      {!isOwn && showSender && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-aurora to-aurora-200 flex items-center justify-center text-xs font-semibold text-black shrink-0">
          {message.senderAvatarUrl ? (
            <img 
              src={message.senderAvatarUrl} 
              alt={message.senderDisplayName || message.senderUsername}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            (message.senderDisplayName || message.senderUsername || 'U').charAt(0).toUpperCase()
          )}
        </div>
      )}
      
      <div className={clsx("max-w-[70%] space-y-1", isOwn && "items-end")}>
        {!isOwn && showSender && (
          <div className="text-xs text-slate-400 px-1">
            {message.senderDisplayName || message.senderUsername}
          </div>
        )}
        
        <div className="relative">
          <div className={clsx(
            "px-4 py-2 rounded-2xl break-words",
            isOwn 
              ? "bg-aurora/20 text-white border border-aurora/30" 
              : "bg-slate-800/60 text-slate-100"
          )}>
            <p className="text-sm">{message.content}</p>
            {message.editedAt && (
              <span className="text-[10px] text-slate-500 ml-2">(edited)</span>
            )}
          </div>
          
          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="absolute -bottom-3 left-2 flex gap-1">
              {message.reactions.map((r) => (
                <button
                  key={r.reaction}
                  onClick={() => onReaction?.(r.reaction)}
                  className={clsx(
                    "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs",
                    r.hasReacted 
                      ? "bg-aurora/20 border border-aurora/40" 
                      : "bg-slate-800/80 border border-slate-700 hover:bg-slate-700/80"
                  )}
                >
                  <span>{r.reaction}</span>
                  <span className="text-[10px] text-slate-400">{r.count}</span>
                </button>
              ))}
            </div>
          )}
          
          {/* Quick reactions on hover */}
          <div className={clsx(
            "absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity",
            isOwn ? "-left-32" : "-right-32"
          )}>
            {showReactions && (
              <div className="flex gap-1 p-1 bg-slate-900 rounded-lg shadow-xl border border-slate-800">
                {commonReactions.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      onReaction?.(emoji);
                      setShowReactions(false);
                    }}
                    className="w-7 h-7 flex items-center justify-center hover:bg-slate-800 rounded transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => setShowReactions(!showReactions)}
              className="w-7 h-7 flex items-center justify-center bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors"
            >
              😊
            </button>
          </div>
        </div>
        
        <div className={clsx("text-[10px] text-slate-500 px-1", isOwn && "text-right")}>
          {formatDistanceToNow(message.createdAt)}
        </div>
      </div>
    </div>
  );
}

export function MessageList({ 
  messages, 
  currentUserId, 
  onLoadMore, 
  hasMore, 
  loading,
  onReaction 
}: MessageListProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const prevMessageCount = useRef(messages.length);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (autoScroll && messages.length > prevMessageCount.current) {
      scrollContainerRef.current?.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
    prevMessageCount.current = messages.length;
  }, [messages.length, autoScroll]);

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    
    // Check if scrolled to top for loading more
    if (scrollTop === 0 && hasMore && !loading) {
      onLoadMore?.();
    }
    
    // Check if at bottom for auto-scroll
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    setAutoScroll(isAtBottom);
  }, [hasMore, loading, onLoadMore]);

  return (
    <div 
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto p-4 space-y-4"
    >
      {hasMore && (
        <div className="flex justify-center py-2">
          {loading ? (
            <span className="text-xs text-slate-500">Loading messages...</span>
          ) : (
            <Button size="sm" variant="ghost" onClick={onLoadMore}>
              Load earlier messages
            </Button>
          )}
        </div>
      )}
      
      {messages.map((message, index) => {
        const isOwn = message.senderId === currentUserId;
        const prevMessage = index > 0 ? messages[index - 1] : null;
        const showSender = !isOwn && (!prevMessage || prevMessage.senderId !== message.senderId);
        
        return (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={isOwn}
            showSender={showSender}
            onReaction={(reaction) => onReaction?.(message.id, reaction)}
          />
        );
      })}
      
      {messages.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center h-full text-slate-500">
          <span className="text-4xl mb-2">💬</span>
          <p className="text-sm">No messages yet</p>
          <p className="text-xs">Start the conversation!</p>
        </div>
      )}
    </div>
  );
}
