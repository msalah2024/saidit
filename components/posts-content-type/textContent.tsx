import React, { memo } from 'react'

export default memo(function TextContent() {
    return (
        <div>
            <h4 className="scroll-m-20 mb-2 text-lg font-semibold tracking-tight">
                test title
            </h4>
            <p className='text-primary-foreground-muted line-clamp-6'>testbody</p>
        </div>
    )
})
