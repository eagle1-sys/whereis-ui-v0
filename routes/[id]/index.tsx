import { define } from "../../utils.ts";
import JsonViewer from "../../islands/JsonViewer.tsx";
import LocalDate from "../../islands/LocalDate.tsx";
import { Head } from "fresh/runtime";

export default define.page(function WhereIs(ctx) {
  const data = ctx.state.data;
  const APItime = ctx.state.APItime;

  // Add safety checks
  if (!data || !data.events || !Array.isArray(data.events)) {
    return (
      <div class="font-['iA_Writer_Quattro'] leading-relaxed max-w-xl mx-auto min-h-screen flex flex-col pt-4 px-4">
      <Head>
        <title>Not Found</title>
      </Head>
        <div class="flex justify-center mt-4 mb-16">
          <a href="/" style="display:none;" class="!inline-block">
            <svg class="w-9 h-9"viewBox="0 0 325 315" version="1.1" xmlns="http://www.w3.org/2000/svg">
              <g transform="matrix(1,0,0,1,0,-126.485)">
                <path d="M178.627,272.53L74.802,283.45L66.488,204.297C64.434,184.779 78.589,167.297 98.089,165.241L166.598,158.035L177.517,261.942L178.627,272.53Z" style="fill: rgb(35, 31, 32); fill-rule: nonzero"></path>
              </g>
              <g transform="matrix(1,0,0,1,0,-148.618)">
                <path d="M173.865,179.406L277.69,168.486L289.715,282.981L174.136,295.132L162.114,180.643L173.865,179.406Z" style="fill: rgb(35, 31, 32)"></path>
              </g>
              <g transform="matrix(-0.99451,0.104637,0.104637,0.99451,250.805,71.4916)">
                <rect x="79.599" y="62.938" width="104.381" height="104.475" style="fill: rgb(35, 31, 32)"></rect>
              </g>
              <g transform="matrix(1,0,0,1,0,62.4593)">
                <path d="M264.931,175.889L185.232,184.27L174.319,80.367L289.334,68.271L296.535,136.833C298.582,156.35 284.434,173.833 264.931,175.889" style="fill: rgb(35, 31, 32); fill-rule: nonzero"></path>
              </g>
              <g transform="matrix(1,0,0,1,0,33.8691)">
                <path d="M54.307,260.562L89.708,216.812M77.231,20.569L46.082,59.06C38.751,68.123 35.31,79.732 36.529,91.331L54.307,260.562L226.257,242.477C237.847,241.257 248.479,235.483 255.817,226.416L286.503,188.491" style="fill: none; fill-rule: nonzero; stroke: rgb(35, 31, 32); stroke-width: 7.39px;"></path>
              </g>
              <g transform="matrix(1,0,0,1,0,-30.661)">
                <path d="M143.508,247.324L140.849,222.009L176.653,218.243L167.184,128.085L133.813,158.764L130.643,128.581L161.463,101.714L193.57,98.337L205.841,215.173L234.25,212.185L236.909,237.5L143.508,247.324Z" style="fill: white; fill-rule: nonzero"></path>
              </g>
            </svg>
          </a>
        </div>
        <div class="flex-grow flex items-center justify-center">
          <div class="text-center">
            <h1 class="text-2xl font-bold mb-4">No tracking data found</h1>
            <p class="text-gray-600">Please provide a valid tracking ID in the URL.</p>
            <p class="text-sm text-gray-500 mt-2">Example: /fdx-123412341234</p>
          </div>
        </div>
        <footer class="py-8 text-center text-xs">
          v0.3.0 ~ ©2025 EagleOne Holdings
        </footer>
      </div>
    );
  }

  // Get the latest event and status
  const latestEvent = data.events[data.events.length - 1];
  const latestStatus = latestEvent.what;

  // Check if last event has an exception
  const hasException = latestEvent.additional?.exceptionCode;
  // Fallback date formatting function
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(undefined, {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    }).format(date);
  };

  return (
    <div class="font-['iA_Writer_Quattro'] leading-relaxed max-w-xl mx-auto min-h-screen flex flex-col pt-4 px-4">
      
      <Head>
        <title> → {data.entity.id}</title>
      </Head>
      <div class="flex justify-center mt-4 mb-16">
        <a href="/" style="display:none;" class="!inline-block">
          <svg class="w-9 h-9"viewBox="0 0 325 315" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule: evenodd; clip-rule: evenodd; stroke-miterlimit: 10;">
            <g transform="matrix(1,0,0,1,0,-126.485)">
              <path d="M178.627,272.53L74.802,283.45L66.488,204.297C64.434,184.779 78.589,167.297 98.089,165.241L166.598,158.035L177.517,261.942L178.627,272.53Z" style="fill: rgb(35, 31, 32); fill-rule: nonzero"></path>
            </g>
            <g transform="matrix(1,0,0,1,0,-148.618)">
              <path d="M173.865,179.406L277.69,168.486L289.715,282.981L174.136,295.132L162.114,180.643L173.865,179.406Z" style="fill: rgb(35, 31, 32)"></path>
            </g>
            <g transform="matrix(-0.99451,0.104637,0.104637,0.99451,250.805,71.4916)">
              <rect x="79.599" y="62.938" width="104.381" height="104.475" style="fill: rgb(35, 31, 32)"></rect>
            </g>
            <g transform="matrix(1,0,0,1,0,62.4593)">
              <path d="M264.931,175.889L185.232,184.27L174.319,80.367L289.334,68.271L296.535,136.833C298.582,156.35 284.434,173.833 264.931,175.889" style="fill: rgb(35, 31, 32); fill-rule: nonzero"></path>
            </g>
            <g transform="matrix(1,0,0,1,0,33.8691)">
              <path d="M54.307,260.562L89.708,216.812M77.231,20.569L46.082,59.06C38.751,68.123 35.31,79.732 36.529,91.331L54.307,260.562L226.257,242.477C237.847,241.257 248.479,235.483 255.817,226.416L286.503,188.491" style="fill: none; fill-rule: nonzero; stroke: rgb(35, 31, 32); stroke-width: 7.39px;"></path>
            </g>
            <g transform="matrix(1,0,0,1,0,-30.661)">
              <path d="M143.508,247.324L140.849,222.009L176.653,218.243L167.184,128.085L133.813,158.764L130.643,128.581L161.463,101.714L193.57,98.337L205.841,215.173L234.25,212.185L236.909,237.5L143.508,247.324Z" style="fill: white; fill-rule: nonzero"></path>
            </g>
          </svg>
        </a>
      </div>

      <div class="flex-grow">
        <div id="loading" class="text-center py-12" style="display: none;">
          Loading tracking data ...
        </div>

        <div id="main-content" style="display: block;">
          <div class="mb-12 space-y-6">
            <div class="pt-12">
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

          <div id="timeline" class="border-l border-black/10 ml-4">
            {data.events.map((event, index) => {

              const eventCode = event.status;
              const isMajorEvent = eventCode && eventCode.toString().endsWith('00');
              
              return (
                <div class="relative pl-8 pb-12">
                  <div class="relative">
                    <div class="absolute -left-8 -ml-[12px] -top-1 text-2xl bg-white font-['Carattere'] text-black w-6 h-8 flex items-center justify-center">{index + 1}</div>
                    <LocalDate 
                      date={event.when} 
                      class="text-xs text-black/60"
                    />
                  </div>
                  <div class="mt-1 text-xs text-black/60">{event.where}</div>
                  <div class="mt-4 text-base">
                    {event.what}
                    {isMajorEvent && (
                      <a href="https://github.com/eagle1-sys/whereis-api-v0/blob/main/metadata/status-codes.jsonc" target="_blank" class="inline-block relative -top-0.5 ml-2 px-2 py-1 bg-black text-white text-xs">{eventCode}</a>
                    )}
                  </div>
                  {event.notes && (
                    <div class={`mt-1 text-xs italic ${event.additional?.exceptionCode ? 'text-red-600' : 'text-black'}`}>
                      {event.notes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* JSON Toggle Button */}
          <JsonViewer 
            data={data} 
            processingTime={APItime || 0} 
          />
        </div>
      </div>

      {/* Footer always at bottom */}
      <footer class="py-8 text-center text-xs">
        <a href="https://github.com/eagle1-sys/whereis-ui-v0" target="_blank" class="underline hover:no-underline">v0.3</a> ~ Powered by <a href="https://github.com/eagle1-sys" target="_blank" class="underline hover:no-underline">Eagle1 Whereis</a>
      </footer>

      <div class="h-0 text-transparent overflow-hidden">
        <span class="font-bold"></span>
        <span class="italic"></span>
        <span class="font-['Carattere']"></span>
      </div>
    </div>
  );
})
