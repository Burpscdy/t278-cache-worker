# T278 Dukascopy Cache Worker

Public, isolated acquisition worker for T278 historical Dukascopy market-data cache shards.

Scope:
- public Dukascopy Jetta URLs/data only
- no AI Business OS source code
- no strategy logic
- no broker credentials
- no live-capital actions
- no secrets

The first gate is a bounded AUD/USD 2021-12-29 canary using 2-second request pacing.
