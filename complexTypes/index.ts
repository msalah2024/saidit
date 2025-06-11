import { Database } from '@/database.types';

type User = Database['public']['Tables']['users']['Row'];
type CommunityMembership = Database['public']['Tables']['community_memberships']['Row'];
type Community = Database['public']['Tables']['communities']['Row'];
type CommunityModerator = Database['public']['Tables']['community_moderators']['Row'];
type Post = Database['public']['Tables']['posts']['Row'];

export type Profile = User & {
    community_memberships: (CommunityMembership & {
        communities: Community
    })[];
};


export type CommunityWithDetails = Community & {
    users: User;
    community_moderators: CommunityModerator[];
    community_memberships: { count: number }[];
};

export type PostsWithAuthor = Post & {
    users: {
        username: string | null
        avatar_url: string | null
    } | null
    posts_votes: { vote_type: 'upvote' | 'downvote', voter_id: string | null, id: string }[]
}
