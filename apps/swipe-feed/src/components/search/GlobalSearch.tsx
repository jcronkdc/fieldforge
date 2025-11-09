/**
 * Global Search Component
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDebounce } from '../../hooks/useDebounce';

interface SearchResult {
  id: string;
  type: 'user' | 'story' | 'session' | 'tag';
  title: string;
  subtitle?: string;
  avatar?: string;
  url: string;
}

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const debouncedQuery = useDebounce(query, 300);

  // Load recent searches
  useEffect(() => {
    const saved = localStorage.getItem('mythatron_recent_searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Search when query changes
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    
    // Simulate search results
    setTimeout(() => {
      const mockResults: SearchResult[] = [
        {
          id: '1',
          type: 'user',
          title: 'Justin Cronk',
          subtitle: '@MythaTron • Founder',
          url: '#profile/mythatron',
        },
        {
          id: '2',
          type: 'story',
          title: 'Welcome to MythaTron',
          subtitle: 'Pinned post by @MythaTron',
          url: '#feed',
        },
        {
          id: '3',
          type: 'session',
          title: 'Epic Space Adventure',
          subtitle: 'Angry Lips session • 5 players',
          url: '#angry-lips/session-123',
        },
        {
          id: '4',
          type: 'tag',
          title: '#CreativeRevolution',
          subtitle: '42 posts',
          url: '#tag/creativerevolution',
        },
      ].filter(r => 
        r.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        (r.subtitle && r.subtitle.toLowerCase().includes(debouncedQuery.toLowerCase()))
      );

      setResults(mockResults);
      setLoading(false);
    }, 500);
  }, [debouncedQuery]);

  const handleSearch = (searchTerm: string) => {
    // Save to recent searches
    const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('mythatron_recent_searches', JSON.stringify(updated));
    
    setQuery('');
    setIsOpen(false);
  };

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'user':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="8" r="4"/>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          </svg>
        );
      case 'story':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
        );
      case 'session':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        );
      case 'tag':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18"/>
          </svg>
        );
    }
  };

  return (
    <>
      {/* Search Button */}
      <button
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 100);
        }}
        className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg transition-all"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/60">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
        </svg>
        <span className="text-sm text-white/60">Search</span>
        <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs bg-white/10 rounded border border-white/20">
          ⌘K
        </kbd>
      </button>

      {/* Search Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4">
          <div ref={searchRef} className="w-full max-w-2xl">
            {/* Search Input */}
            <div className="bg-black/90 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
              <div className="flex items-center gap-3 p-4 border-b border-white/10">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/60">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="M21 21l-4.35-4.35"/>
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search users, stories, sessions, tags..."
                  className="flex-1 bg-transparent outline-none text-white placeholder-white/40"
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="p-1 hover:bg-white/10 rounded transition-all"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/60">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-xs text-white/40 hover:text-white/60"
                >
                  ESC
                </button>
              </div>

              {/* Results */}
              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="inline-block w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : results.length > 0 ? (
                  <div className="py-2">
                    {results.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => {
                          window.location.hash = result.url;
                          handleSearch(result.title);
                        }}
                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-all text-left"
                      >
                        <div className="p-2 bg-white/5 rounded-lg text-white/60">
                          {getIcon(result.type)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{result.title}</p>
                          {result.subtitle && (
                            <p className="text-xs text-white/40">{result.subtitle}</p>
                          )}
                        </div>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/20">
                          <polyline points="9 10 4 15 9 20"/>
                          <path d="M20 4v7a4 4 0 0 1-4 4H4"/>
                        </svg>
                      </button>
                    ))}
                  </div>
                ) : query.length >= 2 ? (
                  <div className="p-8 text-center text-white/40">
                    No results found for "{query}"
                  </div>
                ) : recentSearches.length > 0 ? (
                  <div className="p-4">
                    <p className="text-xs text-white/40 mb-3">Recent searches</p>
                    <div className="space-y-2">
                      {recentSearches.map((search, index) => (
                        <button
                          key={index}
                          onClick={() => setQuery(search)}
                          className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                          </svg>
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-white/40">
                    Start typing to search...
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => setQuery('#')}
                className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-white/60 hover:text-white transition-all"
              >
                Search tags
              </button>
              <button
                onClick={() => setQuery('@')}
                className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-white/60 hover:text-white transition-all"
              >
                Search users
              </button>
              <button
                onClick={() => setQuery('story:')}
                className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-white/60 hover:text-white transition-all"
              >
                Search stories
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
