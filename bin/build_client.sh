#!/bin/bash

lerna run build \
  --scope=colyseus-test-client \
  --include-filtered-dependencies
