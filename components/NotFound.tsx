import { Head } from "fresh/runtime";
import Logo from "./Logo.tsx";
import Footer from "./Footer.tsx";

export default function NotFound({ data }: { data?: any } = {}) {
  const errorCode = data?.error || "";
  const statusPrefix = errorCode.split("-")[0];
  const headings: Record<string, string> = {
    "400": "Invalid tracking number.",
    "401": "Unauthorized",
    "403": "Forbidden",
    "404": "No tracking data found",
    "429": "Too many requests.",
    "500": "Internal Server Error",
  };
  const heading = headings[statusPrefix] || "No tracking data found";

  return (
    <div class="font-['iA_Writer_Quattro'] leading-relaxed max-w-xl mx-auto min-h-screen flex flex-col pt-4 px-4">
      <Head>
        <title>{heading}</title>
      </Head>
      <div class="flex justify-center mt-4 mb-16">
        <a href="/" style="display:none;" class="!inline-block">
          <Logo />
        </a>
      </div>
      <div class="flex-grow flex items-center justify-center overflow-hidden">
        <div class="text-center w-full max-w-xl">
          <h1 class="text-2xl font-bold mb-4">{heading}</h1>
          {data && (
            <pre class="mt-6 text-left text-[0.8em] leading-[1.6em] whitespace-pre overflow-x-auto bg-gray-50 border border-gray-200 p-4 rounded-md font-monospace">{JSON.stringify(data, null, 2)}</pre>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
