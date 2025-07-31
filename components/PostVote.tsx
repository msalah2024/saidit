import React, { useEffect, useState } from 'react';
import { ArrowBigDown, ArrowBigUp } from 'lucide-react';
import { useGeneralProfile } from '@/app/context/GeneralProfileContext';
import { toast } from "sonner";
import { managePostVotes, removeVote } from '@/app/actions';
import { Button } from './ui/button';

type Vote = {
    vote_type: 'upvote' | 'downvote',
    voter_id: string | null,
    id: string
};

interface VotingProps {
    postId: string;
    initialVotes: Vote[];
    onVoteUpdate?: (newVotes: number) => void;
    deleted?: boolean
}

export default function Voting({ postId, initialVotes, onVoteUpdate, deleted }: VotingProps) {
    const [votes, setVotes] = useState(0);
    const [userVote, setUserVote] = useState<Vote | null>(null);
    const { user } = useGeneralProfile();

    useEffect(() => {
        let upVotes = 0;
        let downVotes = 0;
        let currentUserVote: Vote | null = null;

        initialVotes.forEach((vote) => {
            if (vote.vote_type === 'upvote') upVotes++;
            else downVotes++;
            if (vote.voter_id === user?.id) currentUserVote = vote;
        });

        setVotes(upVotes - downVotes);
        setUserVote(currentUserVote);
    }, [initialVotes, user?.id]);

    const handleVote = async (voteType: 'upvote' | 'downvote') => {
        if (!user) {
            toast.error("Please log in to vote");
            return;
        }

        const previousVotes = votes;
        const previousUserVote = userVote;

        let newVotes = votes;
        let newUserVote: Vote | null = null;

        if (userVote && userVote.vote_type === voteType) {
            newVotes = voteType === 'upvote' ? votes - 1 : votes + 1;
            newUserVote = null;
        } else if (userVote) {
            newVotes = voteType === 'upvote' ? votes + 2 : votes - 2;
            newUserVote = { ...userVote, vote_type: voteType };
        } else {
            newVotes = voteType === 'upvote' ? votes + 1 : votes - 1;
            newUserVote = { vote_type: voteType, voter_id: user.id, id: "pending" };
        }

        setVotes(newVotes);
        setUserVote(newUserVote);
        onVoteUpdate?.(newVotes);

        try {
            const result = await managePostVotes(user.id, postId, voteType);

            if (!result.success) {
                throw new Error(result.message);
            }

            if (newUserVote === null) {
                if (previousUserVote?.id && previousUserVote.id !== "pending") {
                    await removeVote(previousUserVote.id);
                }
            }

            if (result.data?.id && newUserVote?.id === "pending") {
                setUserVote({
                    vote_type: voteType,
                    voter_id: user.id,
                    id: result.data.id
                });
            }
        } catch (error) {
            setVotes(previousVotes);
            setUserVote(previousUserVote);
            onVoteUpdate?.(previousVotes);
            toast.error("Failed to update vote");
            console.error("Vote error:", error);
        }
    };

    return (
        <>
            {
                deleted ?
                    <Button variant={'redditGray'} disabled className='h-8 gap-1.5'>
                        <ArrowBigUp size={18}/>
                        <ArrowBigDown size={18}/>
                    </Button>
                    :
                    <div className='flex items-center h-8 bg-muted rounded-full z-10'>
                        <div
                            onClick={() => handleVote("upvote")}
                            className='p-2 rounded-full text-primary-foreground-muted hover:text-primary hover:cursor-pointer text-center'
                        >
                            <ArrowBigUp
                                size={18}
                                fill={userVote?.vote_type === 'upvote' ? '#5BAE4A' : ''}
                                className={userVote?.vote_type === 'upvote' ? 'text-primary' : ''}
                            />
                        </div>
                        <p className='text-sm font-medium leading-0 text-primary-foreground-muted select-none'>{votes}</p>
                        <div
                            onClick={() => handleVote("downvote")}
                            className='p-2 rounded-full text-center text-primary-foreground-muted hover:text-accent hover:cursor-pointer'
                        >
                            <ArrowBigDown
                                size={18}
                                fill={userVote?.vote_type === 'downvote' ? '#477ed8' : ''}
                                className={userVote?.vote_type === 'downvote' ? 'text-accent' : ''}
                            />
                        </div>
                    </div>
            }
        </>
    );
}