import { define } from "../../utils.ts";
import JsonViewer from "../../islands/JsonViewer.tsx";
import NotFound from "../../components/NotFound.tsx";
import EventItem from "../../components/EventItem.tsx";
import Logo from "../../components/Logo.tsx";
import Footer from "../../components/Footer.tsx";
import { Head } from "fresh/runtime";

export default define.page(function WhereIs(ctx) {
  const data = ctx.state.data;
  const APItime = ctx.state.APItime;

  // Add safety checks
  if (!data || !data.events || !Array.isArray(data.events)) {
    return <NotFound />;
  }

  // Get the latest event and status
  const latestEvent = data.events[data.events.length - 1];
  const latestStatus = latestEvent.what;

  // Check if last event has an exception
  const hasException = latestEvent.additional?.exceptionCode;

  return (
    <div class="font-['iA_Writer_Quattro'] leading-relaxed max-w-xl mx-auto min-h-screen flex flex-col pt-4 px-4">
      
      <Head>
        <title> → {data.entity.id}</title>
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
            {data.events.map((event, index) => (
              <EventItem event={event} index={index} />
            ))}
          </div>

          {/* JSON Toggle Button */}
          <JsonViewer 
            data={data} 
            processingTime={APItime || 0} 
          />
        </div>
      </div>

      <Footer />

      <div class="h-0 text-transparent overflow-hidden">
        <span class="font-bold"></span>
        <span class="italic"></span>
        <span class="font-['Carattere']"></span>
      </div>
    </div>
  );
})
