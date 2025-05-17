"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Package,
  PackagePlus,
  ShoppingCart,
  MoreHorizontal,
  Menu,
  Truck,
  PackageMinus,
  MapPin,
  ClipboardList,
  AlertTriangle,
  RepeatIcon,
  Zap,
  FilePlus,
  ClipboardCheck,
  Users,
  BarChart3,
  Settings,
  Database,
  Bell,
  LayoutDashboard,
} from "lucide-react"
import type React from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
  subItems?: NavItem[]
  gradient?: string
  badge?: number
}

const navItems: NavItem[] = [
  {
    title: "ダッシュボード",
    href: "/",
    icon: <LayoutDashboard className="h-4 w-4" />,
    gradient: "from-purple-500/20 to-pink-500/20",
  },
  {
    title: "在庫管理",
    href: "/inventory",
    icon: <Package className="h-4 w-4" />,
    gradient: "from-blue-500/20 to-cyan-500/20",
    subItems: [
      {
        title: "在庫一覧",
        href: "/inventory/list",
        icon: <ClipboardList className="h-4 w-4" />,
        gradient: "from-blue-500/20 to-cyan-500/20",
      },
      {
        title: "在庫登録・削除",
        href: "/inventory/register",
        icon: <PackagePlus className="h-4 w-4" />,
        gradient: "from-blue-500/20 to-cyan-500/20",
      },
      {
        title: "在庫入荷",
        href: "/inventory/receiving",
        icon: <Truck className="h-4 w-4" />,
        gradient: "from-green-500/20 to-emerald-500/20",
      },
      {
        title: "在庫出荷",
        href: "/inventory/shipping",
        icon: <PackageMinus className="h-4 w-4" />,
        gradient: "from-orange-500/20 to-amber-500/20",
      },
      {
        title: "場所登録・削除",
        href: "/inventory/locations",
        icon: <MapPin className="h-4 w-4" />,
        gradient: "from-purple-500/20 to-pink-500/20",
      },
    ],
  },
  {
    title: "商品発注",
    href: "/orders",
    icon: <ShoppingCart className="h-4 w-4" />,
    gradient: "from-violet-500/20 to-purple-500/20",
    subItems: [
      {
        title: "商品一覧",
        href: "/orders/products",
        icon: <Package className="h-4 w-4" />,
        gradient: "from-indigo-500/20 to-blue-500/20",
      },
      {
        title: "商品登録",
        href: "/orders/products/register",
        icon: <PackagePlus className="h-4 w-4" />,
        gradient: "from-blue-500/20 to-cyan-500/20",
      },
      {
        title: "アラート品発注",
        href: "/orders/alerts",
        icon: <AlertTriangle className="h-4 w-4" />,
        gradient: "from-red-500/20 to-orange-500/20",
        badge: 3,
      },
      {
        title: "商品発注（リピート）",
        href: "/orders/repeat",
        icon: <RepeatIcon className="h-4 w-4" />,
        gradient: "from-blue-500/20 to-cyan-500/20",
        badge: 12,
      },
      {
        title: "商品発注（スポット）",
        href: "/orders/spot",
        icon: <Zap className="h-4 w-4" />,
        gradient: "from-yellow-500/20 to-amber-500/20",
      },
    ],
  },
  {
    title: "その他",
    href: "/others",
    icon: <MoreHorizontal className="h-4 w-4" />,
    gradient: "from-neutral-500/20 to-slate-500/20",
    subItems: [
      {
        title: "棚卸",
        href: "/others/inventory-count",
        icon: <ClipboardCheck className="h-4 w-4" />,
        gradient: "from-blue-500/20 to-cyan-500/20",
      },
      {
        title: "ユーザー管理",
        href: "/others/users",
        icon: <Users className="h-4 w-4" />,
        gradient: "from-violet-500/20 to-purple-500/20",
      },
      {
        title: "データ分析",
        href: "/others/analytics",
        icon: <BarChart3 className="h-4 w-4" />,
        gradient: "from-green-500/20 to-emerald-500/20",
      },
      {
        title: "システム設定",
        href: "/others/settings",
        icon: <Settings className="h-4 w-4" />,
        gradient: "from-yellow-500/20 to-amber-500/20",
      },
      {
        title: "バックアップ",
        href: "/others/backup",
        icon: <Database className="h-4 w-4" />,
        gradient: "from-red-500/20 to-orange-500/20",
      },
      {
        title: "通知設定",
        href: "/others/notifications",
        icon: <Bell className="h-4 w-4" />,
        gradient: "from-purple-500/20 to-pink-500/20",
      },
    ],
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const NavLink = ({ item, isSubItem = false }: { item: NavItem; isSubItem?: boolean }) => {
    const isActive = pathname === item.href
    const baseClasses = "w-full justify-start gap-2"
    const activeGradient = `bg-gradient-to-r ${item.gradient}`
    const hoverGradient = `hover:bg-gradient-to-r ${item.gradient}`

    return (
      <Link href={item.href}>
        <Button
          variant="ghost"
          className={`
            ${baseClasses}
            ${isActive ? activeGradient : hoverGradient}
            ${isSubItem ? "pl-8" : "pl-4"}
            transition-all duration-200
            group
            relative
          `}
        >
          <span
            className={`
            ${isActive ? "text-primary" : "text-muted-foreground"}
            group-hover:text-primary
            transition-colors
          `}
          >
            {item.icon}
          </span>
          <span
            className={`
            ${isActive ? "font-medium text-primary" : "text-muted-foreground"}
            group-hover:text-primary
            transition-colors
          `}
          >
            {item.title}
          </span>
          {item.badge && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
              {item.badge}
            </span>
          )}
        </Button>
      </Link>
    )
  }

  const NavContent = () => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-4 py-4"
    >
      <div className="px-3 py-2">
        <h2 className="mb-6 px-4 text-lg font-semibold tracking-tight">在庫管理システム</h2>
        <div className="space-y-1">
          {navItems.map((item) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <NavLink item={item} />
              {item.subItems && pathname.startsWith(item.href) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="mt-1 space-y-1"
                >
                  {item.subItems.map((subItem) => (
                    <NavLink key={subItem.title} item={subItem} isSubItem />
                  ))}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )

  return (
    <>
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button
            variant="ghost"
            className="px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">メニューを開く</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 bg-beige-100 p-0">
          <NavContent />
        </SheetContent>
      </Sheet>

      <div className="hidden lg:block border-r bg-beige-100 w-72">
        <NavContent />
      </div>
    </>
  )
} 