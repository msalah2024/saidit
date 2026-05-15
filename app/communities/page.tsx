import React, { Suspense } from 'react'
import { fetchAllCommunities } from '../actions'
import CommunityCard from '@/components/CommunityCard'
import PaginationControls from '@/components/PaginationControls'

const PAGE_SIZE = 100

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function Page({ searchParams }: PageProps) {
  const { page: pageStr } = await searchParams
  const page = Math.max(1, Number(pageStr ?? 1) || 1)

  const result = await fetchAllCommunities(page, PAGE_SIZE)
  const communities = result.data ?? []
  const totalPages = Math.ceil((result.count ?? 0) / PAGE_SIZE)

  let counter = (page - 1) * PAGE_SIZE + 1

  return (
    <div className='flex flex-col text-primary-foreground-muted items-center p-8'>
      <div>
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
          Saidit Communities
        </h3>
      </div>
      <div className='flex flex-col gap-4 mt-12 w-full max-w-7xl'>
        <div className="flex items-center justify-between">
          <div>
            <p>All Communities</p>
            <small className="text-sm font-medium text-muted-foreground leading-none">Browse Saidit communities</small>
          </div>
          {totalPages > 1 && (
            <small className="text-sm text-muted-foreground">
              Page {page} of {totalPages} · {result.count} total
            </small>
          )}
        </div>
        <div className='grid grid-cols-[repeat(auto-fit,minmax(19rem,1fr))] gap-3'>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {communities.map((community) => (
            <CommunityCard key={community.community_name} community={community as any} counter={counter++} />
          ))}
        </div>
        <Suspense>
          <PaginationControls page={page} totalPages={totalPages} />
        </Suspense>
      </div>
    </div>
  )
}
