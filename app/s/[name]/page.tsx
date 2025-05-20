import React from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function Page({ params }: any) {
    const communityName = await params.name
    return (
        <div className='full-height flex justify-center items-center'>
            <h2 className="scroll-m-20 text-3xl border-b pb-2 font-semibold tracking-tight first:mt-0">
                Welcome to <span className='text-primary'>{communityName}</span>
            </h2>
        </div>
    )
}
