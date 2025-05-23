import React from 'react'
import CommunityNotFound from '@/components/CommunityNotFound';
import { CommunityProvider } from '../../context/CommunityContext';
import { fetchCommunityByName } from '../../actions';
import CommunityHeader from '@/components/CommunityHeader';
import CommunityRightSide from '@/components/CommunityRightSide';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function Layout({ children, params }: any) {
    const awaitedParams = await params
    const communityName = awaitedParams.name

    const community = await fetchCommunityByName(communityName)
    console.log(community.data)

    if (!community.success) {
        return <CommunityNotFound />
    }

    return (
        <CommunityProvider community={community.data}>
            <div className='lg:mx-8'>
                <CommunityHeader />
                <div className='flex gap-4'>
                    <div className='w-full mt-4 mx-4'>
                        {children}
                    </div>
                    <div className='w-96 hidden lg:flex'>
                        <CommunityRightSide />
                    </div>
                </div>
            </div>
        </CommunityProvider>
    );
}
