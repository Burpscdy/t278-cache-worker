# Cloudflare canary

This directory contains the bounded non-Azure egress canary for T278.

Security and scope:
- separate Worker from the production AI Business OS Telegram/Hermes Worker
- exactly 12 hardcoded public Dukascopy Jetta URLs for AUD/USD 2021-12-29
- one upstream fetch per invocation
- bearer auth via Cloudflare Worker secret `T278_CANARY_TOKEN`
- no arbitrary URL input, so it is not an open proxy
- no Business OS secrets, broker credentials, strategy logic, or live-capital path
- no deployment credentials committed to this repository

Deployment is intentionally not performed by repository code. A fresh external approval is required before creating the Cloudflare Worker and setting its secret.
