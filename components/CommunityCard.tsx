import React, { memo } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import Link from 'next/link';

type Community = {
    community_name: string;
    description: string;
    image_url: string;
    banner_url: string;
    community_memberships: { count: number }[];
};

interface CommunityCardPros {
    community: Community
    counter: number
}

const CommunityCard = memo(function CommunityCard({ community, counter }: CommunityCardPros) {
    return (
        <div
            key={community.community_name}
            className='flex py-2 bg-black rounded-sm shadow-xl'
        >
            <div className='flex text-sm font-medium text-primary-foreground-muted items-center px-5'>
                <p>{counter++}</p>
            </div>
            <div className='flex gap-2 items-center'>
                <Avatar className="w-9 h-9 border-1 border-background">
                    <AvatarImage src={community.image_url || undefined} className='rounded-full' draggable={false} />
                    <AvatarFallback>s/</AvatarFallback>
                </Avatar>
                <div className='flex flex-col gap-y-0.5 pb-1 mr-2'>
                    <Link href={`/s/${community.community_name}`}
                        className='hover:underline w-fit text-sm font-medium overflow-hidden text-ellipsis line-clamp-1'>
                        s/{community.community_name}
                    </Link>
                    <small className="text-xs font-medium leading-none overflow-hidden text-ellipsis line-clamp-1">
                        {community.description}
                    </small>
                    <small className="text-xs font-medium text-muted-foreground leading-none">
                        {community.community_memberships[0].count}{" "}{community.community_memberships[0].count > 1 ? "members" : "member"}
                    </small>
                </div>
            </div>
        </div>
    )
})

export default CommunityCard
