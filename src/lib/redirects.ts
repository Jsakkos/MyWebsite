export interface Redirect {
  source: string;
  destination: string;
  permanent: true;
}

const RESUME_PDF = "/files/jonathan-sakkos-resume.pdf";

const map: [string, string][] = [
  // Pages retired in the 2026 overhaul
  ["/about", "/work/"],
  ["/experience", "/work/"],
  ["/blog", "/notes/"],
  ["/blog/:slug*", "/notes/:slug*"],
  ["/files/SakkosCV.pdf", RESUME_PDF],
  ["/files/cv.pdf", RESUME_PDF],
  // Hugo-era URLs from the original academic site
  ["/author/:path*", "/work/"],
  ["/authors/:path*", "/work/"],
  ["/courses/:path*", "/work/"],
  ["/publication/:path*", "/publications/"],
  ["/talk/:path*", "/publications/"],
  ["/slides/:path*", "/publications/"],
  ["/project/:path*", "/projects/"],
  ["/home/:path*", "/"],
  ["/post/:path*", "/notes/"],
];

export const REDIRECTS: Redirect[] = map.map(([source, destination]) => ({
  source,
  destination,
  permanent: true,
}));
