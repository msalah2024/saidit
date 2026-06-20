


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."Gender" AS ENUM (
    'male',
    'female'
);


ALTER TYPE "public"."Gender" OWNER TO "postgres";


CREATE TYPE "public"."community_type" AS ENUM (
    'public',
    'private',
    'restricted'
);


ALTER TYPE "public"."community_type" OWNER TO "postgres";


CREATE TYPE "public"."post_type" AS ENUM (
    'text',
    'link',
    'image',
    'video'
);


ALTER TYPE "public"."post_type" OWNER TO "postgres";


CREATE TYPE "public"."vote_type" AS ENUM (
    'upvote',
    'downvote'
);


ALTER TYPE "public"."vote_type" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."build_reply_tree"("comment_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    AS $$declare
  c record;
  result jsonb;
begin
  select * into c from public.comments where id = comment_id;
  if c is null then
    return null;
  end if;
  return jsonb_build_object(
    'id', c.id,
    'parent_id', c.parent_id,
    'body', c.body,
    'stripped_body', c.stripped_body,
    'creator_id', c.creator_id,
    'created_at', c.created_at,
    'modified_at', c.modified_at,
    'net_votes', c.net_votes,
    'karma_score', c.karma_score,
    'deleted', c.deleted,
    'deleted_at', c.deleted_at,
    'slug', c.slug,
    'replies', (
      select coalesce(jsonb_agg(build_reply_tree(child.id)), '[]'::jsonb)
      from public.comments child
      where child.parent_id = c.id
    )
  );
end;$$;


ALTER FUNCTION "public"."build_reply_tree"("comment_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_karma"("score" integer) RETURNS integer
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
BEGIN
  RETURN FLOOR(10 * LOG(10, 1 + GREATEST(0, score)));
END;
$$;


ALTER FUNCTION "public"."calculate_karma"("score" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fetch_comment_with_replies_by_slug"("slug" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    AS $$declare
  root_comment record;
  result jsonb;
begin
  select c.*,
         u.username,
         u.avatar_url,
         u.verified
    into root_comment
    from public.comments c
    left join public.users u on c.creator_id = u.account_id
   where c.slug = fetch_comment_with_replies_by_slug.slug;

  if root_comment is null then
    return null;
  end if;

  result := (
    select jsonb_build_object(
      'id', c.id::text,
      'author', jsonb_build_object(
        'username', u.username,
        'avatar_url', u.avatar_url,
        'verified', u.verified
      ),
      'creator_id', c.creator_id::text,
      'content', c.body,
      'stripped_content', c.stripped_body,
      'createdAt', c.created_at,
      'updatedAt', c.updated_at,
      'replies', (
        select coalesce(jsonb_agg(fetch_replies(r.id)), '[]'::jsonb)
        from public.comments r
        where r.parent_id = c.id
      ),
      'comments_votes', (
        select coalesce(jsonb_agg(jsonb_build_object(
          'vote_type', v.vote_type,
          'voter_id', v.voter_id::text,
          'id', v.id::text
        )), '[]'::jsonb)
        from public.comments_votes v
        where v.comment_id = c.id
      ),
      'deleted', c.deleted,
      'slug', c.slug
    )
    from public.comments c
    left join public.users u on c.creator_id = u.account_id
    where c.id = root_comment.id
  );

  return result;
end;$$;


ALTER FUNCTION "public"."fetch_comment_with_replies_by_slug"("slug" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fetch_replies"("parent_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    AS $$declare
  reply record;
  replies jsonb;
begin
  return (
    select jsonb_build_object(
      'id', c.id::text,
      'author', jsonb_build_object(
        'username', u.username,
        'avatar_url', u.avatar_url,
        'verified', u.verified
      ),
      'creator_id', c.creator_id::text,
      'content', c.body,
      'stripped_content', c.stripped_body,
      'createdAt', c.created_at,
      'replies', (
        select coalesce(jsonb_agg(fetch_replies(r.id)), '[]'::jsonb)
        from public.comments r
        where r.parent_id = c.id
      ),
      'comments_votes', (
        select coalesce(jsonb_agg(jsonb_build_object(
          'vote_type', v.vote_type,
          'voter_id', v.voter_id::text,
          'id', v.id::text
        )), '[]'::jsonb)
        from public.comments_votes v
        where v.comment_id = c.id
      ),
      'deleted', c.deleted,
      'slug', c.slug
    )
    from public.comments c
    left join public.users u on c.creator_id = u.account_id
    where c.id = fetch_replies.parent_id
  );
end;$$;


ALTER FUNCTION "public"."fetch_replies"("parent_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_comment_with_replies_by_slug"("comment_slug" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" STABLE
    AS $$
DECLARE
    result jsonb;
BEGIN
    WITH RECURSIVE comment_tree AS (
        -- Base case: get the parent comment
        SELECT 
            c.id,
            c.creator_id,
            c.body AS body,
            c.created_at,
            c.update_at,
            c.deleted,
            c.slug,
            u.username,
            u.avatar_url,
            u.verified,
            0 AS depth,
            ARRAY[c.id] AS path
        FROM 
            comments c
        LEFT JOIN 
            users u ON c.creator_id = u.account_id
        WHERE 
            c.slug = comment_slug
        
        UNION ALL
        
        -- Recursive case: get all replies (without aggregates)
        SELECT 
            c.id,
            c.creator_id,
            c.body AS body,
            c.created_at,
            c.updated_at,
            c.deleted,
            c.slug,
            u.username,
            u.avatar_url,
            u.verified,
            ct.depth + 1,
            ct.path || c.id
        FROM 
            comments c
        JOIN 
            comment_tree ct ON c.parent_id = ct.id
        LEFT JOIN 
            users u ON c.creator_id = u.account_id
    ),
    -- Get votes separately
    comment_votes AS (
        SELECT 
            cv.comment_id,
            jsonb_agg(
                jsonb_build_object(
                    'vote_type', cv.vote_type,
                    'voter_id', cv.voter_id,
                    'id', cv.id
                )
            ) AS votes
        FROM 
            comments_votes cv
        GROUP BY 
            cv.comment_id
    )
    -- Build the final result
    SELECT jsonb_build_object(
        'comment', (
            SELECT jsonb_build_object(
                'id', ct.id::text,
                'author', jsonb_build_object(
                    'username', ct.username,
                    'avatar_url', ct.avatar_url,
                    'verified', ct.verified
                ),
                'creator_id', ct.creator_id::text,
                'content', CASE WHEN ct.deleted THEN '[deleted]' ELSE ct.body END,
                'createdAt', ct.created_at::text,
                'updatedAt', ct.updated_at::text,
                'comments_votes', COALESCE(cv.votes, '[]'::jsonb),
                'deleted', ct.deleted,
                'slug', ct.slug,
                'replies', (
                    SELECT jsonb_agg(
                        jsonb_build_object(
                            'id', child.id::text,
                            'author', jsonb_build_object(
                                'username', child.username,
                                'avatar_url', child.avatar_url,
                                'verified', child.verified
                            ),
                            'creator_id', child.creator_id::text,
                            'content', CASE WHEN child.deleted THEN '[deleted]' ELSE child.body END,
                            'createdAt', child.created_at::text,
                            'updatedAt', child.updated_at::text,
                            'comments_votes', COALESCE(child_votes.votes, '[]'::jsonb),
                            'deleted', child.deleted,
                            'slug', child.slug
                        )
                    )
                    FROM comment_tree child
                    LEFT JOIN comment_votes child_votes ON child.id = child_votes.comment_id
                    WHERE child.depth = 1 AND child.path[1] = ct.id
                    ORDER BY child.created_at
                )
            )
            FROM comment_tree ct
            LEFT JOIN comment_votes cv ON ct.id = cv.comment_id
            WHERE ct.depth = 0
        )
    ) INTO result;

    RETURN result;
END;
$$;


ALTER FUNCTION "public"."get_comment_with_replies_by_slug"("comment_slug" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_comments_by_best"("post" "uuid") RETURNS TABLE("id" "uuid", "body" "text", "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "net_votes" integer, "creator_id" "uuid", "parent_id" "uuid", "post_id" "uuid", "deleted" boolean, "stripped_body" "text", "slug" "text", "comments_votes" "jsonb", "users" "jsonb")
    LANGUAGE "plpgsql" STABLE
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.body,
    c.created_at,
    c.updated_at,
    c.net_votes,
    c.creator_id,
    c.parent_id,
    c.post_id,
    c.deleted,  -- Included in SELECT
    c.stripped_body,
    c.slug,
    (
      SELECT jsonb_agg(to_jsonb(cv) - 'comment_id')
      FROM comments_votes cv
      WHERE cv.comment_id = c.id
    ) AS comments_votes,
    (
      SELECT to_jsonb(u.*)
      FROM users u
      WHERE u.account_id = c.creator_id
    ) AS users
  FROM comments c
  WHERE c.post_id = post
  ORDER BY
    c.net_votes / POWER(EXTRACT(EPOCH FROM (NOW() - c.created_at)) / 3600 + 2, 1.8) DESC;
END;
$$;


ALTER FUNCTION "public"."get_comments_by_best"("post" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_comments_by_controversial"("post" "uuid") RETURNS TABLE("id" "uuid", "body" "text", "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "net_votes" integer, "creator_id" "uuid", "parent_id" "uuid", "post_id" "uuid", "deleted" boolean, "stripped_body" "text", "slug" "text", "comments_votes" "jsonb", "users" "jsonb", "controversial_score" double precision)
    LANGUAGE "plpgsql" STABLE
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.body,
    c.created_at,
    c.updated_at,
    c.net_votes,
    c.creator_id,
    c.parent_id,
    c.post_id,
    c.deleted,  -- Now included in SELECT
    c.stripped_body,
    c.slug,
    (
      SELECT jsonb_agg(to_jsonb(cv) - 'comment_id')
      FROM comments_votes cv
      WHERE cv.comment_id = c.id
    ) AS comments_votes,
    (
      SELECT to_jsonb(u.*)
      FROM users u
      WHERE u.account_id = c.creator_id
    ) AS users,
    COALESCE(
      (
        SELECT COUNT(*)::float / GREATEST(ABS(SUM(CASE WHEN cv.vote_type = 'upvote' THEN 1 WHEN cv.vote_type = 'downvote' THEN -1 ELSE 0 END)), 1)
        FROM comments_votes cv
        WHERE cv.comment_id = c.id
      ),
      0
    ) AS controversial_score
  FROM comments c
  WHERE c.post_id = post
  ORDER BY controversial_score DESC;
END;
$$;


ALTER FUNCTION "public"."get_comments_by_controversial"("post" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_full_user_profile"("user_account_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT
    to_jsonb(u) || jsonb_build_object(
      'community_memberships', (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', cm.id,
            'user_id', cm.user_id,
            'community_id', cm.community_id,
            'joined_at', cm.joined_at,
            'communities', to_jsonb(c)
          )
        )
        FROM community_memberships cm
        JOIN communities c ON cm.community_id = c.id
        WHERE cm.user_id = u.account_id
      ),
      'recently_visited_communities', (
        SELECT jsonb_agg(rvc_agg.item)
        FROM (
          SELECT
            jsonb_build_object(
              'visited_at', rvc.visited_at,
              'communities', jsonb_build_object(
                'community_name', c.community_name,
                'image_url', c.image_url
              )
            ) as item
          FROM recently_visited_communities rvc
          JOIN communities c ON rvc.community_id = c.id
          WHERE rvc.user_id = u.account_id
          ORDER BY rvc.visited_at DESC
          LIMIT 5
        ) AS rvc_agg
      ),
      'recently_visited_posts', (
        SELECT jsonb_agg(rvp_agg.item)
        FROM (
          SELECT
            jsonb_build_object(
              'visited_at', rvp.visited_at,
              'posts', jsonb_build_object(
                'id', p.id,
                'title', p.title,
                'slug', p.slug, 
                'created_at', p.created_at,
                'communities', jsonb_build_object(
                  'community_name', c.community_name,
                  'image_url', c.image_url
                ),
                'post_attachments', (
                  SELECT jsonb_agg(
                    jsonb_build_object(
                      'file_url', pa.file_url,
                      'alt_text', pa.alt_text
                    )
                  )
                  FROM post_attachments pa
                  WHERE pa.post_id = p.id
                ),
                'comments_count', (
                  SELECT count(*)
                  FROM comments
                  WHERE post_id = p.id
                ),
                'upvote_count', (
                  SELECT count(*)
                  FROM posts_votes pv
                  WHERE pv.post_id = p.id AND pv.vote_type = 'upvote'
                )
              )
            ) as item
          FROM recently_visited_posts rvp
          JOIN posts p ON rvp.post_id = p.id
          JOIN communities c ON p.community_id = c.id
          WHERE rvp.user_id = u.account_id
          ORDER BY rvp.visited_at DESC
          LIMIT 10
        ) AS rvp_agg
      )
    )
  INTO result
  FROM users u
  WHERE u.account_id = user_account_id;

  RETURN result;
END;
$$;


ALTER FUNCTION "public"."get_full_user_profile"("user_account_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_posts_hot"("from_offset" integer, "to_offset" integer) RETURNS SETOF "json"
    LANGUAGE "sql" STABLE
    AS $$
  SELECT row_to_json(result)
  FROM (
    SELECT
      p.*,
      (SELECT row_to_json(u) FROM users u WHERE u.account_id = p.author_id) AS users,
      COALESCE((SELECT json_agg(pv) FROM posts_votes pv WHERE pv.post_id = p.id), '[]'::json) AS posts_votes,
      COALESCE((SELECT json_agg(pa) FROM post_attachments pa WHERE pa.post_id = p.id), '[]'::json) AS post_attachments,
      (SELECT row_to_json(c) FROM communities c WHERE c.id = p.community_id) AS communities,
      json_build_array(json_build_object('count', (SELECT COUNT(*) FROM comments cm WHERE cm.post_id = p.id))) AS comments
    FROM posts p
    WHERE p.deleted = false
    ORDER BY p.net_votes::float / POWER(EXTRACT(EPOCH FROM (now() - p.created_at)) / 3600 + 2, 1.8) DESC
    LIMIT (to_offset - from_offset + 1)
    OFFSET from_offset
  ) result;
$$;


ALTER FUNCTION "public"."get_posts_hot"("from_offset" integer, "to_offset" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_posts_rising"("from_offset" integer, "to_offset" integer) RETURNS SETOF "json"
    LANGUAGE "sql" STABLE
    AS $$
  SELECT row_to_json(result)
  FROM (
    SELECT
      p.*,
      (SELECT row_to_json(u) FROM users u WHERE u.account_id = p.author_id) AS users,
      COALESCE((SELECT json_agg(pv) FROM posts_votes pv WHERE pv.post_id = p.id), '[]'::json) AS posts_votes,
      COALESCE((SELECT json_agg(pa) FROM post_attachments pa WHERE pa.post_id = p.id), '[]'::json) AS post_attachments,
      (SELECT row_to_json(c) FROM communities c WHERE c.id = p.community_id) AS communities,
      json_build_array(json_build_object('count', (SELECT COUNT(*) FROM comments cm WHERE cm.post_id = p.id))) AS comments
    FROM posts p
    LEFT JOIN posts_votes recent_pv
      ON recent_pv.post_id = p.id AND recent_pv.created_at > now() - interval '6 hours'
    WHERE p.deleted = false
    GROUP BY p.id
    ORDER BY COUNT(recent_pv.id)::float / (EXTRACT(EPOCH FROM (now() - p.created_at)) / 3600 + 1) DESC
    LIMIT (to_offset - from_offset + 1)
    OFFSET from_offset
  ) result;
$$;


ALTER FUNCTION "public"."get_posts_rising"("from_offset" integer, "to_offset" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."track_post_visit"("p_user_id" "uuid", "p_post_id" "uuid", "p_community_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    INSERT INTO public.visited_posts (user_id, post_id, visited_at)
    VALUES (p_user_id, p_post_id, now())
    ON CONFLICT (user_id, post_id)
    DO UPDATE SET visited_at = now();

    INSERT INTO public.recently_visited_communities (user_id, community_id, visited_at)
    VALUES (p_user_id, p_community_id, now())
    ON CONFLICT (user_id, community_id)
    DO UPDATE SET visited_at = now();

    INSERT INTO public.recently_visited_posts (user_id, post_id, visited_at)
    VALUES (p_user_id, p_post_id, now())
    ON CONFLICT (user_id, post_id)
    DO UPDATE SET visited_at = now();

    DELETE FROM public.recently_visited_posts
    WHERE user_id = p_user_id AND id NOT IN (
        SELECT id
        FROM public.recently_visited_posts
        WHERE user_id = p_user_id
        ORDER BY visited_at DESC
        LIMIT 10
    );

END;
$$;


ALTER FUNCTION "public"."track_post_visit"("p_user_id" "uuid", "p_post_id" "uuid", "p_community_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_comment_vote_and_karma"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  comment_creator_id uuid;
  new_net_votes integer;
BEGIN
  -- Get comment creator
  SELECT creator_id INTO comment_creator_id
  FROM public.comments
  WHERE id = COALESCE(NEW.comment_id, OLD.comment_id);

  -- Recalculate net votes EXCLUDING self-votes
  SELECT
    COALESCE(SUM(CASE
      WHEN vote_type = 'upvote' THEN 1
      WHEN vote_type = 'downvote' THEN -1
      ELSE 0 END), 0)
  INTO new_net_votes
  FROM public.comments_votes
  WHERE comment_id = COALESCE(NEW.comment_id, OLD.comment_id)
    AND voter_id != comment_creator_id;

  -- Update comment
  UPDATE public.comments
  SET net_votes = new_net_votes,
      karma_score = public.calculate_karma(new_net_votes)
  WHERE id = COALESCE(NEW.comment_id, OLD.comment_id);

  -- Update comment_karma for the creator
  UPDATE public.users
  SET comment_karma = (
    SELECT COALESCE(SUM(karma_score), 0)
    FROM public.comments
    WHERE creator_id = comment_creator_id
  )
  WHERE account_id = comment_creator_id;

  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."update_comment_vote_and_karma"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_post_vote_and_karma"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  post_author_id uuid;
  new_net_votes integer;
BEGIN
  -- Get post author
  SELECT author_id INTO post_author_id
  FROM public.posts
  WHERE id = COALESCE(NEW.post_id, OLD.post_id);

  -- Recalculate net votes EXCLUDING self-votes
  SELECT
    COALESCE(SUM(CASE
      WHEN vote_type = 'upvote' THEN 1
      WHEN vote_type = 'downvote' THEN -1
      ELSE 0 END), 0)
  INTO new_net_votes
  FROM public.posts_votes
  WHERE post_id = COALESCE(NEW.post_id, OLD.post_id)
    AND voter_id != post_author_id;

  -- Update post
  UPDATE public.posts
  SET net_votes = new_net_votes,
      karma_score = public.calculate_karma(new_net_votes)
  WHERE id = COALESCE(NEW.post_id, OLD.post_id);

  -- Update post_karma for the author
  UPDATE public.users
  SET post_karma = (
    SELECT COALESCE(SUM(karma_score), 0)
    FROM public.posts
    WHERE author_id = post_author_id
  )
  WHERE account_id = post_author_id;

  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."update_post_vote_and_karma"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW(); -- Automatically sets to current timestamp
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_verified_since"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Check if the verified column is being updated
    IF TG_OP = 'UPDATE' AND NEW.verified IS DISTINCT FROM OLD.verified THEN
        -- If verified is set to true, set verified_since to now()
        IF NEW.verified = TRUE THEN
            NEW.verified_since = NOW();
        -- If verified is set to false, set verified_since to null
        ELSE
            NEW.verified_since = NULL;
        END IF;
    END IF;
    
    -- For inserts where verified is true, set verified_since to now()
    IF TG_OP = 'INSERT' AND NEW.verified = TRUE THEN
        NEW.verified_since = NOW();
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_verified_since"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_visited_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.visited_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_visited_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."comment_follows" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "text" NOT NULL,
    "comment_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."comment_follows" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."comments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "post_id" "uuid",
    "creator_id" "uuid",
    "parent_id" "uuid",
    "body" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "net_votes" integer DEFAULT 0 NOT NULL,
    "karma_score" integer DEFAULT 0 NOT NULL,
    "deleted" boolean DEFAULT false NOT NULL,
    "deleted_at" timestamp with time zone,
    "slug" "text" NOT NULL,
    "stripped_body" "text"
);


ALTER TABLE "public"."comments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."comments_votes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "comment_id" "uuid",
    "voter_id" "uuid",
    "vote_type" "public"."vote_type" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."comments_votes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."communities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "creator_id" "uuid",
    "community_name" "text" NOT NULL,
    "description" "text",
    "image_url" "text",
    "banner_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" time with time zone DEFAULT "now"(),
    "type" "public"."community_type" NOT NULL,
    "community_name_lower" "text" NOT NULL,
    "display_name" "text",
    "currently_viewing_nickname" "text",
    "members_nickname" "text",
    "verified" boolean DEFAULT false NOT NULL,
    "verified_since" timestamp with time zone,
    "topics" "text"[] DEFAULT '{}'::"text"[]
);


ALTER TABLE "public"."communities" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."community_memberships" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "community_id" "uuid" NOT NULL,
    "joined_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."community_memberships" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."community_moderators" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "community_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."community_moderators" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."conversation_participants" (
    "conversation_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "last_read_at" timestamp with time zone
);

ALTER TABLE ONLY "public"."conversation_participants" REPLICA IDENTITY FULL;


ALTER TABLE "public"."conversation_participants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."conversations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "last_message_at" timestamp with time zone
);

ALTER TABLE ONLY "public"."conversations" REPLICA IDENTITY FULL;


ALTER TABLE "public"."conversations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."hidden_posts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "post_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."hidden_posts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "conversation_id" "uuid" NOT NULL,
    "sender_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "edited" boolean DEFAULT false NOT NULL,
    "deleted" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE ONLY "public"."messages" REPLICA IDENTITY FULL;


ALTER TABLE "public"."messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "text" NOT NULL,
    "actor_id" "text",
    "actor_username" "text",
    "type" "text" NOT NULL,
    "read" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "post_id" "uuid",
    "comment_id" "uuid",
    "post_slug" "text",
    "community_name" "text"
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."post_attachments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "post_id" "uuid" NOT NULL,
    "file_url" "text" NOT NULL,
    "width" integer,
    "height" integer,
    "alt_text" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "caption" "text",
    "script" "jsonb"
);


ALTER TABLE "public"."post_attachments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."posts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "community_id" "uuid" NOT NULL,
    "author_id" "uuid",
    "title" "text" NOT NULL,
    "content" "text",
    "url" "text",
    "post_type" "public"."post_type" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "slug" "text" NOT NULL,
    "net_votes" integer DEFAULT 0 NOT NULL,
    "karma_score" integer DEFAULT 0 NOT NULL,
    "deleted" boolean DEFAULT false NOT NULL,
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."posts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."posts_votes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "vote_type" "public"."vote_type" NOT NULL,
    "post_id" "uuid",
    "voter_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."posts_votes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."recent_searches" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "query" "text" NOT NULL,
    "searched_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."recent_searches" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."recently_visited_communities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "visited_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "community_id" "uuid" NOT NULL
);


ALTER TABLE "public"."recently_visited_communities" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."recently_visited_posts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "visited_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "post_id" "uuid" NOT NULL,
    "history_ref" "uuid"
);


ALTER TABLE "public"."recently_visited_posts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."saved_comments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "comment_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."saved_comments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."saved_posts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "post_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."saved_posts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."social_links" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "account_id" "uuid" NOT NULL,
    "social_name" "text" NOT NULL,
    "link" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "username" "text" NOT NULL,
    "account_username" "text" NOT NULL
);


ALTER TABLE "public"."social_links" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "account_id" "uuid" NOT NULL,
    "username" "text" NOT NULL,
    "gender" "public"."Gender" NOT NULL,
    "avatar_url" "text",
    "banner_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "email" "text" NOT NULL,
    "display_name" "text",
    "description" "text",
    "username_lower" "text" NOT NULL,
    "post_karma" integer DEFAULT 0 NOT NULL,
    "verified" boolean DEFAULT false NOT NULL,
    "verified_since" timestamp with time zone,
    "comment_karma" integer DEFAULT 0 NOT NULL
);


ALTER TABLE "public"."users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."visited_posts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "visited_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "post_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL
);


ALTER TABLE "public"."visited_posts" OWNER TO "postgres";


ALTER TABLE ONLY "public"."comment_follows"
    ADD CONSTRAINT "comment_follows_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."comment_follows"
    ADD CONSTRAINT "comment_follows_user_id_comment_id_key" UNIQUE ("user_id", "comment_id");



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."comments_votes"
    ADD CONSTRAINT "comments_votes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."communities"
    ADD CONSTRAINT "communities_community_name_key" UNIQUE ("community_name");



ALTER TABLE ONLY "public"."communities"
    ADD CONSTRAINT "communities_community_name_lower_key" UNIQUE ("community_name_lower");



ALTER TABLE ONLY "public"."communities"
    ADD CONSTRAINT "communities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."community_memberships"
    ADD CONSTRAINT "community_memberships_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."community_moderators"
    ADD CONSTRAINT "community_moderators_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."conversation_participants"
    ADD CONSTRAINT "conversation_participants_pkey" PRIMARY KEY ("conversation_id", "user_id");



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."hidden_posts"
    ADD CONSTRAINT "hidden_posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."hidden_posts"
    ADD CONSTRAINT "hidden_posts_user_id_post_id_key" UNIQUE ("user_id", "post_id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."post_attachments"
    ADD CONSTRAINT "post_attachments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."posts_votes"
    ADD CONSTRAINT "posts_votes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."posts_votes"
    ADD CONSTRAINT "posts_votes_unique" UNIQUE ("post_id", "voter_id");



ALTER TABLE ONLY "public"."recent_searches"
    ADD CONSTRAINT "recent_searches_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."recent_searches"
    ADD CONSTRAINT "recent_searches_user_query_unique" UNIQUE ("user_id", "query");



ALTER TABLE ONLY "public"."recently_visited_communities"
    ADD CONSTRAINT "recently_visited_communities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."recently_visited_posts"
    ADD CONSTRAINT "recently_visited_posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."saved_comments"
    ADD CONSTRAINT "saved_comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."saved_comments"
    ADD CONSTRAINT "saved_comments_user_id_comment_id_key" UNIQUE ("user_id", "comment_id");



ALTER TABLE ONLY "public"."saved_posts"
    ADD CONSTRAINT "saved_posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."saved_posts"
    ADD CONSTRAINT "saved_posts_user_id_post_id_key" UNIQUE ("user_id", "post_id");



ALTER TABLE ONLY "public"."social_links"
    ADD CONSTRAINT "social_links_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."comments_votes"
    ADD CONSTRAINT "unique_comment_voter_pair" UNIQUE ("comment_id", "voter_id");



ALTER TABLE ONLY "public"."recently_visited_posts"
    ADD CONSTRAINT "unique_recent_post" UNIQUE ("user_id", "post_id");



ALTER TABLE ONLY "public"."recently_visited_communities"
    ADD CONSTRAINT "unique_user_community" UNIQUE ("user_id", "community_id");



ALTER TABLE ONLY "public"."recently_visited_posts"
    ADD CONSTRAINT "unique_user_post" UNIQUE ("user_id", "post_id");



ALTER TABLE ONLY "public"."visited_posts"
    ADD CONSTRAINT "unique_user_post_new" UNIQUE ("user_id", "post_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_account_id_key" UNIQUE ("account_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_username_lower_key" UNIQUE ("username_lower");



ALTER TABLE ONLY "public"."visited_posts"
    ADD CONSTRAINT "visited_posts_pkey" PRIMARY KEY ("id");



CREATE INDEX "conv_participants_user" ON "public"."conversation_participants" USING "btree" ("user_id");



CREATE INDEX "messages_conv_created" ON "public"."messages" USING "btree" ("conversation_id", "created_at");



CREATE INDEX "notifications_user_id_created_at_idx" ON "public"."notifications" USING "btree" ("user_id", "created_at" DESC);



CREATE OR REPLACE TRIGGER "communities_verified_update" BEFORE INSERT OR UPDATE OF "verified" ON "public"."communities" FOR EACH ROW EXECUTE FUNCTION "public"."update_verified_since"();



CREATE OR REPLACE TRIGGER "trigger_comment_vote_update" AFTER INSERT OR DELETE OR UPDATE ON "public"."comments_votes" FOR EACH ROW EXECUTE FUNCTION "public"."update_comment_vote_and_karma"();



CREATE OR REPLACE TRIGGER "trigger_post_vote_update" AFTER INSERT OR DELETE OR UPDATE ON "public"."posts_votes" FOR EACH ROW EXECUTE FUNCTION "public"."update_post_vote_and_karma"();



CREATE OR REPLACE TRIGGER "trigger_update_users_updated_at" AFTER INSERT OR UPDATE ON "public"."posts_votes" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_update_users_updated_at" BEFORE UPDATE ON "public"."social_links" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_update_users_updated_at" BEFORE UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_visited_at" BEFORE UPDATE ON "public"."recently_visited_communities" FOR EACH ROW EXECUTE FUNCTION "public"."update_visited_at_column"();



CREATE OR REPLACE TRIGGER "update_visited_at" BEFORE UPDATE ON "public"."recently_visited_posts" FOR EACH ROW EXECUTE FUNCTION "public"."update_visited_at_column"();



CREATE OR REPLACE TRIGGER "users_verified_update" BEFORE INSERT OR UPDATE OF "verified" ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."update_verified_since"();



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("account_id");



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id");



ALTER TABLE ONLY "public"."comments_votes"
    ADD CONSTRAINT "comments_votes_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comments_votes"
    ADD CONSTRAINT "comments_votes_voter_id_fkey" FOREIGN KEY ("voter_id") REFERENCES "public"."users"("account_id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."communities"
    ADD CONSTRAINT "communities_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("account_id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."community_memberships"
    ADD CONSTRAINT "community_memberships_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."community_memberships"
    ADD CONSTRAINT "community_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("account_id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."community_moderators"
    ADD CONSTRAINT "community_moderators_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."community_moderators"
    ADD CONSTRAINT "community_moderators_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("account_id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."conversation_participants"
    ADD CONSTRAINT "conversation_participants_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."conversation_participants"
    ADD CONSTRAINT "conversation_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."hidden_posts"
    ADD CONSTRAINT "hidden_posts_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."hidden_posts"
    ADD CONSTRAINT "hidden_posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."post_attachments"
    ADD CONSTRAINT "post_attachments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."users"("account_id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."posts_votes"
    ADD CONSTRAINT "posts_votes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."posts_votes"
    ADD CONSTRAINT "posts_votes_voter_id_fkey" FOREIGN KEY ("voter_id") REFERENCES "public"."users"("account_id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."recent_searches"
    ADD CONSTRAINT "recent_searches_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."recently_visited_communities"
    ADD CONSTRAINT "recently_visited_communities_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."recently_visited_communities"
    ADD CONSTRAINT "recently_visited_communities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("account_id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."recently_visited_posts"
    ADD CONSTRAINT "recently_visited_posts_history_ref_fkey" FOREIGN KEY ("history_ref") REFERENCES "public"."visited_posts"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."recently_visited_posts"
    ADD CONSTRAINT "recently_visited_posts_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."recently_visited_posts"
    ADD CONSTRAINT "recently_visited_posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("account_id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."saved_comments"
    ADD CONSTRAINT "saved_comments_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."saved_comments"
    ADD CONSTRAINT "saved_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."saved_posts"
    ADD CONSTRAINT "saved_posts_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."saved_posts"
    ADD CONSTRAINT "saved_posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."social_links"
    ADD CONSTRAINT "social_links_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."users"("account_id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."social_links"
    ADD CONSTRAINT "social_links_account_username_fkey" FOREIGN KEY ("account_username") REFERENCES "public"."users"("username_lower") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."visited_posts"
    ADD CONSTRAINT "visited_posts_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."visited_posts"
    ADD CONSTRAINT "visited_posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("account_id") ON UPDATE CASCADE ON DELETE CASCADE;



CREATE POLICY "Allow community creators to delete community moderators" ON "public"."community_moderators" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = ( SELECT "communities"."creator_id"
   FROM "public"."communities"
  WHERE ("communities"."id" = "community_moderators"."community_id"))));



CREATE POLICY "Allow community creators to update community moderators" ON "public"."community_moderators" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = ( SELECT "communities"."creator_id"
   FROM "public"."communities"
  WHERE ("communities"."id" = "community_moderators"."community_id"))));



CREATE POLICY "Allow community moderators to delete posts" ON "public"."posts" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") IN ( SELECT "community_moderators"."user_id"
   FROM "public"."community_moderators"
  WHERE ("community_moderators"."community_id" = "posts"."community_id"))));



