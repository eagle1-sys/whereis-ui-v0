import { signal } from "@preact/signals";

interface JsonViewerProps {
  data: any;
  processingTime: number | string;
}

const isVisible = signal(false);

export default function JsonViewer({ data, processingTime }: JsonViewerProps) {
  const showOverlay = () => {
    isVisible.value = true;
    // Prevent body scroll when overlay is open
    document.body.style.overflow = 'hidden';
  };

  const hideOverlay = () => {
    isVisible.value = false;
    document.body.style.overflow = '';
  };

  // Handle escape key
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isVisible.value) {
      hideOverlay();
    }
  };

  // Add event listener for escape key when component mounts
  if (typeof document !== 'undefined') {
    document.addEventListener('keydown', handleKeyDown);
  }

  return (
    <div>
      {/* JSON Toggle Button */}
      <div class="text-center pb-4">
        <button 
          onClick={showOverlay}
          class="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded cursor-pointer text-xs text-black/60"
        >
          <svg class="block mx-auto" viewBox="0 0 24 24" fill="currentColor" style="height:20px;">
            <path d="M6,6A2,2,0,0,1,8,4,1,1,0,0,0,8,2,4,4,0,0,0,4,6V9a2,2,0,0,1-2,2,1,1,0,0,0,0,2,2,2,0,0,1,2,2v3a4,4,0,0,0,4,4,1,1,0,0,0,0-2,2,2,0,0,1-2-2V15a4,4,0,0,0-1.38-3A4,4,0,0,0,6,9Zm16,5a2,2,0,0,1-2-2V6a4,4,0,0,0-4-4,1,1,0,0,0,0,2,2,2,0,0,1,2,2V9a4,4,0,0,0,1.38,3A4,4,0,0,0,18,15v3a2,2,0,0,1-2,2,1,1,0,0,0,0,2,4,4,0,0,0,4-4V15a2,2,0,0,1,2-2,1,1,0,0,0,0-2Z"></path>
          </svg>
          JSON
        </button>
      </div>

      {/* Fullscreen JSON Viewer */}
      {isVisible.value && (
        <div class="fixed inset-0 bg-white z-50 overflow-auto">
          <div class="py-8">
            <div class="max-w-xl mx-auto px-4">
              <div class="flex justify-between items-center mb-6 pb-4 border-b border-black/10">
                <h2 class="text-lg font-monospace">
                  JSON Loaded (<span>{processingTime || 0}ms</span>)
                </h2>
                <button 
                  onClick={hideOverlay}
                  class="text-2xl text-gray-500 hover:text-black cursor-pointer"
                >
                  ×
                </button>
              </div>
              <pre class="text-[0.8em] leading-[1.6em] whitespace-no-wrap overflow-x-auto bg-gray-50 border border-gray-200 p-4 rounded-md font-monospace">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
