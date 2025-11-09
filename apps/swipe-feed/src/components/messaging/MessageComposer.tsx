import { useState, useRef, useEffect } from "react";
import clsx from "clsx";
import { Button } from "../ui/Button";

interface MessageComposerProps {
  onSend: (content: string) => void;
  onTyping?: (isTyping: boolean) => void;
  disabled?: boolean;
  placeholder?: string;
  typingUsers?: Array<{ username: string; displayName?: string }>;
}

export function MessageComposer({ 
  onSend, 
  onTyping, 
  disabled, 
  placeholder = "Type a message...",
  typingUsers = []
}: MessageComposerProps) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [message]);

  // Handle typing indicator
  useEffect(() => {
    if (message && !isTyping) {
      setIsTyping(true);
      onTyping?.(true);
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    if (message) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        onTyping?.(false);
      }, 3000);
    } else if (isTyping) {
      setIsTyping(false);
      onTyping?.(false);
    }
    
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message, isTyping, onTyping]);

  const handleSend = () => {
    if (!message.trim() || disabled) return;
    
    onSend(message.trim());
    setMessage("");
    setIsTyping(false);
    onTyping?.(false);
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Format typing indicator text
  const getTypingText = () => {
    if (typingUsers.length === 0) return null;
    
    const names = typingUsers.map(u => u.displayName || u.username).slice(0, 3);
    
    if (names.length === 1) {
      return `${names[0]} is typing...`;
    } else if (names.length === 2) {
      return `${names.join(' and ')} are typing...`;
    } else if (typingUsers.length > 3) {
      return `${names.slice(0, 2).join(', ')} and ${typingUsers.length - 2} others are typing...`;
    } else {
      return `${names.join(', ')} are typing...`;
    }
  };

  const typingText = getTypingText();

  return (
    <div className="border-t border-slate-800 bg-black/60">
      {/* Typing indicator */}
      {typingText && (
        <div className="px-4 py-2 text-xs text-slate-500 flex items-center gap-2">
          <span className="inline-flex gap-1">
            <span className="w-1 h-1 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1 h-1 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1 h-1 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </span>
          {typingText}
        </div>
      )}
      
      {/* Composer */}
      <div className="p-4 flex gap-3">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className={clsx(
              "w-full px-4 py-2 rounded-2xl bg-slate-900/60 border border-slate-800",
              "text-sm text-white placeholder-slate-500 resize-none",
              "focus:outline-none focus:border-aurora/50 transition-colors",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            style={{ minHeight: '40px' }}
          />
          
          {/* Character count */}
          {message.length > 400 && (
            <span className={clsx(
              "absolute bottom-2 right-3 text-[10px]",
              message.length > 500 ? "text-rose-400" : "text-slate-500"
            )}>
              {message.length}/500
            </span>
          )}
        </div>
        
        {/* Quick actions */}
        <div className="flex items-end gap-2">
          {/* Emoji picker placeholder */}
          <button
            className="w-10 h-10 rounded-xl bg-slate-800/60 hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            title="Add emoji"
            disabled={disabled}
          >
            😊
          </button>
          
          {/* Send button */}
          <Button
            onClick={handleSend}
            disabled={!message.trim() || disabled || message.length > 500}
            size="sm"
            variant="primary"
            className="px-4"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}
