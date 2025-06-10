"use client"
import React, { useEffect, useMemo, useState } from 'react'
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

interface SelectCommunityProps {
    selectedCommunity: Tables<'communities'> | null
    setSelectedCommunity: React.Dispatch<React.SetStateAction<Tables<'communities'> | null>>
}

export default function SelectCommunity({ selectedCommunity, setSelectedCommunity }: SelectCommunityProps) {
    const [search, setSearch] = useState("")
    const [communities, setCommunities] = useState<Tables<'communities'>[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const { profile } = useGeneralProfile()

    const debouncedSearchHandler = useMemo(() => debounce(async (searchTerm: string) => {
        setIsLoading(true)
        try {
            const result = await selectCommunity(searchTerm)
            if (result.data) {
                setCommunities(result.data)
            }
        } catch (error) {
            console.error("Failed to fetch communities:", error)
        } finally {
            setIsLoading(false)
        }
    }, 300), [])

    useEffect(() => {
        if (search.trim() !== '') {
            debouncedSearchHandler(search)
        } else {
            setCommunities([])
        }
        return () => {
            debouncedSearchHandler.cancel()
        }
    }, [search, debouncedSearchHandler])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild className='w-fit'>
                <Button variant={'outline'} className='justify-between hover:bg-muted rounded-full py-6 w-72' size={'default'}>
                    <div className='flex items-center gap-2'>
                        {
                            selectedCommunity ?
                                <>
                                    <Avatar>
                                        <AvatarImage src={selectedCommunity.image_url || undefined}
                                            className='rounded-full'
                                            draggable={false}
                                        />
                                        <AvatarFallback>s/</AvatarFallback>
                                    </Avatar>
                                    <p>
                                        s/
                                        {selectedCommunity.community_name}
                                    </p>
                                </>
                                :
                                <>
                                    <Avatar>
                                        <AvatarImage src="" />
                                        <AvatarFallback>s/</AvatarFallback>
                                    </Avatar>
                                    <p>
                                        Select a community
                                    </p>
                                </>
                        }
                    </div>
                    <ChevronsUpDown className="text-muted-foreground" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className='bg-background rounded-xl p-2'>
                <Command className='bg-background'>
                    <CommandInput value={search} onValueChange={setSearch} placeholder="Type a command or search..." />
                    <CommandList>
                        {
                            isLoading ?
                                <CommandEmpty>Searching...</CommandEmpty>
                                :
                                <>
                                    <CommandEmpty>No results found.</CommandEmpty>
                                    <CommandGroup>
                                        {search ?
                                            communities.map((community) => (
                                                <CommandItem key={community.id} value={community.community_name} className='my-2'
                                                    onSelect={() => {
                                                        setSelectedCommunity(community)
                                                        setOpen(false)
                                                    }}
                                                >
                                                    <Avatar>
                                                        <AvatarImage src={community.image_url || undefined}
                                                            className='rounded-full' draggable={false} />
                                                        <AvatarFallback>s/</AvatarFallback>
                                                    </Avatar>
                                                    <p>s/{community.community_name}</p>
                                                </CommandItem>
                                            ))
                                            :
                                            profile?.community_memberships.map((community) => (
                                                <CommandItem key={community.community_id} value={community.communities.community_name} className='my-2'
                                                    onSelect={() => {
                                                        setSelectedCommunity(community.communities)
                                                        setOpen(false)
                                                    }}
                                                >
                                                    <Avatar>
                                                        <AvatarImage src={community.communities.image_url || undefined}
                                                            className='rounded-full' draggable={false} />
                                                        <AvatarFallback>s/</AvatarFallback>
                                                    </Avatar>
                                                    <p>s/{community.communities.community_name}</p>
                                                </CommandItem>
                                            ))
                                        }
                                    </CommandGroup>
                                </>
                        }
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
