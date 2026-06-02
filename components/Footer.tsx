interface FooterProps {
  class?: string;
}

export default function Footer({ class: className = "py-8" }: FooterProps) {
  return (
    <footer class={`${className} text-center text-xs`}>
      <a
        href="https://github.com/eagle1-sys/whereis-ui-v0"
        target="_blank"
        class="underline hover:no-underline"
      >
        v0.3.3
      </a>{" "}
      ~ Powered by{" "}
      <a
        href="https://github.com/eagle1-sys"
        target="_blank"
        class="underline hover:no-underline"
      >
        Eagle1 Whereis
      </a>
    </footer>
  );
}
