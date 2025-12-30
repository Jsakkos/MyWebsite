import Link from "next/link";
import { ExternalLink, BookOpen, Calendar, ArrowRight } from "lucide-react";

const allPublications = [
  {
    id: "carbon-partitioning-2024",
    title: "Coordination of carbon partitioning and photosynthesis by a two-component signaling network in Synechococcus elongatus PCC 7942",
    authors: "María Santos-Merino, Jonathan K Sakkos, Amit K Singh, Daniel C Ducat",
    journal: "Metabolic Engineering",
    year: "2024",
    doi: "10.1016/j.ymben.2023.11.001",
    description: "Investigated carbon partitioning in engineered cyanobacterial strains to optimize photosynthetic efficiency and biomass production.",
  },
  {
    id: "surface-display-2024",
    title: "Population-level heterogeneity complicates utilization of Synechococcus elongatus PCC 7942 surface display platforms",
    authors: "Lisa Yun, Jonathan K Sakkos, Daniel C Ducat",
    journal: "Micropublication Biology",
    year: "2024",
    doi: "https://doi.org/10.17912/micropub.biology.001097",
    description: "Engineered cyanobacterial surface display platforms to facilitate interaction with other microorganisms.",
  },
  {
    id: "partner-fitness-2023",
    title: "Predicting partner fitness based on spatial structuring in a light-driven microbial community",
    authors: "Jonathan K Sakkos, María Santos-Merino, Emmanuel J Kokarakis, Bowen Li, Miguel Fuentes-Cabrera, Paolo Zuliani, Daniel C Ducat",
    journal: "PLOS Computational Biology",
    year: "2023",
    doi: "10.1371/journal.pcbi.1011045",
    description: "Computational modeling of spatial structuring in microbial communities to predict the fitness of engineered consortium partners.",
  },
  {
    id: "carboxysome-morphology-2022",
    title: "Investigating carboxysome morphology dynamics with a rotationally invariant variational autoencoder",
    authors: "Miguel Fuentes-Cabrera, Jonathan K Sakkos, Daniel C Ducat, Maxim Ziatdinov",
    journal: "The Journal of Physical Chemistry A",
    year: "2022",
    doi: "10.1021/acs.jpca.2c03386",
    description: "Study of carboxysome morphology using high-resolution imaging and computational models to understand their dynamics and organization.",
  },
  {
    id: "quorum-sensing-toolkit-2022",
    title: "Developing cyanobacterial quorum sensing toolkits: toward interspecies coordination in mixed autotroph/heterotroph communities",
    authors: "Emmanuel J Kokarakis, Rees Rillema, Daniel C Ducat, Jonathan K Sakkos",
    journal: "ACS Synthetic Biology",
    year: "2022",
    doi: "10.1021/acssynbio.1c00418",
    description: "Creation of modular quorum sensing tools for cyanobacteria enabling complex gene circuit design and cell-cell communication.",
  },
  {
    id: "rubisco-regulation-2022",
    title: "Rubisco regulation in response to altered carbon status in the cyanobacterium Synechococcus elongatus PCC 7942",
    authors: "Amit K Singh, María Santos-Merino, Jonathan K Sakkos, Berkley J Walker, Daniel C Ducat",
    journal: "Plant Physiology",
    year: "2022",
    doi: "10.1093/plphys/kiac065",
    description: "Unraveling the complex regulatory mechanisms of Rubisco in cyanobacteria under varying carbon conditions.",
  },
  {
    id: "degron-2021",
    title: "Orthogonal degron system for controlled protein degradation in cyanobacteria",
    authors: "Jonathan K Sakkos, Sergio Hernandez-Ortiz, Katherine W Osteryoung, Daniel C Ducat",
    journal: "ACS synthetic biology",
    year: "2021",
    doi: "10.1021/acssynbio.1c00035",
    description: "Developed tool for controlled protein degradation in cyanobacteria which can be used to study protein function, regulation, and also has potential applications in biotechnology.",
  },
  {
    id: "nanoscaffold-dynamics-2019",
    title: "Visualizing in vivo dynamics of designer nanoscaffolds",
    authors: "Eric J. Young, Jonathan K. Sakkos, Jingcheng Huang, Jacob K. Wright, Benjamin Kachel, Miguel Fuentes-Cabrera, Cheryl A. Kerfeld, Daniel C. Ducat",
    journal: "Nano Letters",
    year: "2019",
    doi: "10.1021/acs.nanolett.9b02273",
    description: "Development of visualization tools for tracking nanoscaffold dynamics in live cells, combining microscopy automation with custom image analysis pipelines.",
  },
  {
    id: "signal-disruption-2019",
    title: "Signal disruption leads to changes in bacterial community population",
    authors: "Michael Schwab, Celine Bergonzi, Jonathan Sakkos, Christopher Staley, Qian Zhang, Michael J. Sadowsky, Alptekin Aksan, Mikael Elias",
    journal: "Frontiers in Microbiology",
    year: "2019",
    doi: "10.3389/fmicb.2019.00611",
    description: "Investigated how signal disruption affects bacterial community population and biofilm formation.",
  },
  {
    id: "biocatalyst-enhancement-2019",
    title: "Enhancement of biocatalyst activity and protection against stressors using a microbial exoskeleton",
    authors: "Jonathan K. Sakkos, Lawrence P. Wackett, Alptekin Aksan",
    journal: "Scientific Reports",
    year: "2019",
    doi: "10.1038/s41598-019-40113-8",
    description: "Demonstrated a method to enhance biocatalyst activity and stability using a silica-based microbial exoskeleton.",
  },
  {
    id: "adsorption-biodegradation-2017",
    title: "Adsorption and biodegradation of aromatic chemicals by bacteria encapsulated in a hydrophobic silica gel",
    authors: "Jonathan K Sakkos, Baris R Mutlu, Lawrence P Wackett, Alptekin Aksan",
    journal: "ACS Applied Materials and Interfaces",
    year: "2017",
    doi: "10.1021/acsami.7b08466",
    description: "Investigated the coupling of adsorption and biodegradation processes for the removal of aromatic pollutants.",
  },
  {
    id: "silica-encapsulation-2016",
    title: "Engineering of a silica encapsulation platform for hydrocarbon degradation using Pseudomonas sp. NCIB 9816‐4",
    authors: "Jonathan K Sakkos, Daniel P Kieffer, Baris R Mutlu, Lawrence P Wackett, Alptekin Aksan",
    journal: "Biotechnology and Bioengineering",
    year: "2016",
    doi: "10.1002/bit.26049",
    description: "Developed a silica encapsulation platform to stabilize proteins and enzymes for hydrocarbon degradation.",
  }
];

