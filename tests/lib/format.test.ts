import { doiUrl, formatDate, formatDateRange, formatYearMonth, splitAuthors } from "@/lib/format";

test("date ranges use short months and an en dash", () => {
  expect(formatDateRange("2025-01")).toBe("Jan 2025 – present");
  expect(formatDateRange("2022-10", "2023-12")).toBe("Oct 2022 – Dec 2023");
});

test("year-month formats without timezone drift", () => {
  expect(formatYearMonth("2025-08")).toBe("Aug 2025");
  expect(formatYearMonth("2025-08-10")).toBe("Aug 2025");
});

test("full dates format without timezone drift", () => {
  expect(formatDate("2026-11-25")).toBe("Nov 25, 2026");
  expect(formatDate("2026-01-01")).toBe("Jan 1, 2026");
});

test("doiUrl normalizes bare, prefixed and full DOIs", () => {
  expect(doiUrl("10.1021/acssynbio.1c00035")).toBe("https://doi.org/10.1021/acssynbio.1c00035");
  expect(doiUrl("doi:10.1/x")).toBe("https://doi.org/10.1/x");
  expect(doiUrl("https://doi.org/10.1/x")).toBe("https://doi.org/10.1/x");
});

test("splitAuthors marks Jonathan's name in any form", () => {
  const self = (list: string[]) => splitAuthors(list).filter((a) => a.self).map((a) => a.name);
  expect(self(["Yun L", "Sakkos JK", "Ducat DC"])).toEqual(["Sakkos JK"]);
  expect(self(["Zhu K", "Sakkos J"])).toEqual(["Sakkos J"]);
  expect(splitAuthors(["Yun L"])).toEqual([{ name: "Yun L", self: false }]);
});
