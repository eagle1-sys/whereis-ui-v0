import { define } from "../../utils.ts";
import JsonViewer from "../../islands/JsonViewer.tsx";
import NotFound from "../../components/NotFound.tsx";
import EventItem from "../../components/EventItem.tsx";
import Logo from "../../components/Logo.tsx";
import Footer from "../../components/Footer.tsx";
import { Head } from "fresh/runtime";
import { getEnv } from "../../utils/env.ts";

export default define.page(function WhereIs(ctx) {
  const data = ctx.state.data;
  const APItime = ctx.state.APItime;

  // Add safety checks
  if (!data || !data.events || !Array.isArray(data.events)) {
    return <NotFound />;
  }

  // Get the highest major event (status code ending in 00)
  const highestMajorEvent = data.events
    .filter((e) => e.status && e.status.toString().endsWith("00"))
    .sort((a, b) => Number(b.status) - Number(a.status))[0];

  const latestEvent = data.events[data.events.length - 1];
  const latestStatus = (highestMajorEvent || latestEvent).what;

  // Check if last event has an exception
  const hasException = latestEvent.additional?.exceptionCode;
  const ogUrl = getEnv("BASE_URL") ? getEnv("BASE_URL") : "https://whereis.eg1.io";
  

  return (
    <div class="font-['iA_Writer_Quattro'] leading-relaxed max-w-xl mx-auto min-h-screen flex flex-col pt-4 px-4">
      
      <Head>
        <title> → {data.entity.id}</title>
        <meta property="og:title" content={`→ ${data.entity.id}`} />
        <meta name="twitter:title" content={`→ ${data.entity.id}`} />
        <meta property="og:url" content={`${ogUrl}/${data.entity.id}`} />
        <meta name="twitter:url" content={`${ogUrl}/${data.entity.id}`} />
      </Head>
      <div class="flex justify-center mt-4 mb-16">
        <a href="/" style="display:none;" class="!inline-block">
          <Logo />
        </a>
      </div>

      <div class="flex-grow">
        <div id="loading" class="text-center py-12" style="display: none;">
          Loading tracking data ...
        </div>

        <div id="main-content" style="display: block;">
          <div class="mb-12 space-y-6">
            <div class="pt-12 text-sm">
              <div class="uppercase mb-1 text-black/60">Last Major Milestone</div>
              <h1 class="text-4xl font-bold tracking-tight">
                <div id="status">{latestStatus}</div>
              </h1>
            </div>
            <div class="grid grid-cols-2 gap-8 text-sm">
              <div>
                <div class="uppercase mb-1 text-black/60">ID</div>
                <div id="tracking-num">{data.entity.id}</div>
              </div>
              <div>
                <div class="uppercase mb-1"></div>
                <div></div>
              </div>
              <div id="origin-container" style={`display: ${data.entity.additional?.origin ? 'block' : 'none'};`}>
                <div class="uppercase mb-1 text-black/60">From</div>
                <div id="origin">{data.entity.additional?.origin || ''}</div>
              </div>
              <div id="destination-container" style={`display: ${data.entity.additional?.destination ? 'block' : 'none'};`}>
                <div class="uppercase mb-1 text-black/60">To</div>
                <div id="destination">{data.entity.additional?.destination || ''}</div>
              </div>
            </div>
          </div>

          {hasException && (
            <div class="mb-12 p-4 bg-red-50 text-sm">
              <div class="text-red-600 uppercase mb-2">{latestEvent.additional.exceptionDesc}</div>
              <div class="text-red-600">{latestEvent.notes}</div>
            </div>
          )}

          <div id="timeline" class="pl-4 [&:has(details)>div:first-child]:pb-4 mt-12 pt-12 border-t border-black/10">
            {/* First event */}
            <EventItem event={data.events[0]} index={0} isLast={data.events.length === 1} />

            {/* Collapsible middle events (only if more than 3 events) */}
            {data.events.length > 3 && (
              <details class="group inline">
                <summary class="relative pl-8 pb-10 pt-5 cursor-pointer select-none list-none border-l border-dashed border-black/10 group-open:border-solid w-fit">
                  <span class="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-xs text-black/80 inline-block w-44 text-center">
                    <span class="group-open:hidden">Show full history</span>
                    <span class="hidden group-open:inline">Hide full history</span>
                  </span>
                </summary>
                {data.events.slice(1, -1).map((event, i) => (
                  <EventItem event={event} index={i + 1} />
                ))}
              </details>
            )}

            {/* Middle event shown directly when exactly 3 events */}
            {data.events.length === 3 && (
              <EventItem event={data.events[1]} index={1} />
            )}

            {/* Last event (if more than 1 event) */}
            {data.events.length > 1 && (
              <EventItem event={data.events[data.events.length - 1]} index={data.events.length - 1} isLast />
            )}
          </div>

        </div>
      </div>

      {/* JSON Toggle Button */}
      <JsonViewer 
        data={data} 
        processingTime={APItime || 0} 
      />

      <Footer />

      <div class="h-0 text-transparent overflow-hidden">
        <span class="font-bold"></span>
        <span class="italic"></span>
        <span class="font-['Dancing_Script']"></span>
      </div>
    </div>
  );
})
