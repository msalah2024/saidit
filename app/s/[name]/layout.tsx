import React from 'react'
import CommunityNotFound from '@/components/CommunityNotFound';
import { CommunityProvider } from '../../context/CommunityContext';
import { fetchCommunityByName } from '../../actions';

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
