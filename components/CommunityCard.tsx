"use client"
import React, { memo } from 'react'
import { useRouter } from 'nextjs-toploader/app'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

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
    const router = useRouter()

    return (
        <div
            key={community.community_name}
            className='flex gap-2'
        >
            <div className='flex items-center pr-2'>
                <p>{counter++}</p>
            </div>
            <div className='flex flex-col gap-1 justify-center border cursor-pointer rounded-md w-[300px]'
                onClick={() => {
                    router.push(`/s/${community.community_name}`)
                }}
            >
                <div className='w-full'>
                    <div
                        className={`h-8 bg-cover relative bg-center rounded-t-sm bg-no-repeat bg-gradient-to-r ${!community.banner_url && "from-[oklch(67.59%_0.1591_140.34)] to-[oklch(55%_0.17_230)]"}`}
                        style={community.banner_url ? { backgroundImage: `url(${community.banner_url})` } : undefined}
                    >
                        <div className='flex gap-1 items-center absolute top-5 left-2'>
                            <Avatar className="w-8 h-8 border-2 border-background">
                                <AvatarImage src={community.image_url || undefined} className='rounded-full' draggable={false} />
                                <AvatarFallback>s/</AvatarFallback>
                            </Avatar>
                        </div>
                        <div className='pl-11 pt-9 flex gap-2 items-center justify-between'>
                            <p className='text-sm font-medium overflow-hidden text-ellipsis whitespace-nowrap'>
                                s/{community.community_name}</p>
                            <small className="text-xs font-medium text-muted-foreground leading-none px-2">
                                {community.community_memberships[0].count}{" "}{community.community_memberships[0].count > 1 ? "members" : "member"}
                            </small>
                        </div>
                    </div>
                </div>
                <small className="text-xs mt-6 mx-4 pb-1 mb-2 font-medium leading-none overflow-hidden text-ellipsis whitespace-nowrap">
                    {community.description}
                </small>
            </div>
        </div>
    )
})

export default CommunityCard
