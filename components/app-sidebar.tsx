import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { ChevronDown, Home, Layers, PlusCircle, Telescope, TrendingUp, Users } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  const mainItems = [
    {
      title: "Home",
      url: "#",
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

  return (
    <Sidebar collapsible="icon" {...props} className="mt-14">
      <SidebarContent>
        <SidebarGroup className="mt-2">
          <SidebarMenu>
            {mainItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild tooltip={item.title} className="hover:bg-reddit-gray rounded-sm">
                  <a href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <hr className="mx-4" />
        <SidebarGroup>
          <Collapsible defaultOpen className="group/collapsible">
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="flex w-full items-center rounded-sm">
                <Users className="mr-2 h-4 w-4" />
                COMMUNITIES
                <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Create a community" className="hover:bg-reddit-gray rounded-sm">
                    <a href="#">
                      <PlusCircle />
                      <span>Create a community</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
