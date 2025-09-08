// app/api/seed-image-posts/route.ts

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

        // --- 1. Fetch news from international sources 🌍 ---
        console.log('Fetching news with images from international sources...');

        // const sources = ['bbc-news', 'reuters', 'associated-press', 'al-jazeera-english', 'techcrunch', 'the-verge'];
        const sources = ['al-jazeera-english'];
        const response = await fetch(
            `https://newsapi.org/v2/everything?sources=${sources.join(',')}&pageSize=${NUM_POSTS_TO_CREATE}&apiKey=${API_KEY}`
        );
        const data = await response.json();

        if (data.status !== 'ok') {
            throw new Error(data.message || 'Failed to fetch from News API');
        }

        // ✨ Filter for articles that have an image URL
        const validArticles = data.articles
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .filter((article: any) => article.title && article.urlToImage)
            .slice(0, NUM_POSTS_TO_CREATE);

        if (validArticles.length === 0) {
            return NextResponse.json({ message: "No valid articles with images found to create posts." });
        }

        // --- 2. Create Posts and Attachments Iteratively ---
        let imagePostsCreated = 0;
        console.log(`Found ${validArticles.length} articles. Creating image posts...`);

        for (const article of validArticles) {
            // Step 2a: Create the post entry and get its ID
            const slug = await generateSlug(article.title);
            const formattedContent = `${article.content}\n\n<a href="${article.url}" target="_blank">Read the full article</a>`;
            const { data: newPost, error: postError } = await supabaseAdmin
                .from('posts')
                .insert({
                    community_id: DUMMY_COMMUNITY_ID,
                    author_id: DUMMY_AUTHOR_ID,
                    title: article.title,
                    content: formattedContent,
                    post_type: 'image',
                    slug: slug,
                })
                .select('id')
                .single(); // .single() is crucial to get the new post object

            if (postError) {
                console.error(`Failed to create post for "${article.title}":`, postError.message);
                continue; // Skip this article and move to the next
            }

            // Step 2b: Create the associated attachment, linking the image URL
            const { error: attachmentError } = await supabaseAdmin
                .from('post_attachments')
                .insert({
                    post_id: newPost.id,
                    file_url: article.urlToImage, // We use the direct URL from the API
                    alt_text: article.title, // Use the article title as alt text
                    width: 800,
                    height: 800
                });

            if (attachmentError) {
                console.error(`Failed to create attachment for post ID ${newPost.id}:`, attachmentError.message);
                // Optional: You could delete the parent post here for data consistency
                continue;
            }

            imagePostsCreated++;
            console.log(`Successfully created image post: "${article.title}"`);
        }

        return NextResponse.json({
            message: "Database successfully seeded with image posts!",
            postsCreated: imagePostsCreated,
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