CREATE POLICY "Allow users to delete their own social links" ON "public"."social_links" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "account_id"));



CREATE POLICY "Allow users to insert their own social links" ON "public"."social_links" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "account_id"));



CREATE POLICY "Allow users to update their own comments" ON "public"."comments" FOR UPDATE USING (("creator_id" = ( SELECT "auth"."uid"() AS "uid"))) WITH CHECK (("creator_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Allow users to update their own social links" ON "public"."social_links" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "account_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "account_id"));



CREATE POLICY "Content creators can delete their own comments" ON "public"."comments" FOR DELETE TO "authenticated" USING (("creator_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Enable delete for post attachments by author." ON "public"."post_attachments" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = ( SELECT "posts"."author_id"
   FROM "public"."posts"
  WHERE ("posts"."id" = "post_attachments"."post_id"))));



CREATE POLICY "Enable delete for users based on author_id" ON "public"."posts" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "author_id"));



CREATE POLICY "Enable delete for users based on user_id" ON "public"."community_memberships" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable delete for users based on voter_id" ON "public"."posts_votes" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "voter_id"));



CREATE POLICY "Enable insert for authenticated users only" ON "public"."comments" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."comments_votes" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."communities" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."community_memberships" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."community_moderators" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."post_attachments" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."posts" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."posts_votes" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."recently_visited_communities" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."recently_visited_posts" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."visited_posts" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for users" ON "public"."users" FOR INSERT WITH CHECK (true);



