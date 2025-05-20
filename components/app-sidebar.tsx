"use client"
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
import SidebarDialog from "./SidebarDialog"
import { useState } from "react"
import { useGeneralProfile } from "@/app/context/GeneralProfileContext"
import { useRouter } from 'nextjs-toploader/app'

type SidebarDialogContent = {
  title: string,
  description: string
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [dialogContent, setDialogContent] = useState<SidebarDialogContent>()
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

  const handleDialogOpen = (content: SidebarDialogContent) => {
    setDialogContent(content)
    setOpen(true)
  }

  return (
    <Sidebar collapsible="icon" {...props} className="mt-14 sidebar-animation">
      <SidebarContent>
        <SidebarGroup className="mt-2">
          <SidebarMenu>
            {mainItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild tooltip={item.title} className="hover:bg-reddit-gray rounded-sm cursor-pointer">
                  <div aria-disabled={item.title !== "Home"} className="select-none" onClick={() => {
                    router.push(item.url)
                  }}>
                    <item.icon />
                    <span>{item.title}</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <hr className="mx-4" />
        <SidebarGroup>
          {
            user &&
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
                    <SidebarMenuButton
                      onClick={() => {
                        handleDialogOpen({
                          title: "Create a Community",
                          description: "Create your own unique community and start building a space for people with similar interests."
                        })
                      }}
                      asChild tooltip="Create a community" className="hover:bg-reddit-gray rounded-sm select-none cursor-pointer">
                      <span>
                        <PlusCircle />
                        <span>Create a community</span>
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </CollapsibleContent>
            </Collapsible>
          }
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
      <SidebarDialog open={open} setOpen={setOpen} dialogContent={dialogContent} />
    </Sidebar>
  )
}
