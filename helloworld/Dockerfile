FROM debian:bookworm AS builder

FROM builder

ARG foo
ARG BAR

COPY build.sh /
RUN bash /build.sh
