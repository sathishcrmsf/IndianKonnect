"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, Plus, MessageCircle, User } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/home", icon: Home, label: "Home" },
  { href: "/search", icon: Search, label: "Search" },
  { href: "/create", icon: Plus, label: "Post" },
  { href: "/chats", icon: MessageCircle, label: "Chats" },
  { href: "/profile", icon: User, label: "Profile" },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href === "/home" && pathname === "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg px-4 py-2 transition-colors",
                isActive
                  ? "text-whatsapp-green"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

