"use client"
import React, { memo, useEffect, useMemo } from 'react';
import { Input } from './ui/input';
import { Search } from 'lucide-react';
import { CommentWithAuthor } from '@/complexTypes'
import { usePost } from '@/app/context/PostContext';
import { fetchCommentSorted, searchComments } from '@/app/actions';
import { toast } from 'sonner';
import { debounce } from 'lodash';
import { Button } from './ui/button';

interface SearchCommentsProps {
    setComments: React.Dispatch<React.SetStateAction<CommentWithAuthor[]>>
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
    setHasSearched: React.Dispatch<React.SetStateAction<boolean>>
    disableInput: boolean
    sortBy: "best" | "new" | "old" | "controversial"
    searchTerm: string
    setSearchTerm: React.Dispatch<React.SetStateAction<string>>
}

const SearchComments = ({ setComments, setIsLoading, setHasSearched, disableInput, sortBy, searchTerm, setSearchTerm }: SearchCommentsProps) => {
    const { post } = usePost()

    const debouncedSearch = useMemo(() =>
        debounce(async (term: string) => {
            const trimmed = term.trim();
            setIsLoading(true);

            if (trimmed === '') {
                setHasSearched(false);
                const result = await fetchCommentSorted(sortBy, post.id);
                if (result?.success && result?.data) {
                    setComments(result.data);
                }
                setIsLoading(false);
                return;
            }

            const result = await searchComments(trimmed, post.id);

            if (result.success && result.data) {
                setComments(result.data);
                setHasSearched(true);
            } else {
                toast.error("An error occurred");
            }

            setIsLoading(false);
        }, 300),
        [post.id, setComments, setIsLoading, setHasSearched, sortBy]
    );

    useEffect(() => {
        return () => {
            debouncedSearch.cancel();
        };
    }, [debouncedSearch]);

    const handleClear = () => {
        setSearchTerm('');
        debouncedSearch('');
    };

    return (
        <div className='flex items-center grow gap-2'>
            <div className='relative grow mx-1'>
                <Input type="text" disabled={disableInput} placeholder="Search Comments" className='px-8' value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        debouncedSearch(e.target.value);
                    }}
                />
                <Search className='text-muted-foreground absolute top-2 left-2' size={20} />
            </div>
            {searchTerm && (
                <Button onClick={handleClear} variant={'redditGray'} className='rounded-full'>
                    Cancel
                </Button>
            )}
        </div>
    );
};

export default memo(SearchComments); 