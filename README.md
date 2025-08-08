# Saidit – The Open-Source Reddit Alternative

### **A fully open-source, feature-rich Reddit alternative built with Next.js & Supabase.**

![localhost_3000_ (1)](https://github.com/user-attachments/assets/54240b94-6a90-4331-a68c-6d9c6297d52a)

## **📌 Features**

✅ **User Authentication** (Email & Password, Google, Discord)  
✅ **Community System** (Subreddits equivalent)  
✅ **Post Creation (Text, Image, Video)**  
✅ **Voting System (Upvote/Downvote)**  
✅ **Comment System (Nested Replies)**  
✅ **Real-Time Updates** (Live Comments & Notifications)  
✅ **Trending Algorithm** (Sort by Engagement & Time)  
✅ **Public API** (Reddit-like API for external apps)

## **🚀 Tech Stack**

-   **Frontend:** Next.js, TypeScript, Tailwind CSS
-   **Backend:** Supabase (PostgreSQL, Auth, Storage, Realtime)
-   **Hosting:** Vercel
-   **Database:** PostgreSQL (via Supabase)
-   **Realtime Features:** Supabase Realtime

## **⌚ To-do**

## Project Setup

-   [x] Initialize Next.js project with TypeScript.
-   [x] Set up ESLint, Prettier.
-   [x] Install and configure shadcn/ui.
-   [x] Set up Supabase and configure authentication.
-   [x] Add social login (Google, Discord).
-   [x] Create protected routes middleware.

## Database Setup

-   [x] Create `users` table.
-   [x] Create `communities` table.
-   [x] Create `community_memberships` table.
-   [x] Create `social_links` table.
-   [x] Create `posts` table.
-   [x] Create `posts_votes` table.
-   [x] Create `posts_attachments` table.
-   [x] Create `comments` table.
-   [x] Create `comments_votes` table.
-   [ ] Create `notifications` table.
-   [ ] Create `visited_communities` table.
-   [x] Create `moderators` table.
-   [ ] Create `reports` table.
-   [ ] Enable Row-Level Security (RLS) for all tables.

## Virtualization

-   [x] Implement virtualization.

## Authentication

-   [x] Implement sign-up, login, and logout.
-   [x] Add social login (Google, GitHub, etc.).
-   [x] Create user profile pages.
-   [x] Allow users to edit their profiles (bio, avatar, banner).

## Communities

-   [x] Allow users to create communities.
-   [x] Display a list of all communities.
-   [x] Create individual community pages.
-   [x] Add community rules and descriptions.

## Posts

-   [x] Allow users to create posts (~~text~~, ~~link~~, ~~image~~, video, poll).
-   [x] Display posts on the homepage and community pages.
-   [x] Implement post deletion.

## Comments

-   [x] Allow users to comment on posts.
-   [x] Implement nested comment threads.
-   [x] Allow comment editing and deletion.

## Verification

-   [x] Implement verification for users and communities.

## Voting

-   [x] Implement upvote/downvote for posts.
-   [x] Implement upvote/downvote for comments.
-   [ ] Display vote counts in real-time.

## Notifications

-   [ ] Notify users about new comments, upvotes, and replies.
-   [ ] Add a notifications dropdown or page.
-   [ ] Mark notifications as read.

## Search and Filtering

-   [ ] Implement search for communities, posts, and users.
-   [ ] Add filtering options (hot, new, top, etc.).
-   [ ] Add sorting options for comments.

## Moderation

-   [ ] Allow moderators to delete posts and comments.
-   [ ] Implement a reporting system for inappropriate content.
-   [ ] Add a moderation dashboard for community moderators.

## **🎯 Karma System Explained**

Saidit uses a smart, scalable karma system to reflect how well posts are received by the community. Here’s how it works:

- 🔼 **Upvotes** and 🔽 **Downvotes** affect the score of each post.  
- The **net score** is:  
  `net_score = upvotes - downvotes`

- To keep karma growth fair and meaningful, we use a **logarithmic scale** for positive scores:  
  - If `net_score` ≤ 0, karma equals the net score (negative or zero scores stay the same).  
  - If `net_score` > 0, karma =  
    `floor(10 * log₁₀(1 + net_score))`  
    This means big upvote counts get scaled down to avoid runaway karma inflation 🚀⬇️.

### ⚙️ Implementation Details

- The **`calculate_karma`** function implements this logic in PostgreSQL.  
- Whenever a vote is added, changed, or removed, the **`update_user_post_karma`** trigger:  
  - Counts the post’s upvotes and downvotes.  
  - Calculates the new karma with `calculate_karma`.  
  - Updates the post author’s total `post_karma` in the `users` table.  
- This keeps user karma always updated in real time, automatically 🎉.

## 📊 Comment Sorting Algorithms

Saidit supports multiple ways to sort comments: **Best**, **New**, **Old**, and **Controversial**. Below are the formulas used for sorting:

### 🥇 Best

We use a Reddit-inspired “hotness” ranking formula that balances vote count and recency:

```
score = net_votes / (age_in_hours + 2)^1.8
```

- `net_votes` = upvotes - downvotes  
- `age_in_hours` = hours since the comment was posted  
- `1.8` is a gravity constant that reduces the weight of older comments

This ensures that high-voted, newer comments rise to the top — keeping threads fresh and relevant.

---

### ⚔️ Controversial

Controversial comments are those that receive a lot of votes, but with split opinions (i.e. many upvotes **and** many downvotes). The formula is:

```
score = total_votes / abs(upvotes - downvotes + 1)
```

- `total_votes` = upvotes + downvotes  
- The smaller the gap between upvotes and downvotes, the higher the score  
- This promotes comments with heavy engagement but mixed sentiment

This makes polarizing comments more visible, just like on Reddit.


## **🔐 License**

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.

📌 **Star this repo** ⭐ if you find it useful! 🚀
