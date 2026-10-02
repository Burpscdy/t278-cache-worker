const CANARY_URLS = Object.freeze({
  "minute-bid": "https://jetta.dukascopy.com/v1/candles/minute/AUD-USD/BID/2021/12/29",
  "minute-ask": "https://jetta.dukascopy.com/v1/candles/minute/AUD-USD/ASK/2021/12/29",
  "tick-13": "https://jetta.dukascopy.com/v1/ticks/AUD-USD/2021/12/29/13",
  "tick-14": "https://jetta.dukascopy.com/v1/ticks/AUD-USD/2021/12/29/14",
  "tick-15": "https://jetta.dukascopy.com/v1/ticks/AUD-USD/2021/12/29/15",
  "tick-16": "https://jetta.dukascopy.com/v1/ticks/AUD-USD/2021/12/29/16",
  "tick-17": "https://jetta.dukascopy.com/v1/ticks/AUD-USD/2021/12/29/17",
  "tick-18": "https://jetta.dukascopy.com/v1/ticks/AUD-USD/2021/12/29/18",
  "tick-19": "https://jetta.dukascopy.com/v1/ticks/AUD-USD/2021/12/29/19",
  "tick-20": "https://jetta.dukascopy.com/v1/ticks/AUD-USD/2021/12/29/20",
  "tick-21": "https://jetta.dukascopy.com/v1/ticks/AUD-USD/2021/12/29/21",
  "tick-22": "https://jetta.dukascopy.com/v1/ticks/AUD-USD/2021/12/29/22",
});

function unauthorized() {
  return new Response(JSON.stringify({ status: "UNAUTHORIZED" }) + "\n", {
    status: 401,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function notFound() {
  return new Response(JSON.stringify({ status: "NOT_FOUND" }) + "\n", {
    status: 404,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function validBearer(request, expected) {
  if (!expected) return false;
  return request.headers.get("authorization") === `Bearer ${expected}`;
}

export default {
  async fetch(request, env) {
    if (request.method !== "GET") return notFound();
    if (!validBearer(request, env.T278_CANARY_TOKEN)) return unauthorized();

    const url = new URL(request.url);
    const match = url.pathname.match(/^\/canary\/([a-z0-9-]+)$/);
    if (!match) return notFound();

    const slot = match[1];
    const upstreamUrl = CANARY_URLS[slot];
    if (!upstreamUrl) return notFound();

    const upstream = await fetch(upstreamUrl, {
      headers: { accept: "application/json" },
      redirect: "follow",
    });

    const body = await upstream.arrayBuffer();
    return new Response(body, {
      status: upstream.status,
      headers: {
        "content-type": upstream.headers.get("content-type") || "application/json",
        "cache-control": "no-store",
        "x-t278-slot": slot,
        "x-t278-upstream-status": String(upstream.status),
        "x-t278-broker-action": "NONE",
        "x-t278-live-capital": "false",
      },
    });
  },
};

export { CANARY_URLS, validBearer };
