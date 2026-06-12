import { fetchPostBySlug } from "@/app/actions";
import { fetchCommunityByName } from "@/app/actions";
import PostModal from "@/components/PostModal";
import PostNotFound from "@/components/PostNotFound";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function InterceptedPostPage({ params }: any) {
    const { slug, name } = await params;

    const [postResult, communityResult] = await Promise.all([
        fetchPostBySlug(slug),
        fetchCommunityByName(name),
    ]);

    if (!postResult.success || !postResult.data || !communityResult.success || !communityResult.data) {
        return <PostNotFound />;
    }

    return <PostModal post={postResult.data} community={communityResult.data} />;
}
