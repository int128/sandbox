FROM --platform=$BUILDPLATFORM golang:1.26.1@sha256:cd78d88e00afadbedd272f977d375a6247455f3a4b1178f8ae8bbcb201743a8a AS builder
WORKDIR /workspace
COPY go.mod go.mod
