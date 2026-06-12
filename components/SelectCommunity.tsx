"use client"
import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { debounce } from 'lodash'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from './ui/button'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { ChevronsUpDown } from 'lucide-react'
import { selectCommunity } from '@/app/actions'
import { Tables } from '@/database.types'
import { useGeneralProfile } from '@/app/context/GeneralProfileContext'
import { useRouter, useSearchParams } from 'next/navigation'

interface SelectCommunityProps {
    selectedCommunity: Tables<'communities'> | null
    setSelectedCommunity: React.Dispatch<React.SetStateAction<Tables<'communities'> | null>>
}

const CommunityAvatar: React.FC<{ image?: string }> = ({ image }) => (
    <Avatar className="h-6 w-6">
        <AvatarImage src={image || undefined} className='rounded-full' draggable={false} />
        <AvatarFallback>s/</AvatarFallback>
    </Avatar>
)

export default function SelectCommunity({ selectedCommunity, setSelectedCommunity }: SelectCommunityProps) {
    const [search, setSearch] = useState("")
    const [communities, setCommunities] = useState<Tables<'communities'>[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const { profile } = useGeneralProfile()
    const router = useRouter()
    const searchParams = useSearchParams()
    const urlCommunity = searchParams.get('community')

    const debouncedSearchHandler = useMemo(() =>
        debounce(async (searchTerm: string) => {
            setIsLoading(true)
            try {
                const result = await selectCommunity(searchTerm)
                setCommunities(result.data || [])
            } catch (error) {
                console.error("Failed to fetch communities:", error)
            } finally {
                setIsLoading(false)
            }
        }, 300), [])

    useEffect(() => {
        if (!urlCommunity) return
        let isMounted = true
        selectCommunity(urlCommunity)
            .then(result => {
                if (isMounted && result.data) setSelectedCommunity(result.data[0])
            })
            .catch(error => console.error("Failed to fetch communities:", error))
        return () => { isMounted = false }
    }, [setSelectedCommunity, urlCommunity])

    useEffect(() => {
        if (search.trim()) {
            debouncedSearchHandler(search)
        } else {
            setCommunities([])
        }
        return () => { debouncedSearchHandler.cancel() }
    }, [search, debouncedSearchHandler])

    const handleCommunitySelect = useCallback((community: Tables<'communities'>) => {
        setOpen(false)

        setSelectedCommunity(community)

        const params = new URLSearchParams(searchParams.toString())
        params.set('community', community.community_name)
        setTimeout(() => {
            router.replace(`?${params.toString()}`, { scroll: false })
        }, 100)
    }, [router, searchParams, setSelectedCommunity])

    const renderCommunities = () => {
        if (isLoading) return <CommandEmpty>Searching...</CommandEmpty>
        if (search && communities.length === 0) return <CommandEmpty>No results found.</CommandEmpty>
        if (search) {
            return (
                <CommandGroup>
                    {communities.map((community) => (
                        <CommandItem
                            key={community.id}
                            value={community.community_name}
                            className='my-2'
                            onSelect={() => {
                                handleCommunitySelect(community)
                            }}
                        >
                            <div className="flex items-center gap-2">
                                <CommunityAvatar image={community.image_url || undefined} />
                                <span>s/{community.community_name}</span>
                            </div>
                        </CommandItem>
                    ))}
                </CommandGroup>
            )
        }
        return (
            <CommandGroup>
                {profile?.community_memberships?.map((community) => (
                    <CommandItem
                        key={community.community_id}
                        value={community.communities.community_name}
                        className='my-2'
                        onSelect={() => {
                            handleCommunitySelect(community.communities)
                        }}
                    >
                        <div className="flex items-center gap-2">
                            <CommunityAvatar image={community.communities.image_url || undefined} />
                            <span>s/{community.communities.community_name}</span>
                        </div>
                    </CommandItem>
                ))}
            </CommandGroup>
        )
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant='outline'
                    className='justify-between hover:bg-muted rounded-full py-6 w-72'
                    size='default'
                    onClick={() => setOpen(!open)}
                >
                    <div className='flex items-center gap-2'>
                        {selectedCommunity ? (
                            <>
                                <CommunityAvatar image={selectedCommunity.image_url || undefined} />
                                <p>s/{selectedCommunity.community_name}</p>
                            </>
                        ) : (
                            <>
                                <CommunityAvatar />
                                <p>Select a community</p>
                            </>
                        )}
                    </div>
                    <ChevronsUpDown className="text-muted-foreground h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className='bg-background rounded-xl p-2 w-[--radix-popover-trigger-width]'
                align="start"
            >
                <Command className='bg-background'>
                    <CommandInput
                        value={search}
                        onValueChange={setSearch}
                        placeholder="Search communities..."
                    />
                    <CommandList>
                        {renderCommunities()}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
