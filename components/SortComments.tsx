import React, { memo } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useRouter, useSearchParams } from 'next/navigation';
import { Archive, Clock12, Rocket, Swords } from 'lucide-react';

interface sortCommentsProps {
    setSortBy: React.Dispatch<React.SetStateAction<"best" | "new" | "old" | "controversial">>
    sortBy: string
}

const SortComments = ({ sortBy, setSortBy }: sortCommentsProps) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleChange = (value: string) => {
        setSortBy(value as "best" | "new" | "old" | "controversial");
        const params = new URLSearchParams(searchParams.toString());
        params.set('sortCommentBy', value);
        router.replace(`?${params.toString()}`);
    };

    return (
        <div className='flex my-4 items-center gap-2'>
            <p className='text-muted-foreground text-sm'>Sort by:</p>
            <Select value={sortBy} onValueChange={handleChange}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="best" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem className='hover:cursor-pointer' value="best"><Rocket className='text-primary-foreground' /> Best</SelectItem>
                    <SelectItem className='hover:cursor-pointer' value="new"><Clock12 className='text-primary-foreground' />New</SelectItem>
                    <SelectItem className='hover:cursor-pointer' value="old"><Archive className='text-primary-foreground' />Old</SelectItem>
                    <SelectItem className='hover:cursor-pointer' value="controversial"><Swords className='text-primary-foreground' />Controversial</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
};

export default memo(SortComments);