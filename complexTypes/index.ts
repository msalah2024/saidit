import Comment from '@/components/Comment';
import { Database } from '@/database.types';

type User = Database['public']['Tables']['users']['Row'];
type CommunityMembership = Database['public']['Tables']['community_memberships']['Row'];
type Community = Database['public']['Tables']['communities']['Row'];
type CommunityModerator = Database['public']['Tables']['community_moderators']['Row'];
type Post = Database['public']['Tables']['posts']['Row'];
type PostAttachments = Database['public']['Tables']['post_attachments']['Row'];
type Comment = Database['public']['Tables']['comments']['Row'];

type VisitedPost = {
    title: string;
    created_at: string;
    slug: string;
    post_attachments: Pick<PostAttachments, 'file_url' | 'alt_text'>[] | null;
    communities: Pick<Community, 'community_name' | 'image_url'> | null;
    comments_count: number;
    upvote_count: number;
};

export type Profile = User & {
    community_memberships: (CommunityMembership & {
        communities: Community;
    })[] | null;
    recently_visited_communities: {
        visited_at: string;
        communities: Pick<Community, 'community_name' | 'image_url'> | null;
    }[] | null;
    recently_visited_posts: {
        visited_at: string;
        posts: VisitedPost | null;
    }[] | null;
};

export type CommunityWithDetails = Community & {
    users: User;
    community_moderators: CommunityModerator[];
    community_memberships: { count: number }[];
};

export type PostsWithAuthor = Post & {
    users?: {
        username: string | null
        avatar_url: string | null
    } | null
    posts_votes: { vote_type: 'upvote' | 'downvote', voter_id: string | null, id: string }[]
    post_attachments: PostAttachments[]
}

export type PostsWithAuthorAndCommunity = Post & {
    users?: {
        username: string | null
        avatar_url: string | null
        verified: boolean
    } | null
    posts_votes: { vote_type: 'upvote' | 'downvote', voter_id: string | null, id: string }[]
    post_attachments: PostAttachments[]
    communities: {
        community_name: string
        verified: boolean
        image_url: string | null
    }
    comments: { count: number }[]
    deleted: boolean
}

export type CommentWithAuthor = Comment & {
    users?: {
        username: string | null
        avatar_url: string | null
        verified: boolean
    } | null
    comments_votes: { vote_type: 'upvote' | 'downvote', voter_id: string | null, id: string }[]
}

export type PostsWithComments = Post & {
    users?: {
        username: string | null
        avatar_url: string | null
        verified: boolean
    } | null
    posts_votes: { vote_type: 'upvote' | 'downvote', voter_id: string | null, id: string }[]
    post_attachments: PostAttachments[]
    communities: {
        community_name: string
        verified: boolean
        image_url: string | null
    }
    comments: { count: number }[]
    deleted: boolean
}


// non database imported types
export type NormalizedComment = {
    id: string;
    author: {
        username: string | null;
        avatar_url: string | null;
        verified: boolean;
    };
    creator_id: string | null,
    content: string;
    stripped_content: string
    createdAt: string;
    updatedAt: string | null;
    replies?: NormalizedComment[];
    isOP?: boolean;
    comments_votes: { vote_type: 'upvote' | 'downvote', voter_id: string | null, id: string }[]
    deleted: boolean
    slug: string
}

export type FlatComment = NormalizedComment & {
    replyingTo?: NormalizedComment;
}