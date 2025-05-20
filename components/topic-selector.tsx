"use client"

import type React from "react"

import { useState, useEffect, useRef, memo } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Topic {
    id: string
    name: string
    category: string
}

interface TopicCategory {
    name: string
    emoji: string
    topics: Topic[]
}

interface TopicSelectorProps {
    selectedTopics: string[]
    onChange: (topics: string[]) => void
    maxTopics: number
}

// Topic categories data
const topicCategories: TopicCategory[] = [
    {
        name: "Art & Design",
        emoji: "🎨",
        topics: [
            { id: "design", name: "Design", category: "Art & Design" },
            { id: "illustration", name: "Illustration", category: "Art & Design" },
            { id: "photography", name: "Photography", category: "Art & Design" },
            { id: "sculpture", name: "Sculpture", category: "Art & Design" },
            { id: "typography", name: "Typography", category: "Art & Design" },
            { id: "animation", name: "Animation", category: "Art & Design" },
            { id: "digital-art", name: "Digital Art", category: "Art & Design" },
            { id: "street-art", name: "Street Art", category: "Art & Design" },
        ],
    },
    {
        name: "Film & Television",
        emoji: "🎬",
        topics: [
            { id: "filmmaking", name: "Filmmaking", category: "Film & Television" },
            { id: "screenwriting", name: "Screenwriting", category: "Film & Television" },
            { id: "cinematography", name: "Cinematography", category: "Film & Television" },
            { id: "editing", name: "Editing", category: "Film & Television" },
            { id: "acting", name: "Acting", category: "Film & Television" },
            { id: "documentaries", name: "Documentaries", category: "Film & Television" },
            { id: "tv-series", name: "TV Series", category: "Film & Television" },
            { id: "film-criticism", name: "Film Criticism", category: "Film & Television" },
        ],
    },
    {
        name: "Gaming",
        emoji: "🎮",
        topics: [
            { id: "pc-gaming", name: "PC Gaming", category: "Gaming" },
            { id: "console-gaming", name: "Console Gaming", category: "Gaming" },
            { id: "mobile-gaming", name: "Mobile Gaming", category: "Gaming" },
            { id: "game-development", name: "Game Development", category: "Gaming" },
            { id: "esports", name: "Esports", category: "Gaming" },
            { id: "indie-games", name: "Indie Games", category: "Gaming" },
            { id: "virtual-reality", name: "Virtual Reality", category: "Gaming" },
            { id: "board-games", name: "Board Games", category: "Gaming" },
        ],
    },
    {
        name: "Literature & Writing",
        emoji: "📚",
        topics: [
            { id: "fiction", name: "Fiction", category: "Literature & Writing" },
            { id: "non-fiction", name: "Non-Fiction", category: "Literature & Writing" },
            { id: "poetry", name: "Poetry", category: "Literature & Writing" },
            { id: "creative-writing", name: "Creative Writing", category: "Literature & Writing" },
            { id: "book-reviews", name: "Book Reviews", category: "Literature & Writing" },
            { id: "publishing", name: "Publishing", category: "Literature & Writing" },
            { id: "literary-analysis", name: "Literary Analysis", category: "Literature & Writing" },
            { id: "fan-fiction", name: "Fan Fiction", category: "Literature & Writing" },
        ],
    },
    {
        name: "Music",
        emoji: "🎵",
        topics: [
            { id: "music-production", name: "Music Production", category: "Music" },
            { id: "songwriting", name: "Songwriting", category: "Music" },
            { id: "music-genres", name: "Music Genres", category: "Music" },
            { id: "music-theory", name: "Music Theory", category: "Music" },
            { id: "live-performances", name: "Live Performances", category: "Music" },
            { id: "album-reviews", name: "Album Reviews", category: "Music" },
            { id: "instruments", name: "Instruments", category: "Music" },
            { id: "music-education", name: "Music Education", category: "Music" },
        ],
    },
    {
        name: "Science & Technology",
        emoji: "🧬",
        topics: [
            { id: "physics", name: "Physics", category: "Science & Technology" },
            { id: "biology", name: "Biology", category: "Science & Technology" },
            { id: "chemistry", name: "Chemistry", category: "Science & Technology" },
            { id: "astronomy", name: "Astronomy", category: "Science & Technology" },
            { id: "artificial-intelligence", name: "Artificial Intelligence", category: "Science & Technology" },
            { id: "software-development", name: "Software Development", category: "Science & Technology" },
            { id: "hardware", name: "Hardware", category: "Science & Technology" },
            { id: "tech-news", name: "Tech News", category: "Science & Technology" },
        ],
    },
    {
        name: "Health & Fitness",
        emoji: "🧘",
        topics: [
            { id: "nutrition", name: "Nutrition", category: "Health & Fitness" },
            { id: "exercise", name: "Exercise", category: "Health & Fitness" },
            { id: "mental-health", name: "Mental Health", category: "Health & Fitness" },
            { id: "yoga", name: "Yoga", category: "Health & Fitness" },
            { id: "bodybuilding", name: "Bodybuilding", category: "Health & Fitness" },
            { id: "weight-loss", name: "Weight Loss", category: "Health & Fitness" },
            { id: "wellness", name: "Wellness", category: "Health & Fitness" },
            { id: "medical-advice", name: "Medical Advice", category: "Health & Fitness" },
        ],
    },
    {
        name: "Travel & Culture",
        emoji: "🌍",
        topics: [
            { id: "travel-tips", name: "Travel Tips", category: "Travel & Culture" },
            { id: "destinations", name: "Destinations", category: "Travel & Culture" },
            { id: "cultural-experiences", name: "Cultural Experiences", category: "Travel & Culture" },
            { id: "language-learning", name: "Language Learning", category: "Travel & Culture" },
            { id: "travel-photography", name: "Travel Photography", category: "Travel & Culture" },
            { id: "backpacking", name: "Backpacking", category: "Travel & Culture" },
            { id: "expat-life", name: "Expat Life", category: "Travel & Culture" },
            { id: "travel-planning", name: "Travel Planning", category: "Travel & Culture" },
        ],
    },
    {
        name: "Business & Finance",
        emoji: "💼",
        topics: [
            { id: "entrepreneurship", name: "Entrepreneurship", category: "Business & Finance" },
            { id: "investing", name: "Investing", category: "Business & Finance" },
            { id: "personal-finance", name: "Personal Finance", category: "Business & Finance" },
            { id: "startups", name: "Startups", category: "Business & Finance" },
            { id: "marketing", name: "Marketing", category: "Business & Finance" },
            { id: "economics", name: "Economics", category: "Business & Finance" },
            { id: "real-estate", name: "Real Estate", category: "Business & Finance" },
            { id: "cryptocurrency", name: "Cryptocurrency", category: "Business & Finance" },
        ],
    },
    {
        name: "Home & Lifestyle",
        emoji: "🏠",
        topics: [
            { id: "home-improvement", name: "Home Improvement", category: "Home & Lifestyle" },
            { id: "interior-design", name: "Interior Design", category: "Home & Lifestyle" },
            { id: "gardening", name: "Gardening", category: "Home & Lifestyle" },
            { id: "cooking", name: "Cooking", category: "Home & Lifestyle" },
            { id: "parenting", name: "Parenting", category: "Home & Lifestyle" },
            { id: "diy-projects", name: "DIY Projects", category: "Home & Lifestyle" },
            { id: "minimalism", name: "Minimalism", category: "Home & Lifestyle" },
            { id: "organization", name: "Organization", category: "Home & Lifestyle" },
        ],
    },
    {
        name: "Community & Connections",
        emoji: "🤝",
        topics: [
            { id: "community-relationships", name: "Relationships", category: "Community & Connections" },
            { id: "community-love-dating", name: "Love & Dating", category: "Community & Connections" },
            { id: "community-family-parenting", name: "Family & Parenting", category: "Community & Connections" },
            { id: "community-religion-spirituality", name: "Religion & Spirituality", category: "Community & Connections" },
            {
                id: "community-culture-race-ethnicity",
                name: "Culture, Race, & Ethnicity",
                category: "Community & Connections",
            },
        ],
    },
]

