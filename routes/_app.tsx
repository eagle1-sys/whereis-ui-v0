import { define } from "../utils.ts";
import { getEnv } from "../utils/env.ts";

export default define.page(function App({ Component }) {

   const ogUrl = getEnv("BASE_URL") ? getEnv("BASE_URL") : "https://whereis.eg1.io";

  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="https://cdn.eg1.io/images/favicon.png" />
        <title>EG1: Where is it?</title>
        <meta name="description" content="Eagle1: One API to standardize and connect global logistics data." />
        <meta property="og:url" content={ogUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="EG1: Where is it?" />
        <meta property="og:description" content="Eagle1: One API to standardize and connect global logistics data." />
        <meta property="og:image" content="https://cdn.eg1.io/images/eg1-social-1600px.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={ogUrl} />
        <meta name="twitter:title" content="EG1: Where is it?" />
        <meta name="twitter:description" content="Eagle1: One API to standardize and connect global logistics data." />
        <meta name="twitter:image" content="https://cdn.eg1.io/images/eg1-social-1600px.png" />
      </head>
      <body class="!block" style="display: none;">
        <Component />
      </body>
    </html>
  );
});
