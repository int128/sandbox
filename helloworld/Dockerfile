FROM debian:bookworm AS builder

FROM builder

RUN cat /etc/os-release > /etc/os-release.build

RUN --mount=type=secret,id=foo \
    echo "$(< /run/secrets/foo)"
