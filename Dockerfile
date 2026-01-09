FROM --platform=$BUILDPLATFORM golang:1.25.5@sha256:6cc2338c038bc20f96ab32848da2b5c0641bb9bb5363f2c33e9b7c8838f9a208 AS builder
WORKDIR /workspace
COPY go.mod go.mod
