FROM debian:bookworm AS builder

FROM builder

ARG foo

COPY build.sh /
RUN bash /build.sh