CREATE POLICY "Enable read access for all users" ON "public"."comments" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."comments_votes" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."communities" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."community_memberships" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."community_moderators" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."post_attachments" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."posts" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."posts_votes" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."social_links" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."users" FOR SELECT USING (true);



CREATE POLICY "Enable update for post attachments by author." ON "public"."post_attachments" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = ( SELECT "posts"."author_id"
   FROM "public"."posts"
  WHERE ("posts"."id" = "post_attachments"."post_id"))));



CREATE POLICY "Enable update for users based on user_id" ON "public"."community_memberships" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable update for users based on voter_id" ON "public"."posts_votes" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "voter_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "voter_id"));



CREATE POLICY "Enable updates for users based on author_id" ON "public"."posts" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "author_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "author_id"));



CREATE POLICY "Enable users to update their own data only" ON "public"."users" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "account_id")) WITH CHECK (("auth"."uid"() = "account_id"));



CREATE POLICY "Only community moderators can delete communities" ON "public"."communities" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") IN ( SELECT "community_moderators"."user_id"
   FROM "public"."community_moderators"
  WHERE ("community_moderators"."community_id" = "community_moderators"."id"))));



CREATE POLICY "Only community moderators can update communities" ON "public"."communities" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") IN ( SELECT "community_moderators"."user_id"
   FROM "public"."community_moderators"
  WHERE ("community_moderators"."community_id" = "communities"."id")))) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") IN ( SELECT "community_moderators"."user_id"
   FROM "public"."community_moderators"
  WHERE ("community_moderators"."community_id" = "communities"."id"))));



