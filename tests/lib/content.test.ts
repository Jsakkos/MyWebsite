import {
  getProfile,
  getRecentPublications,
  getFeaturedProjects,
  profileSchema,
} from "@/lib/content";

test("profile validates and has the public-safe essentials", () => {
  const p = getProfile();
  expect(p.basics.name).toBe("Jonathan K. Sakkos");
  expect(p.basics.label).toBe("Staff Engineer, Spatial Genomics R&D");
  expect(p.basics.throughline).toBe(
    "I turn biology into products by building the instruments, software, and processes in between.",
  );
  expect(p.basics.throughline).toContain(p.basics.accent);
  expect(p.pillars).toHaveLength(4);
  expect(p.publications).toHaveLength(15);
  expect(p.work[0].organization).toBe("Takara Bio USA, Inc.");
  expect(p.work[0].endDate).toBeUndefined();
});

test("DOIs are bare and match Crossref-verified values", () => {
  const dois = getProfile().publications.map((x) => x.doi);
  dois.forEach((d) => expect(d).toMatch(/^10\.\d{4,}\//));
  expect(dois).toContain("10.1021/acssynbio.2c00527");
  expect(dois).toContain("10.1021/acs.jpca.2c02179");
  expect(dois).toContain("10.1021/acsami.7b06791");
  expect(dois).toContain("10.1002/bit.25821");
  expect(dois).toContain("10.17912/micropub.biology.001097");
});

test("recent publications are newest first", () => {
  const r = getRecentPublications(3);
  expect(r).toHaveLength(3);
  expect(r[0].year).toBeGreaterThanOrEqual(r[2].year);
});

test("featured projects lead with Engram", () => {
  expect(getFeaturedProjects()[0].slug).toBe("engram");
});

test("schema rejects a publication with a URL in the doi field", () => {
  const bad = structuredClone(getProfile());
  bad.publications[0].doi = "https://doi.org/10.1/x";
  expect(profileSchema.safeParse(bad).success).toBe(false);
});
