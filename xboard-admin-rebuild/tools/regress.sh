#!/usr/bin/env bash
# 视觉回归：同一 fixture 下，逐路由截图「原件 SPA」与「重建脚手架」并计算像素差。
#
#   bash tools/regress.sh              # 全部路由
#   bash tools/regress.sh notice plan  # 只跑名字包含这些关键字的
#
# 前置：node tools/build-and-serve.mjs（端口 4318 已就绪）
# 产物：/tmp/shots/{o_,a_,d_}<slug>.png + /tmp/shots/report.tsv
set -u
BASE=${BASE:-http://127.0.0.1:4318}
OUT=${OUT:-/tmp/shots}
SIZE=${SIZE:-1440,900}
BUDGET=${BUDGET:-14000}
CHROME=${CHROME:-chromium}
mkdir -p "$OUT"

ROUTES=(
  "/"
  "/sign-in"
  "/config/system" "/config/system/safe" "/config/system/subscribe" "/config/system/invite"
  "/config/system/frontend" "/config/system/server" "/config/system/email" "/config/system/telegram"
  "/config/system/app" "/config/system/subscribe-template"
  "/config/theme" "/config/plugin" "/config/plugin/menu-demo" "/config/plugin/crud-demo"
  "/config/notice" "/config/knowledge" "/config/payment"
  "/server/manage" "/server/machine" "/server/group" "/server/route"
  "/finance/plan" "/finance/order" "/finance/coupon" "/finance/gift-card"
  "/user/manage" "/user/ticket" "/user/traffic-reset-logs"
  "/plugins/traffic-analytics/overview"
)

shoot() { # app route file
  timeout 90 "$CHROME" --headless=new --no-sandbox --disable-gpu --hide-scrollbars \
    --window-size="$SIZE" --virtual-time-budget="$BUDGET" \
    --screenshot="$OUT/$3" "$BASE/seed.html?app=$1&to=$2" >/dev/null 2>&1
}

slug() { local s=${1#/}; s=${s:-root}; printf '%s' "${s//\//_}"; }

: > "$OUT/report.tsv"
printf 'route\tslug\torig_bytes\tapp_bytes\tchanged_pct\tmean_delta\n' >> "$OUT/report.tsv"

for r in "${ROUTES[@]}"; do
  if [ $# -gt 0 ]; then
    keep=0; for k in "$@"; do case "$r" in *"$k"*) keep=1 ;; esac; done
    [ $keep -eq 1 ] || continue
  fi
  s=$(slug "$r")
  shoot orig "$r" "o_$s.png"
  shoot app  "$r" "a_$s.png"
  ob=$(stat -c%s "$OUT/o_$s.png" 2>/dev/null || echo 0)
  ab=$(stat -c%s "$OUT/a_$s.png" 2>/dev/null || echo 0)
  if [ "$ob" -gt 0 ] && [ "$ab" -gt 0 ]; then
    line=$(python3 "$(dirname "$0")/pngdiff.py" "$OUT/o_$s.png" "$OUT/a_$s.png" --diff "$OUT/d_$s.png" \
           | python3 -c "import json,sys;d=json.load(sys.stdin);print(f\"{d['changed_ratio']*100:.2f}\t{d['mean_channel_delta']:.2f}\")")
    printf '%s\t%s\t%s\t%s\t%s\n' "$r" "$s" "$ob" "$ab" "$line" | tee -a "$OUT/report.tsv"
  else
    printf '%s\t%s\t%s\t%s\tFAIL\tFAIL\n' "$r" "$s" "$ob" "$ab" | tee -a "$OUT/report.tsv"
  fi
done

# ---- 弹层态：用 CDP 截图（shot.mjs 支持点击）----
MODALS=(
  "/config/notice|添加公告"
  "/config/knowledge|添加知识"
  "/finance/plan|添加套餐"
  "/finance/coupon|添加优惠券"
  "/user/manage|创建用户"
  "/server/manage|添加节点"
  "/server/group|添加权限组"
  "/server/route|添加路由"
  "/server/machine?machine_id=1|"
)
: > "$OUT/report-modals.tsv"
printf 'route\tclick\torig_bytes\tapp_bytes\tchanged_pct\tmean_delta\n' >> "$OUT/report-modals.tsv"
if [ "${SKIP_MODALS:-0}" != "1" ]; then
  for spec in "${MODALS[@]}"; do
    route=${spec%%|*}; click=${spec#*|}
    if [ $# -gt 0 ]; then
      keep=0; for k in "$@"; do case "$route" in *"$k"*) keep=1 ;; esac; done
      [ $keep -eq 1 ] || continue
    fi
    s2=$(slug "$route")_modal
    if [ -n "$click" ]; then
      node "$(dirname "$0")/shot.mjs" --url "$BASE/seed.html?app=orig&to=$route" --out "$OUT/m_o_$s2.png" --click "$click" --wait 5500 >/dev/null 2>&1
      node "$(dirname "$0")/shot.mjs" --url "$BASE/seed.html?app=app&to=$route"  --out "$OUT/m_a_$s2.png" --click "$click" --wait 5500 >/dev/null 2>&1
    else
      node "$(dirname "$0")/shot.mjs" --url "$BASE/seed.html?app=orig&to=$route" --out "$OUT/m_o_$s2.png" --wait 6000 >/dev/null 2>&1
      node "$(dirname "$0")/shot.mjs" --url "$BASE/seed.html?app=app&to=$route"  --out "$OUT/m_a_$s2.png" --wait 6000 >/dev/null 2>&1
    fi
    ob=$(stat -c%s "$OUT/m_o_$s2.png" 2>/dev/null || echo 0)
    ab=$(stat -c%s "$OUT/m_a_$s2.png" 2>/dev/null || echo 0)
    if [ "$ob" -gt 0 ] && [ "$ab" -gt 0 ]; then
      line=$(python3 "$(dirname "$0")/pngdiff.py" "$OUT/m_o_$s2.png" "$OUT/m_a_$s2.png" --diff "$OUT/m_d_$s2.png" \
             | python3 -c "import json,sys;d=json.load(sys.stdin);print(f\"{d['changed_ratio']*100:.2f}\t{d['mean_channel_delta']:.2f}\")")
      printf '%s\t%s\t%s\t%s\t%s\n' "$route" "$click" "$ob" "$ab" "$line" | tee -a "$OUT/report-modals.tsv"
    else
      printf '%s\t%s\t%s\t%s\tFAIL\tFAIL\n' "$route" "$click" "$ob" "$ab" | tee -a "$OUT/report-modals.tsv"
    fi
  done
fi

echo
echo "报告: $OUT/report.tsv  |  弹层: $OUT/report-modals.tsv"
sort -t$'\t' -k5 -g "$OUT/report.tsv" | tail -n +2 | awk -F'\t' '{printf "%-38s %7s%%\n", $1, $5}'
