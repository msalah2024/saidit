import React from 'react'

export default function CommunityRules() {
    return (
        <div className="rounded-lg border bg-card p-5 shadow-sm">
            <h3 className="mb-4 font-medium">Creating a Community</h3>
            <ul className="space-y-4 text-sm">
                <li className="flex gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium">
                        1
                    </div>
                    <p>Choose a unique, descriptive name that reflects your community&#39;s purpose</p>
                </li>
                <li className="flex gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium">
                        2
                    </div>
                    <p>Set clear community rules to establish the tone and expectations</p>
                </li>
                <li className="flex gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium">
                        3
                    </div>
                    <p>Customize your community with a unique icon and banner</p>
                </li>
                <li className="flex gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium">
                        4
                    </div>
                    <p>Choose privacy settings that work best for your community goals</p>
                </li>
            </ul>
        </div>
    )
}
