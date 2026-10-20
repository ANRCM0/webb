#!/usr/bin/env bash
# oci-pull.sh — pull container images from an OCI / Docker v2 registry into an OCI image
# layout on disk, with NO Docker daemon required. Blobs are content-addressed and verified.
#
#   ./oci-pull.sh ghcr.io/cedar2025/xboard:latest
#   ./oci-pull.sh ghcr.io/cedar2025/xboard:latest --platform linux/arm64 --out images/xboard-arm64
#   ./oci-pull.sh redis:7-alpine --tar
#
# Output (OCI layout, importable by docker/containerd/podman/skopeo):
#   <out>/oci-layout
#   <out>/index.json
#   <out>/blobs/sha256/<hex...>
#   <out>/pull-report.json      (what was pulled + verification facts)
#
# Loading it later:
#   docker load  -i <out>.tar                              # Docker 25+ (OCI archive)
#   ctr -n moby images import <out>.tar                    # containerd
#   skopeo copy oci:<out> docker-daemon:ghcr.io/.../xboard:latest
set -euo pipefail

die() { printf 'error: %s\n' "$*" >&2; exit 1; }
log() { printf '%s\n' "$*" >&2; }

REF="" PLATFORM="linux/amd64" OUT="" MAKE_TAR=0 JOBS="${JOBS:-4}" INSECURE=0

# ---------- arg parsing ----------
while [ $# -gt 0 ]; do
  case "$1" in
    --platform) PLATFORM="${2:?}"; shift 2 ;;
    --out)      OUT="${2:?}"; shift 2 ;;
    --jobs)     JOBS="${2:?}"; shift 2 ;;
    --tar)      MAKE_TAR=1; shift ;;
    --insecure) INSECURE=1; shift ;;
    -h|--help)  sed -n '2,20p' "$0"; exit 0 ;;
    -*)         die "unknown flag: $1" ;;
    *)          [ -z "$REF" ] && REF="$1" || die "unexpected arg: $1"; shift ;;
  esac
done
[ -n "$REF" ] || die "usage: $0 <registry/repo:tag> [--platform os/arch] [--out DIR] [--tar]"
command -v curl >/dev/null || die "curl not found"
command -v jq   >/dev/null || die "jq not found"

# ---------- reference normalisation ----------
REF_TAG="${REF##*:}"; case "$REF_TAG" in */*) REF_TAG="latest" ;; esac
REF_NO_TAG="${REF%:*}"
case "$REF_NO_TAG" in
  */*) FIRST="${REF_NO_TAG%%/*}" ;;
  *)   FIRST="" ;;
esac
if [ -n "$FIRST" ] && { [[ "$FIRST" == *.* ]] || [[ "$FIRST" == *:* ]] || [ "$FIRST" = "localhost" ]; }; then
  REG="$FIRST"; REPO="${REF_NO_TAG#*/}"
else
  REG="docker.io"; REPO="$REF_NO_TAG"; [ "${REF_NO_TAG%%/*}" = "$REF_NO_TAG" ] && REPO="library/$REF_NO_TAG"
fi
case "$REG" in docker.io|index.docker.io) API_HOST="registry-1.docker.io" ;; *) API_HOST="$REG" ;; esac
SCHEME="https"; [ "$INSECURE" = 1 ] && SCHEME="http"
[ -n "$OUT" ] || OUT="$(printf '%s' "$REG/$REPO:$REF_TAG" | tr '/' '_' | tr -d ':')"

log "→ $REG/$REPO:$REF_TAG  (platform $PLATFORM)"

# ---------- auth ----------
get_token() {
  local cred=""
  case "$REG" in
    ghcr.io) [ -n "${GITHUB_TOKEN:-}" ] && cred="-u x-access-token:${GITHUB_TOKEN}" ;;
    docker.io|index.docker.io)
      [ -n "${DOCKER_HUB_USER:-}" ] && cred="-u ${DOCKER_HUB_USER}:${DOCKER_HUB_PASS:-}" ;;
  esac
  # challenge-based discovery first, then well-known endpoints
  local hdr="" www=""
  hdr=$(curl -sS -o /dev/null -D - "$SCHEME://$API_HOST/v2/" 2>/dev/null || true)
  www=$(printf '%s' "$hdr" | tr -d '\r' | sed -n 's/^[Ww][Ww][Ww]-[Aa]uthenticate: //p' | head -1)
  local realm="" service=""
  if [ -n "$www" ]; then
    realm=$(printf '%s' "$www" | sed -n 's/.*realm="\([^"]*\)".*/\1/p')
    service=$(printf '%s' "$www" | sed -n 's/.*service="\([^"]*\)".*/\1/p')
  fi
  [ -n "$realm" ] || realm="$SCHEME://auth.docker.io/token"
  [ -n "$service" ] || service="$API_HOST"
  local scope="repository:$REPO:pull"
  T0K=""
  T0K=$(curl -sS $cred "$realm?service=$(printf '%s' "$service" | jq -sRr @uri)&scope=$(printf '%s' "$scope" | jq -sRr @uri)" \
        | jq -r '.token // .access_token // empty')
  [ -n "$T0K" ] || die "failed to obtain registry token for $REG/$REPO (may be private)"
}
T0K=""
get_token

