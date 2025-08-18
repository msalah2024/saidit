"use client"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { ChevronDown, Home, Layers, PlusCircle, Telescope, TrendingUp, Users, History } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible"
import { useGeneralProfile } from "@/app/context/GeneralProfileContext"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import Image from "next/image"
import allCommunitiesLogo from "@/public/assets/images/saidit-slash.svg"
import Link from "next/link"
import { ScrollArea } from "./ui/scroll-area"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useGeneralProfile()

  const mainItems = [
    {
      title: "Home",
      url: "/",
      icon: Home,
    },
    {
      title: "Popular",
      url: "#",
      icon: TrendingUp,
    },
    {
      title: "Explore",
      url: "#",
      icon: Telescope,
    },
    {
      title: "All",
      url: "#",
      icon: Layers,
    },
  ]

  const handleDialogOpen = (content: { title: string, description: string }) => {
    window.dispatchEvent(new CustomEvent('openSidebarDialog', { detail: content }))
  }

  const { profile } = useGeneralProfile()

  return (
    <Sidebar collapsible="offcanvas" {...props} className="pt-14 sidebar-animation">
      <ScrollArea className="h-full no-overscroll pr-2">
        <SidebarContent>
          <SidebarGroup className="mt-2">
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title} className="hover:bg-reddit-gray py-5 rounded-sm cursor-pointer">
                    <Link scroll={false} aria-disabled={item.title !== "Home"} className="select-none" href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
          {
            user &&
            <hr className="mx-4" />
          }
          {
            user && profile?.recently_visited_communities && profile.recently_visited_communities.length > 0 &&
            <SidebarGroup>
              <Collapsible defaultOpen className="group/collapsible">
                <SidebarGroupLabel asChild>
                  <CollapsibleTrigger className="flex w-full items-center rounded-sm py-5">
                    <History className="mr-2 h-4 w-4" />
                    RECENT
                    <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                  </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent>
                  <SidebarMenu>
                    <SidebarMenuItem className="space-y-2">
                      {
                        profile?.recently_visited_communities?.map((community) => (<SidebarMenuButton
                          key={community.communities?.community_name}
                          asChild
                          className="select-none cursor-pointer py-5 hover:bg-reddit-gray rounded-sm "
                          tooltip={`s/${community.communities?.community_name}`}
                        >
                          <Link scroll={false} href={`/s/${community.communities?.community_name}`}>
                            <Avatar className="h-6 w-6 block">
                              <AvatarImage src={community.communities?.image_url || undefined} className="rounded-full" draggable={false} />
                              <AvatarFallback>s/</AvatarFallback>
                            </Avatar>
                            <span>s/{community.communities?.community_name}</span>
                          </Link>
                        </SidebarMenuButton>))
                      }
                    </SidebarMenuItem>
                  </SidebarMenu>
                </CollapsibleContent>
              </Collapsible>
            </SidebarGroup>
          }
          {
            profile?.recently_visited_communities && profile.recently_visited_communities.length > 0 &&
            <hr className="mx-4" />
          }
          {
            user &&
            <SidebarGroup>
              <Collapsible defaultOpen className="group/collapsible">
                <SidebarGroupLabel asChild>
                  <CollapsibleTrigger className="flex w-full items-center rounded-sm py-5">
                    <Users className="mr-2 h-4 w-4" />
                    COMMUNITIES
                    <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                  </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent>
                  <SidebarMenu>
                    <SidebarMenuItem className="space-y-2">
                      <SidebarMenuButton
                        onClick={() => {
                          handleDialogOpen({
                            title: "Create a Community",
                            description: "Create your own unique community and start building a space for people with similar interests."
                          })
                        }}
                        asChild tooltip="Create a community" className="hover:bg-reddit-gray py-5 rounded-sm select-none cursor-pointer">
                        <span>
                          <PlusCircle />
                          <span>Create a community</span>
                        </span>
                      </SidebarMenuButton>
                      {
                        profile?.community_memberships?.map((community) => (<SidebarMenuButton
                          key={community.id}
                          asChild
                          className="select-none cursor-pointer py-5 hover:bg-reddit-gray rounded-sm "
                          tooltip={`s/${community.communities.community_name}`}
                        >
                          <Link scroll={false} href={`/s/${community.communities.community_name}`}>
                            <Avatar className="h-6 w-6 block">
                              <AvatarImage src={community.communities.image_url || undefined} className="rounded-full" draggable={false} />
                              <AvatarFallback>s/</AvatarFallback>
                            </Avatar>
                            <span>s/{community.communities.community_name}</span>
                          </Link>
                        </SidebarMenuButton>))
                      }
                    </SidebarMenuItem>
                  </SidebarMenu>
                </CollapsibleContent>
              </Collapsible>
            </SidebarGroup>
          }
          <hr className="mx-4" />
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenuButton asChild tooltip={'All communities'} className="py-5 hover:bg-reddit-gray select-none cursor-pointer"
              >
                <Link scroll={false} href={'/communities'}>
                  <Image src={allCommunitiesLogo} alt="All communities logo" />
                  Communities
                </Link>
              </SidebarMenuButton>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </ScrollArea>
      <SidebarRail />
    </Sidebar >
  )
}
