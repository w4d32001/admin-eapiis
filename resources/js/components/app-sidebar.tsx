import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { GraduationCap, Images, LayoutGrid, Newspaper, UserCheck, Users } from 'lucide-react';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,    
    },
    {
        title: 'Tipos de docentes',
        href: '/teacher-types',
        icon: UserCheck,        
    },
    {
        title: 'Docentes',
        href: '/teachers',
        icon: Users,           
    },
    {
        title: 'Noticias',
        href: '/news',
        icon: Newspaper,        
    },
    {
        title: 'Galería',
        href: '/galleries',
        icon: Images           
    },
    {
        title: 'Semestres',
        href: '/semesters',
        icon: GraduationCap    
    },
    {
        title: 'Usuarios',
        href: '/users',
        icon: Users    
    }
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <div className="flex items-center gap-x-2">
                                    <img src="/img/eapiis.png" alt="Logo Universidad" className="w-10" />
                                    <div className="flex h-28 items-center gap-x-0.5">
                                        <hr className="h-full w-0.5 bg-accent" />
                                    </div>
                                    <img src="/img/text.png" alt="Logo Universidad" className="w-40" />
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
