// app/api/seed-posts/route.ts

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { generateSlug } from '@/lib/generateSlug';

export async function POST() {
    try {
        // --- Configuration ---
        const DUMMY_AUTHOR_ID = process.env.DUMMY_AUTHOR_ID;
        const DUMMY_COMMUNITY_ID = process.env.DUMMY_COMMUNITY_ID;
        const NUM_POSTS_TO_CREATE = 50;
        const API_KEY = process.env.NEWS_API_KEY;

        if (!API_KEY) {
            throw new Error("Missing NEWS_API_KEY environment variable");
        }

        // --- 1. Fetch headline news from News API 📰 ---
        console.log('Fetching headline news from News API...');

        const sources = [
            'bbc-news',
            'reuters',
            'al-jazeera-english',
            'associated-press',
            'the-globe-and-mail',
            'the-irish-times',
        ];

        // ✨ This is the only line that changed.
        const response = await fetch(
            `https://newsapi.org/v2/everything?sources=${sources.join(',')}&pageSize=${NUM_POSTS_TO_CREATE}&apiKey=${API_KEY}`
        );

        const data = await response.json();

        if (data.status !== 'ok') {
            throw new Error(data.message || 'Failed to fetch from News API');
        }

        const validArticles = data.articles.filter(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (article: any) => article.title && article.description
        );

        if (validArticles.length === 0) {
            return NextResponse.json({ message: "No valid articles found to create posts." });
        }

        // --- 2. Prepare the posts for insertion ---
        const postsToInsert = await Promise.all(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            validArticles.map(async (article: any) => {

                const formattedContent = `${article.content}\n\n<a href="${article.url}" target="_blank">Read the full article</a>`;

                return {
                    community_id: DUMMY_COMMUNITY_ID,
                    author_id: DUMMY_AUTHOR_ID,
                    title: article.title,
                    content: formattedContent,
                    post_type: 'text',
                    slug: await generateSlug(article.title),
                };
            })
        );
        // --- 3. Insert all posts in a single bulk operation ---
        console.log(`Inserting ${postsToInsert.length} text posts...`);
        const { error } = await supabaseAdmin.from('posts').insert(postsToInsert);

        if (error) {
            throw error;
        }

        return NextResponse.json({
            message: "Database successfully seeded with headline news!",
            postsCreated: postsToInsert.length,
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error("Seeding failed:", error);
        return NextResponse.json({
            error: "Failed to seed database.",
            details: error.message
        }, { status: 500 });
    }
}