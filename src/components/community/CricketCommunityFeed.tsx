// ============================================================
// FAN CLUB — Cricket Social Community & Fan Feed
// Discussions, polls, quizzes, and player following
// ============================================================
import React, { useState, useEffect } from 'react';
import type { CommunityPost } from '../../types/community';
import { db } from '../../db/database';
import { 
  MessageSquare, 
  Heart, 
  Share2, 
  Send, 
  Sparkles, 
  TrendingUp, 
  CheckCircle2, 
  Flame, 
  Award, 
  BarChart2, 
  User as UserIcon,
  Plus
} from 'lucide-react';

export const CricketCommunityFeed: React.FC = () => {
  const [posts, setPosts] = useState<CommunityPost[]>(db.getCommunityPosts());
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState<'discussion' | 'prediction' | 'poll'>('discussion');
  const [pollOptions, setPollOptions] = useState<string[]>(['Option 1', 'Option 2']);
  const [currentUser] = useState(() => db.getCurrentUser());

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setPosts(db.getCommunityPosts());
    });
    return () => unsub();
  }, []);

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    let pollData = undefined;
    if (newPostCategory === 'poll' && pollOptions.filter((o) => o.trim()).length >= 2) {
      pollData = {
        question: newPostContent,
        totalVotes: 0,
        options: pollOptions.filter((o) => o.trim()).map((text, idx) => ({
          id: `opt-${idx + 1}`,
          text,
          votes: 0,
        })),
      };
    }

    const post: CommunityPost = {
      id: `post-${Date.now()}`,
      author: {
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.role,
        isVerified: currentUser.role === 'super_admin' || currentUser.role === 'admin',
      },
      content: newPostContent,
      category: newPostCategory,
      poll: pollData,
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      createdAt: new Date().toISOString(),
      tags: ['Cricket', 'FanClub'],
      comments: [],
    };

    db.addCommunityPost(post);
    setNewPostContent('');
    setPollOptions(['Option 1', 'Option 2']);
  };

  const handleLikePost = (postId: string) => {
    const updated = posts.map((p) => {
      if (p.id === postId) {
        return {
          ...p,
          likesCount: p.isLiked ? p.likesCount - 1 : p.likesCount + 1,
          isLiked: !p.isLiked,
        };
      }
      return p;
    });
    setPosts(updated);
  };

  const handleVotePoll = (postId: string, optionId: string) => {
    const updated = posts.map((p) => {
      if (p.id === postId && p.poll) {
        const votedAlready = p.poll.userVotedOptionId != null;
        if (votedAlready) return p;

        return {
          ...p,
          poll: {
            ...p.poll,
            totalVotes: p.poll.totalVotes + 1,
            userVotedOptionId: optionId,
            options: p.poll.options.map((opt) =>
              opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
            ),
          },
        };
      }
      return p;
    });
    setPosts(updated);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-slate-100">
      {/* Top Banner */}
      <div className="pb-6 border-b border-slate-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black tracking-widest uppercase mb-2">
          <MessageSquare size={13} /> FAN CLUB CRICKET PAVILION
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">Cricket Community & Banter</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Discuss international battles, local club rivalries, match predictions, and fan polls.
        </p>
      </div>

      {/* Post Creator Box */}
      <div className="mt-6 p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <form onSubmit={handleCreatePost}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center flex-shrink-0 border border-emerald-500/30">
              {currentUser.name.charAt(0)}
            </div>
            <div className="flex-1">
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="What's your take on today's match? Ask a question or share analysis..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />

              {/* Poll Options builder if category is poll */}
              {newPostCategory === 'poll' && (
                <div className="mt-3 space-y-2 p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-xs font-bold text-slate-400">Poll Options:</div>
                  {pollOptions.map((opt, i) => (
                    <input
                      key={i}
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const copy = [...pollOptions];
                        copy[i] = e.target.value;
                        setPollOptions(copy);
                      }}
                      placeholder={`Option ${i + 1}`}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => setPollOptions([...pollOptions, `Option ${pollOptions.length + 1}`])}
                    className="text-xs text-emerald-400 font-bold hover:underline"
                  >
                    + Add Option
                  </button>
                </div>
              )}

              <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1">
                  {(['discussion', 'prediction', 'poll'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewPostCategory(cat)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-colors ${
                        newPostCategory === cat
                          ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={!newPostContent.trim()}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all disabled:opacity-40"
                >
                  <Send size={13} />
                  <span>Publish</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Posts List */}
      <div className="mt-6 space-y-5">
        {posts.map((post) => (
          <div
            key={post.id}
            className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-slate-750 transition-colors shadow-lg"
          >
            {/* Author Meta */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-emerald-400 text-sm">
                  {(post.author?.name || post.authorName || 'C').charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-sm text-white">
                      {post.author?.name || post.authorName || 'Cricket Fan'}
                    </span>
                    {(post.author?.isVerified || post.isVerified) && (
                      <CheckCircle2 size={14} className="text-emerald-400" />
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-slate-400 uppercase font-bold">
                {post.category}
              </span>
            </div>

            {/* Post Content */}
            <p className="mt-3 text-sm text-slate-200 leading-relaxed">{post.content}</p>

            {/* Interactive Poll if attached */}
            {post.poll && (
              <div className="mt-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                {post.poll.options.map((opt) => {
                  const percent =
                    post.poll!.totalVotes > 0
                      ? Math.round((opt.votes / post.poll!.totalVotes) * 100)
                      : 0;
                  const isVoted = post.poll!.userVotedOptionId === opt.id;

                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleVotePoll(post.id, opt.id)}
                      className={`relative p-3 rounded-xl border transition-all cursor-pointer overflow-hidden ${
                        isVoted
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-slate-800 hover:border-slate-700 bg-slate-900'
                      }`}
                    >
                      {/* Percent Fill */}
                      <div
                        className="absolute inset-y-0 left-0 bg-emerald-500/15 pointer-events-none transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                      <div className="relative flex items-center justify-between text-xs font-bold text-white z-10">
                        <span>{opt.text}</span>
                        <span>{percent}% ({opt.votes})</span>
                      </div>
                    </div>
                  );
                })}
                <div className="text-[10px] text-slate-500 text-right mt-1 font-mono">
                  Total Votes: {post.poll.totalVotes}
                </div>
              </div>
            )}

            {/* Action Buttons Footer */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <button
                onClick={() => handleLikePost(post.id)}
                className={`flex items-center gap-1.5 font-bold transition-colors ${
                  post.isLiked ? 'text-red-400' : 'hover:text-red-400'
                }`}
              >
                <Heart size={14} className={post.isLiked ? 'fill-red-400' : ''} />
                <span>{post.likesCount}</span>
              </button>

              <button className="flex items-center gap-1.5 hover:text-white transition-colors">
                <MessageSquare size={14} />
                <span>{post.commentsCount} Comments</span>
              </button>

              <button className="flex items-center gap-1.5 hover:text-white transition-colors">
                <Share2 size={14} />
                <span>Share</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