ACC="application/vnd.oci.image.index.v1+json,\
application/vnd.docker.distribution.manifest.list.v2+json,\
application/vnd.oci.image.manifest.v1+json,\
application/vnd.docker.distribution.manifest.v2+json"

fetch_manifest() { # $1=ref-or-digest  $2=outfile
  local code
  code=$(curl -sS -H "Authorization: Bearer $T0K" -H "Accept: $ACC" \
         -o "$2" -w '%{http_code}' "$SCHEME://$API_HOST/v2/$REPO/manifests/$1")
  [ "$code" = "200" ] || { printf 'manifest fetch %s -> HTTP %s\n' "$1" "$code" >&2; return 1; }
}

mkdir -p "$OUT"
WORK=$(mktemp -d); trap 'rm -rf "$WORK"' EXIT

# ---------- resolve index -> single-platform manifest ----------
fetch_manifest "$REF_TAG" "$WORK/top.json" || die "manifest fetch failed"
TOP_MT=$(jq -r '.mediaType // ("schema2:" + (.schemaVersion|tostring))' "$WORK/top.json")
TOP_DG=$(sha256sum "$WORK/top.json" | cut -d' ' -f1)

case "$TOP_MT" in
  *index*|*manifest.list*)
    PLAT=$(jq -r --arg p "$PLATFORM" '
      [.manifests[] | select((.platform.os//"")+"/"+(.platform.architecture//"") == $p)]
      | if length>0 then .[0] else empty end' "$WORK/top.json")
    if [ -z "$PLAT" ]; then
      log "available platforms:"; jq -r '.manifests[]? | "  \(.platform.os)/\(.platform.architecture)"' "$WORK/top.json" >&2
      die "platform $PLATFORM not found"
    fi
    MAN_DG=$(printf '%s' "$PLAT" | jq -r '.digest')
    MAN_MT=$(printf '%s' "$PLAT" | jq -r '.mediaType')
    MAN_SZ=$(printf '%s' "$PLAT" | jq -r '.size')
    PLAT_JSON=$(printf '%s' "$PLAT" | jq -c '.platform')
    fetch_manifest "$MAN_DG" "$WORK/manifest.json" || die "platform manifest fetch failed"
    INDEX_DIGEST="sha256:$TOP_DG"
    ;;
  *)
    MAN_DG="sha256:$TOP_DG"; MAN_MT="$TOP_MT"; MAN_SZ=$(stat -c%s "$WORK/top.json")
    PLAT_JSON=$(jq -c . <<<"{\"os\":\"$(printf %s "$PLATFORM" | cut -d/ -f1)\",\"architecture\":\"$(printf %s "$PLATFORM" | cut -d/ -f2)\"}")
    cp "$WORK/top.json" "$WORK/manifest.json"; INDEX_DIGEST=""
    ;;
esac
[ "$(sha256sum "$WORK/manifest.json" | cut -d' ' -f1)" = "${MAN_DG#sha256:}" ] || die "manifest digest mismatch"

# ---------- enumerate blobs ----------
CFG_DG=$(jq -r '.config.digest' "$WORK/manifest.json")
CFG_SZ=$(jq -r '.config.size' "$WORK/manifest.json")
mapfile -t LAYER_ROWS < <(jq -r '.layers[] | "\(.digest) \(.size)"' "$WORK/manifest.json")
LAYER_TOTAL=$(jq -r '[.layers[].size]|add' "$WORK/manifest.json")
log "  manifest   $MAN_DG"
log "  config     $CFG_DG"
log "  layers     ${#LAYER_ROWS[@]}  ($(( LAYER_TOTAL/1048576 )) MB compressed)"

export API_HOST SCHEME REPO T0K
BLOBS="$OUT/blobs/sha256"
mkdir -p "$BLOBS"

fetch_blob() { # $1=digest $2=size
  local dg="$1" sz="$2" hex f
  hex="${dg#sha256:}"; f="$BLOBS/$hex"
  if [ -f "$f" ] && [ "$(stat -c%s "$f")" = "$sz" ]; then
    if [ "$(sha256sum "$f" | cut -d' ' -f1)" = "$hex" ]; then log "  = $hex (cached)"; return 0; fi
    rm -f "$f"
  fi
  curl -fsSL --retry 3 --retry-delay 2 -H "Authorization: Bearer $T0K" \
       -o "$f.part" "$SCHEME://$API_HOST/v2/$REPO/blobs/$dg" \
    || { log "  ! download failed $dg"; return 1; }
  local got_sz got_dg
  got_sz=$(stat -c%s "$f.part"); got_dg=$(sha256sum "$f.part" | cut -d' ' -f1)
  [ "$got_sz" = "$sz" ] || { log "  ! size mismatch $dg (got $got_sz want $sz)"; rm -f "$f.part"; return 1; }
  [ "$got_dg" = "$hex" ] || { log "  ! digest mismatch $dg (got $got_dg)"; rm -f "$f.part"; return 1; }
  mv "$f.part" "$f"; log "  + $hex ($(( sz/1048576 )) MB)"
}
export -f fetch_blob log die; export BLOBS

FAILED=0
fetch_blob "$CFG_DG" "$CFG_SZ" || FAILED=1
printf '%s\n' "${LAYER_ROWS[@]}" | xargs -P "$JOBS" -n2 bash -c 'fetch_blob "$1" "$2"' _ || FAILED=1
[ "$FAILED" = 0 ] || die "one or more blobs failed to download/verify"

# ---------- write OCI layout ----------
cp "$WORK/manifest.json" "$BLOBS/${MAN_DG#sha256:}"
printf '{"imageLayoutVersion":"1.0.0"}\n' > "$OUT/oci-layout"
jq -n --arg mt "$MAN_MT" --arg dg "$MAN_DG" --argjson sz "$MAN_SZ" \
      --argjson plat "$PLAT_JSON" \
      --arg name "$REG/$REPO:$REF_TAG" \
      '{schemaVersion:2, mediaType:"application/vnd.oci.image.index.v1+json",
        manifests:[{mediaType:$mt, digest:$dg, size:$sz, platform:$plat,
                    annotations:{"org.opencontainers.image.ref.name":$name}}]}' > "$OUT/index.json"

# ---------- report ----------
CFGF="$BLOBS/${CFG_DG#sha256:}"
jq -n \
  --arg ref "$REG/$REPO:$REF_TAG" --arg index "$INDEX_DIGEST" --arg man "$MAN_DG" \
  --arg cfg "$CFG_DG" --argjson cfgSize "$CFG_SZ" --argjson plat "$PLAT_JSON" \
  --argjson layers "${#LAYER_ROWS[@]}" --argjson compressed "$LAYER_TOTAL" \
  --arg out "$OUT" \
  --arg created "$(jq -r '.created // "unknown"' "$CFGF")" \
  --arg arch "$(jq -r '.architecture // "?"' "$CFGF")" \
  --arg os "$(jq -r '.os // "?"' "$CFGF")" \
  --arg entrypoint "$(jq -c '.config.Entrypoint // []' "$CFGF")" \
  --arg cmd "$(jq -c '.config.Cmd // []' "$CFGF")" \
  --arg env "$(jq -c '.config.Env // []' "$CFGF")" \
  --arg ports "$(jq -c '.config.ExposedPorts // {}' "$CFGF")" \
  --arg labels "$(jq -c '.config.Labels // {}' "$CFGF")" \
  '{reference:$ref, indexDigest:($index|if .=="" then null else . end), manifestDigest:$man,
    configDigest:$cfg, configSize:$cfgSize, platform:$plat, layers:$layers,
    compressedBytes:$compressed, compressedMB:($compressed/1048576|floor),
    image:{os:$os, architecture:$arch, created:$created, Entrypoint:($entrypoint|fromjson),
           Cmd:($cmd|fromjson), Env:($env|fromjson), ExposedPorts:($ports|fromjson),
           Labels:($labels|fromjson)},
    out:$out}' > "$OUT/pull-report.json"

if [ "$MAKE_TAR" = 1 ]; then
  TT="$(dirname "$OUT")/$(basename "$OUT").tar"
  log "→ packing $TT"
  tar -C "$OUT" -cf "$TT" .
  log "  tar: $(du -h "$TT" | cut -f1)"
fi

log "✔ done: $OUT  ($(du -sh "$OUT" | cut -f1))"
jq -r '"  reference : \(.reference)\n  manifest  : \(.manifestDigest)\n  created   : \(.image.created)\n  platform  : \(.platform.os)/\(.platform.architecture)\n  entrypoint: \(.image.Entrypoint)\n  cmd       : \(.image.Cmd)\n  exposed   : \(.image.ExposedPorts|keys)"' "$OUT/pull-report.json" >&2
