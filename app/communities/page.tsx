import React from 'react'
import { fetchAllCommunities } from '../actions'
import CommunityCard from '@/components/CommunityCard'

export default async function Page() {
    const communities = await fetchAllCommunities()
    let counter = 1

    return (
        <div className='flex flex-col text-primary-foreground-muted items-center p-8'>
            <div>
                <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                    Saidit Communities
                </h3>
            </div>
            <div className='flex flex-col gap-4 mt-12 w-full max-w-7xl'>
                <div>
                    <p>All Communities</p>
                    <small className="text-sm font-medium text-muted-foreground leading-none">Browse Saidit communities</small>
                </div>
                <div className='grid grid-cols-[repeat(auto-fit,minmax(19rem,1fr))] gap-3'>
                    {
                        communities.data?.map((community) => (
                            <CommunityCard key={community.community_name} community={community} counter={counter++} />
                        ))
                    }
                </div>
            </div>
        </div>
    )
}
