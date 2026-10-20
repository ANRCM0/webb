import { lazy, Suspense } from "react";
import { createHashRouter } from "react-router-dom";
import AppShell from "@/components/layout/app-shell";
import SignIn from "@/pages/auth/sign-in";
import Dashboard from "@/pages/dashboard";
import ConfigSystem from "@/pages/config/system";
import PluginPage from "@/pages/plugins";
import ConfigSystemSafe from "@/pages/config/system/safe";
import ConfigSystemSubscribe from "@/pages/config/system/subscribe";
import ConfigSystemInvite from "@/pages/config/system/invite";
import ConfigSystemFrontend from "@/pages/config/system/frontend";
import ConfigSystemServer from "@/pages/config/system/server";
import ConfigSystemEmail from "@/pages/config/system/email";
import ConfigSystemTelegram from "@/pages/config/system/telegram";
import ConfigSystemApp from "@/pages/config/system/app";
import ConfigSystemSubscribeTemplate from "@/pages/config/system/subscribe-template";
import ConfigPayment from "@/pages/config/payment";
import ConfigPlugin from "@/pages/config/plugin";
import ConfigPluginMenuDemo from "@/pages/config/plugin/menu-demo";
import ConfigPluginCrudDemo from "@/pages/config/plugin/crud-demo";
import ConfigTheme from "@/pages/config/theme";
import ConfigNotice from "@/pages/config/notice";
import ConfigKnowledge from "@/pages/config/knowledge";
import ServerManage from "@/pages/server/manage";
import ServerMachine from "@/pages/server/machine";
import ServerGroup from "@/pages/server/group";
import ServerRoute from "@/pages/server/route";
import FinancePlan from "@/pages/finance/plan";
import FinanceOrder from "@/pages/finance/order";
import FinanceCoupon from "@/pages/finance/coupon";
import FinanceGiftCard from "@/pages/finance/gift-card";
import UserManage from "@/pages/user/manage";
import UserTicket from "@/pages/user/ticket";
import UserTrafficResetLogs from "@/pages/user/traffic-reset-logs";

/** Route tree recovered verbatim from the dist bundle (offset ~4,400,700). */
export const router = createHashRouter([
  { path: "/sign-in", element: <SignIn /> },
  { path: "/404", element: <div>404</div> },
  { path: "/500", element: <div>500</div> },
  { path: "/503", element: <div>503</div> },
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <Dashboard /> },
    { path: "config/system", element: <ConfigSystem />, children: [
      { path: "safe", element: <ConfigSystemSafe /> },
      { path: "subscribe", element: <ConfigSystemSubscribe /> },
      { path: "invite", element: <ConfigSystemInvite /> },
      { path: "frontend", element: <ConfigSystemFrontend /> },
      { path: "server", element: <ConfigSystemServer /> },
      { path: "email", element: <ConfigSystemEmail /> },
      { path: "telegram", element: <ConfigSystemTelegram /> },
      { path: "app", element: <ConfigSystemApp /> },
      { path: "subscribe-template", element: <ConfigSystemSubscribeTemplate /> },
    ] },
    { path: "config/payment", element: <ConfigPayment /> },
    { path: "config/plugin", element: <ConfigPlugin /> },
    { path: "config/plugin/menu-demo", element: <ConfigPluginMenuDemo /> },
    { path: "config/plugin/crud-demo", element: <ConfigPluginCrudDemo /> },
    { path: "config/theme", element: <ConfigTheme /> },
    { path: "config/notice", element: <ConfigNotice /> },
    { path: "config/knowledge", element: <ConfigKnowledge /> },
    { path: "server/manage", element: <ServerManage /> },
    { path: "server/machine", element: <ServerMachine /> },
    { path: "server/group", element: <ServerGroup /> },
    { path: "server/route", element: <ServerRoute /> },
    { path: "finance/plan", element: <FinancePlan /> },
    { path: "finance/order", element: <FinanceOrder /> },
    { path: "finance/coupon", element: <FinanceCoupon /> },
    { path: "finance/gift-card", element: <FinanceGiftCard /> },
    { path: "user/manage", element: <UserManage /> },
    { path: "user/ticket", element: <UserTicket /> },
    { path: "user/traffic-reset-logs", element: <UserTrafficResetLogs /> },
      { path: "plugins/:pluginCode/*", element: <PluginPage /> },
    ],
  },
  { path: "*", element: <div>404</div> },
]);
export const SuspenseRouter = () => <Suspense fallback={<div>loading</div>}>{null}</Suspense>;
