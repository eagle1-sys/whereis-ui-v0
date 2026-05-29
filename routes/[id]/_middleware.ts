import { define } from "../../utils.ts";
import { getEnv } from "../../utils/env.ts";
import { operatorCodes } from "../../utils/operators.ts";

export default define.middleware(async (ctx) => {
  const url = ctx.url;
  // Get id from route parameter instead of query parameter
  const id = ctx.params.id;

  if (!id) {
    return new Response("Missing tracking ID in URL", { status: 400 });
  }

  // Get environment variables
  const apiBaseUrl = getEnv("API_BASE_URL");
  const apiToken = getEnv("API_TOKEN");

  if (!apiToken) {
    console.error("API_TOKEN environment variable is not set");
    return new Response("API configuration error", { status: 500 });
  }

  // First decode if needed
  const decodedId = id.includes("%") ? decodeURIComponent(id) : id;

  // Backwards compatibility fix for old URLs with encoded ? and &

  // Build tracking ID - this will be sent to the API
  let trackingId = id +
    (url.searchParams.toString() ? "?" + url.searchParams.toString() : "");

  // Normalize the tracking ID by fixing ? and & issues
  let normalizedId = normalizeId(decodedId);

  // If the URL [id] doesn't match what we'll send to the API, redirect
  if (normalizedId !== decodedId) {
    // Don't encode the entire ID - ? and & should remain unencoded in the URL path
    return Response.redirect(new URL(`/${normalizedId}`, url.origin), 301);
  }

  // Validate the tracking ID format before calling the API
  const validationError = validateTrackingId(normalizedId, url.searchParams);
  if (validationError) {
    // Reconstruct what the user entered (path + query) for the input field
    const originalInput = trackingId;
    const params = new URLSearchParams({
      error: validationError,
      id: originalInput,
    });
    return Response.redirect(new URL(`/?${params}`, url.origin), 302);
  }

  const startTime = performance.now();

  const response = await fetch(`${apiBaseUrl}/whereis/${trackingId}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${apiToken}`,
    },
  });

  const endTime = performance.now();

  const data = await response.json();
  ctx.state.data = data;
  ctx.state.APItime = (endTime - startTime).toFixed(2);

  return await ctx.next();
});

function normalizeId(id: string): string {
  const parts = id.split(/[?&]/);
  const searchParams = new URLSearchParams();

  for (let i = 1; i < parts.length; i++) {
    const [key, value = ""] = parts[i].split("=");
    searchParams.append(key, value);
  }

  const queryString = searchParams.toString();
  return queryString ? `${parts[0]}?${queryString}` : parts[0];
}

function validateTrackingId(
  id: string,
  searchParams: URLSearchParams,
): string | null {
  if (!id) return "Tracking ID is required.";

  const prefix = id.split("-")[0];
  if (!operatorCodes.includes(prefix)) {
    return "Tracking ID must start with fdx- (FedEx), sfex- (SFExpress) or eg1- (Eagle1).";
  }

  const payload = id.slice(prefix.length + 1);

  if (prefix === "eg1") {
    if (!payload) {
      return "Invalid Eagle1 ID — missing tracking number.";
    }
  } else if (prefix === "sfex") {
    if (!payload.startsWith("SF")) {
      return "Invalid SFExpress ID: must be 'SF' followed by 13 digits.";
    }
    if (payload.length < 15) {
      return "Invalid SFExpress ID — too short.";
    }
    if (!/^SF\d+$/.test(payload)) {
      return "Invalid SFExpress ID: digits only after 'SF'.";
    }
    const phonenum = searchParams.get("phonenum");
    if (!phonenum) {
      return "SFExpress ID requires a phone number.";
    }
  } else {
    if (payload.length < 10) {
      return "Invalid FedEx ID — too short.";
    }
    if (!/^\d+$/.test(payload)) {
      return "Invalid FedEx ID — must contain only digits after fdx-.";
    }
  }

  return null;
}
