import { useSignal } from "@preact/signals";
import { Head } from "fresh/runtime";
import { define } from "../utils.ts";
import Logo from "../components/Logo.tsx";
import Footer from "../components/Footer.tsx";

export default define.page(function Home(ctx) {
  const count = useSignal(3);

  return (
    <>
      <Head>
        <script src="/submit.js"></script>
      </Head>
      <div class="font-['iA_Writer_Quattro'] leading-relaxed max-w-xl mx-auto min-h-screen flex flex-col pt-4 px-4">
        <div class="flex justify-center mt-4 mb-16">
          <Logo />
        </div>
        <div class="flex-grow w-full py-12">
            <div class="relative">
                <div class="space-y-6">
                    <h1 class="text-4xl font-['Fugaz_One'] mb-32">
                        Where is it?
                    </h1>
                    <form
                        id="tracking-form"
                        class="space-y-4"
                    >
                        <div class="relative">
                            <input
                                type="text"
                                id="tracking-input"
                                name="tracking-input"
                                class="w-full p-2 pr-10 border-b-2 border-black focus:outline-none placeholder:text-black/30 rounded-none"
                                placeholder="Example: fdx-123412341234"
                                spellcheck="false"
                            />
                            <button
                                type="submit"
                                class="absolute -right-2 top-1/2 transform -translate-y-1/2 text-xl py-2 px-4"
                                aria-label="Submit tracking number"
                            >
                                →
                            </button>
                        </div>
                        <p id="validation-error" class="text-red-500 text-sm hidden"></p>
                    </form>
                </div>
            </div>
        </div>

        <Footer class="pb-8" />
      </div>
    </>
  );
});
