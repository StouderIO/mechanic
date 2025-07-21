import { Link } from '@tanstack/react-router'
import {
  ArchiveIcon,
  BoxesIcon,
  CoinsIcon,
  KeyRoundIcon,
  LayoutDashboardIcon,
} from 'lucide-react'
import { type ComponentProps, type JSX, useMemo } from 'react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar.tsx'
import { useGetMetaInfo } from '@/generated/orval/mechanic/meta-controller/meta-controller.ts'
import { Spinner } from './ui/spinner'

interface LinkDef {
  icon?: JSX.Element
  title: string
  url: string
  external: boolean
}

interface GroupDef {
  title: string
  items: LinkDef[]
}

const groups: GroupDef[] = [
  {
    title: 'Mechanic',
    items: [
      {
        icon: <LayoutDashboardIcon />,
        title: 'Dashboard',
        url: '/',
        external: false,
      },
      {
        icon: <BoxesIcon />,
        title: 'Cluster',
        url: '/cluster',
        external: false,
      },
      {
        icon: <ArchiveIcon />,
        title: 'Buckets',
        url: '/buckets',
        external: false,
      },
      {
        icon: <KeyRoundIcon />,
        title: 'Keys',
        url: '/keys',
        external: false,
      },
      {
        icon: <CoinsIcon />,
        title: 'Admin tokens',
        url: '/admin-tokens',
        external: false,
      },
    ],
  },
  {
    title: 'Garage',
    items: [
      {
        title: 'Website',
        url: 'https://garagehq.deuxfleurs.fr/',
        external: true,
      },
      {
        title: 'Source',
        url: 'https://git.deuxfleurs.fr/Deuxfleurs/garage',
        external: true,
      },
      {
        title: 'Documentation',
        url: 'https://garagehq.deuxfleurs.fr/documentation',
        external: true,
      },
    ],
  },
]

export default function AppSidebar({
  ...props
}: ComponentProps<typeof Sidebar>) {
  const { data } = useGetMetaInfo()

  const version = useMemo(
    () => data?.version ?? <Spinner size="xsmall" />,
    [data],
  )

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/">
                <div className="flex aspect-square size-10 items-center justify-center">
                  <img
                    src="/mechanic-logo.svg"
                    alt="Garage logo"
                    className="size-10"
                  />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">Mechanic</span>
                  <span className="">{version}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="justify-between">
        {groups.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      {item.external ? (
                        <a href={item.url} target="_blank">
                          {item.icon} {item.title}
                        </a>
                      ) : (
                        <Link to={item.url}>
                          {item.icon} {item.title}
                        </Link>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  )
}
