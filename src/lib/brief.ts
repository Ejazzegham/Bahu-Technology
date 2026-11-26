// Shared option lists + upload limits for the multi-step project brief, used
// by the form (browser) and the API routes (server).

export const BRIEF_SERVICES = [
  "Graphic Design",
  "Web Design & Development",
  "Mobile App Development",
  "Desktop Software",
  "Something else",
] as const;

export const BRIEF_GOALS = [
  "Launch a new product",
  "Redesign / modernise",
  "Get more customers",
  "Automate a process",
  "Build my brand",
  "Fix or improve existing work",
];

export const BRIEF_BUDGETS = ["Under $500", "$500 – $2,000", "$2,000 – $5,000", "$5,000+", "Not sure yet"];
export const BRIEF_TIMELINES = ["ASAP", "1 – 2 months", "3+ months", "Flexible"];

export const BRIEF_MAX_FILES = 5;
export const BRIEF_MAX_FILE_BYTES = 15 * 1024 * 1024; // 15 MB each

/** extension → allowed MIME types. Checked on the client for UX and again on the server for real. */
export const BRIEF_ALLOWED: Record<string, string[]> = {
  pdf: ["application/pdf"],
  png: ["image/png"],
  jpg: ["image/jpeg"],
  jpeg: ["image/jpeg"],
  webp: ["image/webp"],
  gif: ["image/gif"],
  svg: ["image/svg+xml"],
  doc: ["application/msword"],
  docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  xls: ["application/vnd.ms-excel"],
  xlsx: ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
  ppt: ["application/vnd.ms-powerpoint"],
  pptx: ["application/vnd.openxmlformats-officedocument.presentationml.presentation"],
  txt: ["text/plain"],
  zip: ["application/zip", "application/x-zip-compressed"],
};

export const BRIEF_ACCEPT = Object.keys(BRIEF_ALLOWED)
  .map((e) => `.${e}`)
  .join(",");

export function extOf(name: string): string {
  const m = /\.([a-zA-Z0-9]+)$/.exec(name);
  return m ? m[1].toLowerCase() : "";
}

export type BriefFile = { name: string; url: string; size: number };