CREATE POLICY "Service can insert notifications" ON "public"."notifications" FOR INSERT WITH CHECK (true);



CREATE POLICY "Users can delete only their own recently visited posts" ON "public"."recently_visited_posts" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can delete their own visited communities" ON "public"."recently_visited_communities" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can delete their own visited posts" ON "public"."visited_posts" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can delete their own votes" ON "public"."comments_votes" FOR DELETE TO "authenticated" USING (("voter_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can edit their own recently visited posts" ON "public"."recently_visited_posts" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can manage their own searches" ON "public"."recent_searches" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own recently visited communities" ON "public"."recently_visited_communities" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can update their own visited posts" ON "public"."visited_posts" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can update their own votes" ON "public"."comments_votes" FOR UPDATE TO "authenticated" USING (("voter_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can view their own community visits" ON "public"."recently_visited_communities" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can view their own recently visited posts" ON "public"."recently_visited_posts" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can view their own visited posts" ON "public"."visited_posts" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users manage own comment follows" ON "public"."comment_follows" USING (("user_id" = ("auth"."uid"())::"text")) WITH CHECK (("user_id" = ("auth"."uid"())::"text"));



CREATE POLICY "Users manage own hidden posts" ON "public"."hidden_posts" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users manage own saved comments" ON "public"."saved_comments" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users manage own saved posts" ON "public"."saved_posts" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users see own notifications" ON "public"."notifications" FOR SELECT USING (("user_id" = ("auth"."uid"())::"text"));



