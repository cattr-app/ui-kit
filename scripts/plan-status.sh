#!/usr/bin/env sh
# Print a status table of all .plan tasks from their frontmatter.
#   scripts/plan-status.sh            all tasks
#   scripts/plan-status.sh ready      tasks whose depends_on are all done and status is todo
set -eu
cd "$(dirname "$0")/.."
mode=${1:-all}
done_ids=$(grep -l '^status: done' .plan/*/*.md 2>/dev/null | xargs -r grep -h '^id:' | sed 's/id: //')
printf '%-22s %-12s %-28s %s\n' ID STATUS DEPENDS_ON TITLE
for f in .plan/*/*.md; do
  case "$f" in */README.md) continue;; esac
  id=$(sed -n 's/^id: //p' "$f" | head -1); st=$(sed -n 's/^status: //p' "$f" | head -1)
  deps=$(sed -n 's/^depends_on: \[\(.*\)\]/\1/p' "$f" | head -1); title=$(sed -n 's/^title: //p' "$f" | head -1)
  if [ "$mode" = ready ]; then
    [ "$st" = todo ] || continue
    ok=1; for d in $(echo "$deps" | tr -d ','); do echo "$done_ids" | grep -qx "$d" || ok=0; done
    [ $ok = 1 ] || continue
  fi
  printf '%-22s %-12s %-28s %s\n' "$id" "$st" "$deps" "$title"
done
