interface LocalDateProps {
  date: string; // ISO 8601 UTC string
  class?: string;
}

export default function LocalDate(
  { date, class: className = "" }: LocalDateProps,
) {
  // Simple client-side formatting in user's timezone
  const formatLocalDate = (dateString: string) => {
    try {
      const dateObj = new Date(dateString);
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      return new Intl.DateTimeFormat("en-US", {
        timeZone: userTimezone,
        year: "2-digit",
        month: "2-digit",
        day: "2-digit",
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      }).format(dateObj);
    } catch (error) {
      // Fallback to UTC format if there's any error
      const dateObj = new Date(dateString);
      return dateObj.toISOString().replace("T", " ").slice(0, 19) + " UTC";
    }
  };

  return (
    <div
      dateTime={date}
      class={className}
    >
      {formatLocalDate(date)}
    </div>
  );
}
