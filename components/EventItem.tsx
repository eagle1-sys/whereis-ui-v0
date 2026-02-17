import LocalDate from "../islands/LocalDate.tsx";

interface EventItemProps {
  event: {
    when: string;
    where?: string;
    what: string;
    notes?: string;
    status?: number;
    additional?: {
      exceptionCode?: string;
    };
  };
  index: number;
}

export default function EventItem({ event, index }: EventItemProps) {
  const eventCode = event.status;
  const isMajorEvent = eventCode && eventCode.toString().endsWith("00");

  return (
    <div class="relative pl-8 pb-12">
      <div class="relative">
        <div class="absolute -left-8 -ml-[12px] -top-1 text-2xl bg-white font-['Carattere'] text-black w-6 h-8 flex items-center justify-center">
          {index + 1}
        </div>
        <LocalDate date={event.when} class="text-xs text-black/60" />
      </div>
      <div class="mt-1 text-xs text-black/60">{event.where}</div>
      <div class="mt-4 text-base">
        {event.what}
        {isMajorEvent && (
          <a
            href="https://github.com/eagle1-sys/whereis-api-v0/blob/main/metadata/status-codes.jsonc"
            target="_blank"
            class="inline-block relative -top-0.5 ml-2 px-2 py-1 bg-black text-white text-xs"
          >
            {eventCode}
          </a>
        )}
      </div>
      {event.notes && (
        <div
          class={`mt-1 text-xs italic ${event.additional?.exceptionCode ? "text-red-600" : "text-black"}`}
        >
          {event.notes}
        </div>
      )}
    </div>
  );
}
