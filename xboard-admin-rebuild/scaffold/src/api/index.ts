import { http } from "@/lib/http";

const SECURE = window.settings?.secure_path ?? "";

/**
 * 端点表：从 dist bundle 还原（`IL(...)`=GET、`RL(...)`=POST，前缀 `${SECURE}`）。
 * 来源：reconstruction/gen_api.py；每条后的注释是原件里的辅助函数名，便于对照蓝图。
 */

export const config = {
  /** e() */
  fetch_key: (key: string | number) => http.get(`${SECURE}/config/fetch?key=${key}`),
};

export const coupon = {
  /** iT() */
  drop: (params?: unknown) => http.post(`${SECURE}/coupon/drop`, params),
  /** tT() */
  fetch: (params?: unknown) => http.post(`${SECURE}/coupon/fetch`, params),
  /** nT() */
  generate: (params?: unknown) => http.post(`${SECURE}/coupon/generate`, params),
  /** rT() */
  update: (params?: unknown) => http.post(`${SECURE}/coupon/update`, params),
};

export const gift_card = {
  /** ZD() */
  codes: (params?: unknown) => http.post(`${SECURE}/gift-card/codes`, params),
  /** qD() */
  create_template: (params?: unknown) => http.post(`${SECURE}/gift-card/create-template`, params),
  /** GD() */
  delete_template: (params?: unknown) => http.post(`${SECURE}/gift-card/delete-template`, params),
  /** JD() */
  statistics: (params?: unknown) => http.post(`${SECURE}/gift-card/statistics`, params),
  /** $D() */
  templates: (params?: unknown) => http.post(`${SECURE}/gift-card/templates`, params),
  /** XD() */
  toggle_code: (params?: unknown) => http.post(`${SECURE}/gift-card/toggle-code`, params),
  /** KD() */
  update_template: (params?: unknown) => http.post(`${SECURE}/gift-card/update-template`, params),
  /** QD() */
  usages: (params?: unknown) => http.post(`${SECURE}/gift-card/usages`, params),
};

export const knowledge = {
  /** LD() */
  drop: (params?: unknown) => http.post(`${SECURE}/knowledge/drop`, params),
  /** kD() */
  fetch: (params?: unknown) => http.get(`${SECURE}/knowledge/fetch`, { params }),
  /** ND() */
  fetch_id: (id: string | number) => http.get(`${SECURE}/knowledge/fetch?id=${id}`),
  /** ED() */
  save: (params?: unknown) => http.post(`${SECURE}/knowledge/save`, params),
  /** DD() */
  show: (params?: unknown) => http.post(`${SECURE}/knowledge/show`, params),
  /** TD() */
  sort: (params?: unknown) => http.post(`${SECURE}/knowledge/sort`, params),
};

export const notice = {
  /** xD() */
  drop: (params?: unknown) => http.post(`${SECURE}/notice/drop`, params),
  /** bD() */
  fetch: (params?: unknown) => http.get(`${SECURE}/notice/fetch`, { params }),
  /** yD() */
  save: (params?: unknown) => http.post(`${SECURE}/notice/save`, params),
  /** wD() */
  show: (params?: unknown) => http.post(`${SECURE}/notice/show`, params),
  /** CD() */
  sort: (params?: unknown) => http.post(`${SECURE}/notice/sort`, params),
};

export const order = {
  /** zD() */
  assign: (params?: unknown) => http.post(`${SECURE}/order/assign`, params),
  /** WD() */
  cancel: (params?: unknown) => http.post(`${SECURE}/order/cancel`, params),
  /** BD() */
  detail: (params?: unknown) => http.post(`${SECURE}/order/detail`, params),
  /** FD() */
  fetch: (params?: unknown) => http.post(`${SECURE}/order/fetch`, params),
  /** VD() */
  paid: (params?: unknown) => http.post(`${SECURE}/order/paid`, params),
  /** HD() */
  update: (params?: unknown) => http.post(`${SECURE}/order/update`, params),
};

export const payment = {
  /** mD() */
  drop: (params?: unknown) => http.post(`${SECURE}/payment/drop`, params),
  /** uD() */
  fetch: (params?: unknown) => http.get(`${SECURE}/payment/fetch`, { params }),
  /** gD() */
  getPaymentForm: (params?: unknown) => http.post(`${SECURE}/payment/getPaymentForm`, params),
  /** hD() */
  getPaymentMethods: (params?: unknown) => http.get(`${SECURE}/payment/getPaymentMethods`, { params }),
  /** pD() */
  save: (params?: unknown) => http.post(`${SECURE}/payment/save`, params),
  /** fD() */
  show: (params?: unknown) => http.post(`${SECURE}/payment/show`, params),
  /** _D() */
  sort: (params?: unknown) => http.post(`${SECURE}/payment/sort`, params),
};

export const plan = {
  /** AD() */
  drop: (params?: unknown) => http.post(`${SECURE}/plan/drop`, params),
  /** RD() */
  fetch: (params?: unknown) => http.get(`${SECURE}/plan/fetch`, { params }),
  /** OD() */
  save: (params?: unknown) => http.post(`${SECURE}/plan/save`, params),
  /** PD() */
  sort: (params?: unknown) => http.post(`${SECURE}/plan/sort`, params),
  /** MD() */
  update: (params?: unknown) => http.post(`${SECURE}/plan/update`, params),
};

