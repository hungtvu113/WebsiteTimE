import React from "react";
import { SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { Home, List, Calendar, BarChart2, Folder } from "lucide-react";

const links = [
  {
    label: "Trang chủ",
    href: "/",
    icon: <Home className="h-5 w-5" />,
  },
  {
    label: "Công việc",
    href: "/tasks",
    icon: <List className="h-5 w-5" />,
  },
  {
    label: "Thống kê",
    href: "/statistics",
    icon: <BarChart2 className="h-5 w-5" />,
  },
  {
    label: "Lịch",
    href: "/calendar",
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    label: "Dự án",
    href: "/projects",
    icon: <Folder className="h-5 w-5" />,
  },
];

export default function SidebarMenu() {
  return (
    <SidebarBody>
      <div className="flex flex-col gap-1">
        {links.map((link) => (
          <SidebarLink key={link.href} link={link} />
        ))}
      </div>
    </SidebarBody>
  );
}