// Helper to bold specific author names
const formatAuthors = (authors: string) => {
  // Variations of the name to bold
  const targetNames = ["Jonathan K Sakkos", "Jonathan K. Sakkos", "Jonathan Sakkos"];

  // Use a regex to match any of the target names
  // We need to escape dots in the names for regex
  const pattern = new RegExp(`(${targetNames.map(name => name.replace('.', '\\.')).join('|')})`, 'g');

  const parts = authors.split(pattern);

  return (
    <span>
      {parts.map((part, index) =>
        targetNames.includes(part) ? (
          <strong key={index} className="font-bold text-gray-900 dark:text-gray-100">{part}</strong>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </span>
  );
};

export default function PublicationsPage() {
  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative isolate overflow-hidden py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Research Publications
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              Peer-reviewed research contributions in synthetic biology, bioengineering,
              and biotechnology innovation using Google Scholar verified data.
            </p>
          </div>
        </div>
      </div>

      {/* All Publications */}
      <section className="pb-16 sm:pb-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl space-y-8">
            {allPublications.map((publication) => (
              <article
                key={publication.id}
                className="relative flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="h-4 w-4" />
                  {publication.year}
                  <span>•</span>
                  <BookOpen className="h-4 w-4" />
                  <span className="font-medium text-gray-900 dark:text-white">{publication.journal}</span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {publication.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {formatAuthors(publication.authors)}
                  </p>
                </div>

                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {publication.description}
                </p>

                <div className="flex items-center pt-2">
                  {publication.doi ? (
                    <Link
                      href={`https://doi.org/${publication.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      View Publication
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <Link
                      href={`https://scholar.google.com/scholar?q=${encodeURIComponent(publication.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Search on Scholar
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>

          <div className="mt-16 text-center">
            <div className="flex justify-center gap-4">
              <Link
                href="https://scholar.google.com/citations?user=lk-vZ4EAAAAJ&hl=en"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <BookOpen className="h-4 w-4" />
                Google Scholar Profile
              </Link>
              <Link
                href="https://orcid.org/0000-0002-6647-5805"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <ExternalLink className="h-4 w-4" />
                ORCID
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}