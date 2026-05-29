// Single source of truth for the supported carrier operators.
// Used by the /v0/operators API route, the tracking-ID middleware
// validation, and (mirrored in static/submit.js for client-side validation).
export interface Operator {
  code: string;
  name: string;
}

export const operators: Operator[] = [
  { code: "fdx", name: "FedEx" },
  { code: "sfex", name: "SF Express" },
  { code: "eg1", name: "Eagle1" },
];

export const operatorCodes: string[] = operators.map((op) => op.code);
