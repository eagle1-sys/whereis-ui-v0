import { Head } from "fresh/runtime";
import Logo from "./Logo.tsx";

export default function NotFound() {
  return (
    <div class="font-['iA_Writer_Quattro'] leading-relaxed max-w-xl mx-auto min-h-screen flex flex-col pt-4 px-4">
      <Head>
        <title>Not Found</title>
      </Head>
      <div class="flex justify-center mt-4 mb-16">
        <a href="/" style="display:none;" class="!inline-block">
          <Logo />
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
        <a href="https://github.com/eagle1-sys/whereis-ui-v0" target="_blank" class="underline hover:no-underline">v0.3.1</a> ~ Powered by <a href="https://github.com/eagle1-sys" target="_blank" class="underline hover:no-underline">Eagle1 Whereis</a>
      </footer>
    </div>
  );
}
