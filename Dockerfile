FROM --platform=$BUILDPLATFORM golang:1.24.0 AS builder
WORKDIR /workspace
COPY go.mod go.mod
