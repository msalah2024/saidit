import { CakeSlice, Dot, Globe } from 'lucide-react'
import React from 'react'

export default function CommunityRightSide() {
  return (
    <div className='bg-black w-full p-8 rounded-2xl flex flex-col h-fit -mt-8 gap-4'>
      <div className='flex flex-col gap-2'>
        <p className='font-medium text-primary-foreground-muted'>flux</p>
        <small className="text-sm font-medium leading-none text-muted-foreground">This is flux</small>
      </div>
      <div className='flex flex-col gap-2'>
        <small className="text-sm font-medium leading-none text-muted-foreground flex gap-1 items-center"><CakeSlice /> Created 11/11/2011</small>
        <small className="text-sm font-medium leading-none text-muted-foreground flex gap-1 items-center"><Globe /> Public</small>
      </div>
      <div className="flex gap-8">
        <p className='font-medium'>1 <span className='text-sm text-muted-foreground'>Member</span></p>
        <p className='font-medium flex items-start'><Dot className='text-primary' />
          <span>
            1 <span className='text-sm text-muted-foreground'>Online</span>
          </span>
        </p>
      </div>
      <hr />
    </div>
  )
}
