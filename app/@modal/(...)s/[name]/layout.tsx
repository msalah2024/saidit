import React from 'react'
import CommunityNotFound from '@/components/CommunityNotFound';
import { fetchCommunityByName } from '@/app/actions';
import { CommunityProvider } from '@/app/context/CommunityContext';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function Layout({ children, params }: any) {
    const awaitedParams = await params
    const communityName = awaitedParams.name

    const community = await fetchCommunityByName(communityName)

    if (!community.success) {
        return <CommunityNotFound />
    }

    return (
        <CommunityProvider community={community.data}>
            {children}
        </CommunityProvider>
    );
}