CREATE POLICY "Users update own notifications" ON "public"."notifications" FOR UPDATE USING (("user_id" = ("auth"."uid"())::"text"));



ALTER TABLE "public"."comment_follows" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."comments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."comments_votes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."communities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."community_memberships" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."community_moderators" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."conversation_participants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."conversations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."hidden_posts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "participants can read messages" ON "public"."messages" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."conversation_participants"
  WHERE (("conversation_participants"."conversation_id" = "messages"."conversation_id") AND ("conversation_participants"."user_id" = "auth"."uid"())))));



CREATE POLICY "participants can see their conversations" ON "public"."conversations" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."conversation_participants"
  WHERE (("conversation_participants"."conversation_id" = "conversations"."id") AND ("conversation_participants"."user_id" = "auth"."uid"())))));



ALTER TABLE "public"."post_attachments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."posts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."posts_votes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."recent_searches" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."recently_visited_communities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."recently_visited_posts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."saved_comments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."saved_posts" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "sender can update own messages" ON "public"."messages" FOR UPDATE USING (("sender_id" = "auth"."uid"()));



ALTER TABLE "public"."social_links" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "users see own participant rows" ON "public"."conversation_participants" USING (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."visited_posts" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."comment_follows";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."conversation_participants";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."conversations";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."messages";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."notifications";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";




















































































































































































GRANT ALL ON FUNCTION "public"."build_reply_tree"("comment_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."build_reply_tree"("comment_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."build_reply_tree"("comment_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_karma"("score" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_karma"("score" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_karma"("score" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."fetch_comment_with_replies_by_slug"("slug" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."fetch_comment_with_replies_by_slug"("slug" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."fetch_comment_with_replies_by_slug"("slug" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."fetch_replies"("parent_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."fetch_replies"("parent_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."fetch_replies"("parent_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_comment_with_replies_by_slug"("comment_slug" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_comment_with_replies_by_slug"("comment_slug" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_comment_with_replies_by_slug"("comment_slug" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_comments_by_best"("post" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_comments_by_best"("post" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_comments_by_best"("post" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_comments_by_controversial"("post" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_comments_by_controversial"("post" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_comments_by_controversial"("post" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_full_user_profile"("user_account_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_full_user_profile"("user_account_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_full_user_profile"("user_account_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_posts_hot"("from_offset" integer, "to_offset" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_posts_hot"("from_offset" integer, "to_offset" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_posts_hot"("from_offset" integer, "to_offset" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_posts_rising"("from_offset" integer, "to_offset" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_posts_rising"("from_offset" integer, "to_offset" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_posts_rising"("from_offset" integer, "to_offset" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."track_post_visit"("p_user_id" "uuid", "p_post_id" "uuid", "p_community_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."track_post_visit"("p_user_id" "uuid", "p_post_id" "uuid", "p_community_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."track_post_visit"("p_user_id" "uuid", "p_post_id" "uuid", "p_community_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_comment_vote_and_karma"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_comment_vote_and_karma"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_comment_vote_and_karma"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_post_vote_and_karma"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_post_vote_and_karma"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_post_vote_and_karma"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_verified_since"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_verified_since"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_verified_since"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_visited_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_visited_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_visited_at_column"() TO "service_role";



























GRANT ALL ON TABLE "public"."comment_follows" TO "anon";
GRANT ALL ON TABLE "public"."comment_follows" TO "authenticated";
GRANT ALL ON TABLE "public"."comment_follows" TO "service_role";



GRANT ALL ON TABLE "public"."comments" TO "anon";
GRANT ALL ON TABLE "public"."comments" TO "authenticated";
GRANT ALL ON TABLE "public"."comments" TO "service_role";



GRANT ALL ON TABLE "public"."comments_votes" TO "anon";
GRANT ALL ON TABLE "public"."comments_votes" TO "authenticated";
GRANT ALL ON TABLE "public"."comments_votes" TO "service_role";



GRANT ALL ON TABLE "public"."communities" TO "anon";
GRANT ALL ON TABLE "public"."communities" TO "authenticated";
GRANT ALL ON TABLE "public"."communities" TO "service_role";



GRANT ALL ON TABLE "public"."community_memberships" TO "anon";
GRANT ALL ON TABLE "public"."community_memberships" TO "authenticated";
GRANT ALL ON TABLE "public"."community_memberships" TO "service_role";



GRANT ALL ON TABLE "public"."community_moderators" TO "anon";
GRANT ALL ON TABLE "public"."community_moderators" TO "authenticated";
GRANT ALL ON TABLE "public"."community_moderators" TO "service_role";



GRANT ALL ON TABLE "public"."conversation_participants" TO "anon";
GRANT ALL ON TABLE "public"."conversation_participants" TO "authenticated";
GRANT ALL ON TABLE "public"."conversation_participants" TO "service_role";



GRANT ALL ON TABLE "public"."conversations" TO "anon";
GRANT ALL ON TABLE "public"."conversations" TO "authenticated";
GRANT ALL ON TABLE "public"."conversations" TO "service_role";



GRANT ALL ON TABLE "public"."hidden_posts" TO "anon";
GRANT ALL ON TABLE "public"."hidden_posts" TO "authenticated";
GRANT ALL ON TABLE "public"."hidden_posts" TO "service_role";



GRANT ALL ON TABLE "public"."messages" TO "anon";
GRANT ALL ON TABLE "public"."messages" TO "authenticated";
GRANT ALL ON TABLE "public"."messages" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."post_attachments" TO "anon";
GRANT ALL ON TABLE "public"."post_attachments" TO "authenticated";
GRANT ALL ON TABLE "public"."post_attachments" TO "service_role";



GRANT ALL ON TABLE "public"."posts" TO "anon";
GRANT ALL ON TABLE "public"."posts" TO "authenticated";
GRANT ALL ON TABLE "public"."posts" TO "service_role";



GRANT ALL ON TABLE "public"."posts_votes" TO "anon";
GRANT ALL ON TABLE "public"."posts_votes" TO "authenticated";
GRANT ALL ON TABLE "public"."posts_votes" TO "service_role";



GRANT ALL ON TABLE "public"."recent_searches" TO "anon";
GRANT ALL ON TABLE "public"."recent_searches" TO "authenticated";
GRANT ALL ON TABLE "public"."recent_searches" TO "service_role";



GRANT ALL ON TABLE "public"."recently_visited_communities" TO "anon";
GRANT ALL ON TABLE "public"."recently_visited_communities" TO "authenticated";
GRANT ALL ON TABLE "public"."recently_visited_communities" TO "service_role";



GRANT ALL ON TABLE "public"."recently_visited_posts" TO "anon";
GRANT ALL ON TABLE "public"."recently_visited_posts" TO "authenticated";
GRANT ALL ON TABLE "public"."recently_visited_posts" TO "service_role";



GRANT ALL ON TABLE "public"."saved_comments" TO "anon";
GRANT ALL ON TABLE "public"."saved_comments" TO "authenticated";
GRANT ALL ON TABLE "public"."saved_comments" TO "service_role";



GRANT ALL ON TABLE "public"."saved_posts" TO "anon";
GRANT ALL ON TABLE "public"."saved_posts" TO "authenticated";
GRANT ALL ON TABLE "public"."saved_posts" TO "service_role";



GRANT ALL ON TABLE "public"."social_links" TO "anon";
GRANT ALL ON TABLE "public"."social_links" TO "authenticated";
GRANT ALL ON TABLE "public"."social_links" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



GRANT ALL ON TABLE "public"."visited_posts" TO "anon";
GRANT ALL ON TABLE "public"."visited_posts" TO "authenticated";
GRANT ALL ON TABLE "public"."visited_posts" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";































