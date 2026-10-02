import assert from "node:assert/strict";
import test from "node:test";
import worker, { CANARY_URLS, validBearer } from "./worker.mjs";

test("canary allowlist is exactly 12 fixed public Dukascopy URLs", () => {
  assert.equal(Object.keys(CANARY_URLS).length, 12);
  for (const url of Object.values(CANARY_URLS)) {
    assert.match(url, /^https:\/\/jetta\.dukascopy\.com\/v1\//);
  }
  assert.equal(CANARY_URLS["tick-20"], "https://jetta.dukascopy.com/v1/ticks/AUD-USD/2021/12/29/20");
});

test("bearer check fails closed when secret is missing", () => {
  const req = new Request("https://example.test/canary/tick-20", {
    headers: { authorization: "Bearer x" },
  });
  assert.equal(validBearer(req, ""), false);
});

test("unknown path never calls upstream", async () => {
  let called = false;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    called = true;
    throw new Error("must not call");
  };
  try {
    const response = await worker.fetch(
      new Request("https://example.test/canary/not-a-slot", {
        headers: { authorization: "Bearer secret" },
      }),
      { T278_CANARY_TOKEN: "secret" }
    );
    assert.equal(response.status, 404);
    assert.equal(called, false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("authorized fixed slot proxies one upstream response only", async () => {
  let calls = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    calls.push(String(url));
    return new Response('{"timestamp":1,"multiplier":0.00001}', {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };
  try {
    const response = await worker.fetch(
      new Request("https://example.test/canary/tick-20", {
        headers: { authorization: "Bearer secret" },
      }),
      { T278_CANARY_TOKEN: "secret" }
    );
    assert.equal(response.status, 200);
    assert.deepEqual(calls, [CANARY_URLS["tick-20"]]);
    assert.equal(response.headers.get("x-t278-slot"), "tick-20");
    assert.equal(response.headers.get("x-t278-broker-action"), "NONE");
    assert.equal(response.headers.get("x-t278-live-capital"), "false");
  } finally {
    globalThis.fetch = originalFetch;
  }
});
