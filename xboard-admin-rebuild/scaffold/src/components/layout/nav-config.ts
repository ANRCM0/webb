import type { Icon } from "@tabler/icons-react";
import {
  IconLayoutDashboard, IconSettings, IconPlug, IconBell, IconWallet, IconBook, IconServer,
  IconKey, IconRoute, IconUsers, IconTicket, IconCreditCard, IconGift, IconHistory,
  IconPalette, IconServer2, IconFileInvoice,
} from "@tabler/icons-react";

export type NavItem = { key: string; href: string; icon: Icon; badge?: string };

/** 复刻原件 nav 命名空间的 22 项；key 用于 i18n 文案 */
export const navGroups: { label: string; items: NavItem[] }[] = [
  { label: "dashboard", items: [{ key: "dashboard", href: "/", icon: IconLayoutDashboard }] },
  {
    label: "systemManagement",
    items: [
      { key: "systemConfig", href: "/config/system", icon: IconSettings },
      { key: "themeConfig", href: "/config/theme", icon: IconPalette },
      { key: "pluginManagement", href: "/config/plugin", icon: IconPlug },
      { key: "noticeManagement", href: "/config/notice", icon: IconBell },
      { key: "paymentConfig", href: "/config/payment", icon: IconWallet },
      { key: "knowledgeManagement", href: "/config/knowledge", icon: IconBook },
    ],
  },
  {
    label: "nodeManagement",
    items: [
      { key: "nodeManagement", href: "/server/manage", icon: IconServer },
      { key: "machineManagement", href: "/server/machine", icon: IconServer2 },
      { key: "permissionGroupManagement", href: "/server/group", icon: IconKey },
      { key: "routeManagement", href: "/server/route", icon: IconRoute },
    ],
  },
  {
    label: "subscriptionManagement",
    items: [
      { key: "planManagement", href: "/finance/plan", icon: IconCreditCard },
      { key: "orderManagement", href: "/finance/order", icon: IconFileInvoice },
      { key: "couponManagement", href: "/finance/coupon", icon: IconTicket },
      { key: "giftCardManagement", href: "/finance/gift-card", icon: IconGift },
    ],
  },
  {
    label: "userManagement",
    items: [
      { key: "userManagement", href: "/user/manage", icon: IconUsers },
      { key: "ticketManagement", href: "/user/ticket", icon: IconTicket },
      { key: "trafficResetLogs", href: "/user/traffic-reset-logs", icon: IconHistory },
    ],
  },
];
