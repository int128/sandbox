#!/bin/bash
set -eux
env
cat /etc/os-release | tee /etc/os-release.build
