import ProfilePostsTab from "@/components/ProfilePostsTab"
import ProfileCommunitiesTab from "@/components/ProfileCommunitiesTab"
import ProfileVotedTab from "@/components/ProfileVotedTab"
import ProfileSavedTab from "@/components/ProfileSavedTab"
import ProfileHiddenTab from "@/components/ProfileHiddenTab"
import ProfileCommentsTab from "@/components/ProfileCommentsTab"

interface PageProps {
  searchParams: Promise<{ tab?: string; sort?: string }>
}

export default async function Page({ searchParams }: PageProps) {
  const { tab = "overview", sort = "new" } = await searchParams

  switch (tab) {
    case "communities":
      return <ProfileCommunitiesTab />
    case "upvoted":
      return <ProfileVotedTab type="upvote" />
    case "downvoted":
      return <ProfileVotedTab type="downvote" />
    case "saved":
      return <ProfileSavedTab />
    case "hidden":
      return <ProfileHiddenTab />
    case "comments":
      return <ProfileCommentsTab />
    case "posts":
    case "overview":
    default:
      return <ProfilePostsTab sort={sort} />
  }
}
