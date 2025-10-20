import { define } from "../../utils.ts";
import { getEnv } from "../../utils/env.ts";

export default define.middleware(async (ctx) => {

  const url = ctx.url;
  const id = url.searchParams.get("id");

  if (!id) {
    return new Response("Missing 'id' query parameter", { status: 400 });
  }

  // Get environment variables
  const apiBaseUrl = getEnv("API_BASE_URL");
  const apiToken = getEnv("API_TOKEN");

  if (!apiToken) {
    console.error("API_TOKEN environment variable is not set");
    return new Response("API configuration error", { status: 500 });
  }

  // Build tracking ID with all additional parameters (except 'id')
  let trackingId = id;
  
  // Check if the id parameter contains URL-encoded query parameters
  if (id.includes('%26') || id.includes('&')) {
    // The id contains encoded or unencoded parameters, use it as-is but decode if needed
    trackingId = decodeURIComponent(id);
    // Convert & back to ? for the first parameter separator if it doesn't already have ?
    if (!trackingId.includes('?') && (trackingId.includes('&'))) {
      const parts = trackingId.split('&');
      trackingId = parts[0] + '?' + parts.slice(1).join('&');
    }
  } else if (!id.includes('?')) {
    // Handle normal case where we have separate URL parameters
    const additionalParams = new URLSearchParams();
    
    // Add all query parameters except 'id' to the tracking ID
    for (const [key, value] of url.searchParams.entries()) {
      if (key !== 'id') {
        additionalParams.append(key, value);
      }
    }
    
    // If we have additional parameters, append them to the tracking ID
    if (additionalParams.toString()) {
      trackingId = `${id}?${additionalParams.toString()}`;
    }
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
