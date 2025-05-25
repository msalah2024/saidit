import { Database } from '@/database.types';

type User = Database['public']['Tables']['users']['Row'];
type CommunityMembership = Database['public']['Tables']['community_memberships']['Row'];
type Community = Database['public']['Tables']['communities']['Row'];


export type Profile = User & {
    community_memberships: (CommunityMembership & {
        communities: Community
    })[];
};
