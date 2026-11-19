// ============================================================
// FAN CLUB — Cricket Community, Social & Feed Types
// ============================================================

export interface CommunityComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
  likes: number;
}

export interface CommunityPollOption {
  id: string;
  text: string;
  votes: number;
}

export interface CommunityPost {
  id: string;
  authorId?: string;
  authorName?: string;
  authorRole?: string;
  authorAvatar?: string;
  author?: {
    id: string;
    name: string;
    role: string;
    isVerified: boolean;
  };
  isVerified?: boolean;
  category?: 'discussion' | 'prediction' | 'poll' | string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'scorecard';
  matchId?: string;
  playerId?: string;
  createdAt: string;
  likesCount: number;
  likedByMe?: boolean;
  isLiked?: boolean;
  commentsCount?: number;
  sharesCount?: number;
  comments: CommunityComment[];
  poll?: {
    question: string;
    options: CommunityPollOption[];
    totalVotes: number;
    userVotedOptionId?: string;
  };
  tags: string[];
}