export const server = {
  /** sD() */
  group_drop: (params?: unknown) => http.post(`${SECURE}/server/group/drop`, params),
  /** iD() */
  group_fetch: (params?: unknown) => http.get(`${SECURE}/server/group/fetch`, { params }),
  /** rD() */
  group_save: (params?: unknown) => http.post(`${SECURE}/server/group/save`, params),
  /** MT() */
  machine_drop: (params?: unknown) => http.post(`${SECURE}/server/machine/drop`, params),
  /** DT() */
  machine_fetch: (params?: unknown) => http.get(`${SECURE}/server/machine/fetch`, { params }),
  /** IT() */
  machine_getToken: (params?: unknown) => http.get(`${SECURE}/server/machine/getToken`, { params }),
  /** t() */
  machine_history: (params?: unknown) => http.get(`${SECURE}/server/machine/history`, { params }),
  /** RT() */
  machine_installCommand: (params?: unknown) => http.get(`${SECURE}/server/machine/installCommand`, { params }),
  /** AT() */
  machine_nodes: (params?: unknown) => http.get(`${SECURE}/server/machine/nodes`, { params }),
  /** OT() */
  machine_resetToken: (params?: unknown) => http.post(`${SECURE}/server/machine/resetToken`, params),
  /** TT() */
  machine_save: (params?: unknown) => http.post(`${SECURE}/server/machine/save`, params),
  /** GL() */
  manage_batchDelete: (params?: unknown) => http.post(`${SECURE}/server/manage/batchDelete`, params),
  /** eD() */
  manage_batchResetTraffic: (params?: unknown) => http.post(`${SECURE}/server/manage/batchResetTraffic`, params),
  /** ZL() */
  manage_batchUpdate: (params?: unknown) => http.post(`${SECURE}/server/manage/batchUpdate`, params),
  /** YL() */
  manage_copy: (params?: unknown) => http.post(`${SECURE}/server/manage/copy`, params),
  /** KL() */
  manage_drop: (params?: unknown) => http.post(`${SECURE}/server/manage/drop`, params),
  /** tD() */
  manage_generateEchKey: (params?: unknown) => http.get(`${SECURE}/server/manage/generateEchKey`, { params }),
  /** $L() */
  manage_getNodes: (params?: unknown) => http.get(`${SECURE}/server/manage/getNodes`, { params }),
  /** JL() */
  manage_resetTraffic: (params?: unknown) => http.post(`${SECURE}/server/manage/resetTraffic`, params),
  /** qL() */
  manage_save: (params?: unknown) => http.post(`${SECURE}/server/manage/save`, params),
  /** QL() */
  manage_sort: (params?: unknown) => http.post(`${SECURE}/server/manage/sort`, params),
  /** XL() */
  manage_update: (params?: unknown) => http.post(`${SECURE}/server/manage/update`, params),
  /** cD() */
  route_drop: (params?: unknown) => http.post(`${SECURE}/server/route/drop`, params),
  /** aD() */
  route_fetch: (params?: unknown) => http.get(`${SECURE}/server/route/fetch`, { params }),
  /** lD() */
  route_save: (params?: unknown) => http.post(`${SECURE}/server/route/save`, params),
};

export const stat = {
  /** AL() */
  getOrder: (params?: unknown) => http.get(`${SECURE}/stat/getOrder`, { params }),
  /** dT() */
  getStatUser: (params?: unknown) => http.post(`${SECURE}/stat/getStatUser`, params),
  /** PL() */
  getStats: (params?: unknown) => http.get(`${SECURE}/stat/getStats`, { params }),
  /** jL() */
  getTrafficRank: (params?: unknown) => http.get(`${SECURE}/stat/getTrafficRank`, { params }),
};

export const theme = {
  /** zL() */
  delete: (params?: unknown) => http.post(`${SECURE}/theme/delete`, params),
  /** VL() */
  getThemeConfig: (params?: unknown) => http.post(`${SECURE}/theme/getThemeConfig`, params),
  /** BL() */
  getThemes: (params?: unknown) => http.get(`${SECURE}/theme/getThemes`, { params }),
  /** WL() */
  saveThemeConfig: (params?: unknown) => http.post(`${SECURE}/theme/saveThemeConfig`, params),
};

export const ticket = {
  /** wT() */
  close: (params?: unknown) => http.post(`${SECURE}/ticket/close`, params),
  /** bT() */
  fetch: (params?: unknown) => http.post(`${SECURE}/ticket/fetch`, params),
  /** yT() */
  fetch_id: (id: string | number) => http.get(`${SECURE}/ticket/fetch?id=${id}`),
  /** xT() */
  reply: (params?: unknown) => http.post(`${SECURE}/ticket/reply`, params),
};

export const traffic_reset = {
  /** mT() */
  logs: (params?: unknown) => http.get(`${SECURE}/traffic-reset/logs`, { params }),
  /** fT() */
  reset_user: (params?: unknown) => http.post(`${SECURE}/traffic-reset/reset-user`, params),
};

export const user = {
  /** pT() */
  ban: (params?: unknown) => http.post(`${SECURE}/user/ban`, params),
  /** uT() */
  destroy: (params?: unknown) => http.post(`${SECURE}/user/destroy`, params),
  /** gT() */
  dumpCSV: (params?: unknown) => http.post(`${SECURE}/user/dumpCSV`, params),
  /** oT() */
  fetch: (params?: unknown) => http.post(`${SECURE}/user/fetch`, params),
  /** lT() */
  resetSecret: (params?: unknown) => http.post(`${SECURE}/user/resetSecret`, params),
  /** hT() */
  sendMail: (params?: unknown) => http.post(`${SECURE}/user/sendMail`, params),
  /** aT() */
  update: (params?: unknown) => http.post(`${SECURE}/user/update`, params),
};
