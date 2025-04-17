#!/usr/bin/env bash

set -o errexit
set -o pipefail
set -u

IFS=$'\n\t'

readonly BINPATH="$(realpath "$(dirname "$0")")"

_info() {
  echo >&2 "[info] $*"
}

_main() {
  cd "${BINPATH}"
  local archive="out/super-merge-windows.zip"
  mkdir -p "$(dirname "${archive}")"
  rm -f "${archive}"

  zip -r "${archive}" . \
    -x '*.git/*' \
    -x '.idea/*' \
    -x "${archive}" \
    -x '*.DS_Store' \
    -x '*.zip'

  _info "Created archive: ${archive}"
}

_main "$@"