const allTopics = topicCategories.flatMap((category) => category.topics)

const TopicSelector = ({ selectedTopics, onChange, maxTopics }: TopicSelectorProps) => {
    const [searchQuery, setSearchQuery] = useState("")
    const [filteredCategories, setFilteredCategories] = useState<TopicCategory[]>(topicCategories)
    const searchInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (!searchQuery) {
            setFilteredCategories(topicCategories)
            return
        }

        const query = searchQuery.toLowerCase()
        const filtered = topicCategories
            .map((category) => ({
                ...category,
                topics: category.topics.filter(
                    (topic) => topic.name.toLowerCase().includes(query) || category.name.toLowerCase().includes(query),
                ),
            }))
            .filter((category) => category.topics.length > 0)

        setFilteredCategories(filtered)
    }, [searchQuery])

    const handleTopicSelect = (topicId: string) => {
        if (selectedTopics.includes(topicId)) {
            onChange(selectedTopics.filter((id) => id !== topicId))
        } else if (selectedTopics.length < maxTopics) {
            onChange([...selectedTopics, topicId])
        }
    }

    const removeTopic = (topicId: string) => {
        onChange(selectedTopics.filter((id) => id !== topicId))
    }

    const getTopicName = (topicId: string) => {
        const topic = allTopics.find((t) => t.id === topicId)
        return topic ? topic.name : topicId
    }

    const handleContainerClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && searchInputRef.current) {
            searchInputRef.current.focus()
        }
    }

    return (
        <div>
            <div className="flex flex-wrap gap-2 h-8">
                {selectedTopics.length > 0 ? (
                    selectedTopics.map((topicId) => (
                        <Badge key={topicId} variant="secondary" className="flex items-center gap-1 px-3 py-1.5">
                            {getTopicName(topicId)}
                            <button
                                type="button"
                                onClick={() => removeTopic(topicId)}
                                className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                            >
                                <X className="h-3 w-3" />
                                <span className="sr-only">Remove {getTopicName(topicId)}</span>
                            </button>
                        </Badge>
                    ))
                ) : (
                    <div className="text-sm text-muted-foreground ml-2 mt-1">No topics selected</div>
                )}
            </div>

            <div className=" flex justify-end text-xs text-muted-foreground mr-2 mb-3">
                {selectedTopics.length} of {maxTopics} topics selected
            </div>

            <div className="rounded-md border bg-background" onClick={handleContainerClick}>
                <div className="flex items-center border-b px-3 py-2">
                    <Search className="mr-2 h-4 w-4 text-muted-foreground" />
                    <Input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search topics..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="border-0 p-0 shadow-none focus-visible:ring-0"
                    />
                </div>

                <ScrollArea className="h-[300px] mb-2">
                    <div className="p-3">
                        {filteredCategories.length > 0 ? (
                            filteredCategories.map((category) => (
                                <div key={category.name} className="mb-6 last:mb-2">
                                    <h3 className="mb-3 flex items-center text-sm font-medium">
                                        <span className="mr-2">{category.emoji}</span>
                                        {category.name}
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {category.topics.map((topic) => {
                                            const isSelected = selectedTopics.includes(topic.id)
                                            const isDisabled = selectedTopics.length >= maxTopics && !isSelected

                                            return (
                                                <button
                                                    key={topic.id}
                                                    type="button"
                                                    onClick={() => handleTopicSelect(topic.id)}
                                                    disabled={isDisabled}
                                                    className={`rounded-full px-3 py-1.5 text-sm transition-colors ${isSelected
                                                        ? "bg-primary text-primary-foreground"
                                                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                                                        } ${isDisabled ? "cursor-not-allowed opacity-50" : ""}`}
                                                >
                                                    {topic.name}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex h-full items-center justify-center p-4 text-center text-sm text-muted-foreground">
                                No topics found for &quot;{searchQuery}&quot;
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>
        </div>
    )
}

export default memo(TopicSelector)