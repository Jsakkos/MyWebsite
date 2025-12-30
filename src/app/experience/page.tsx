import Link from "next/link";
import { MapPin, Calendar, ExternalLink, Briefcase, GraduationCap } from "lucide-react";

const experiences = [
  {
    id: "takara-bio",
    title: "Staff Engineer, Spatial Genomics R&D",
    company: "Takara Bio USA, Inc.",
    location: "San Jose, CA",
    period: "Jan 2025 - Present",
    type: "Full-time",
    description: "Team lead for many spatial genomics R&D engineering initiatives. Responsible for developing and scaling manufacturing processes, implementing automation solutions, and driving technical innovation for next-generation products.",
    achievements: [
      "Led engineering initiative for process improvement and scaling",
      "Designed high-throughput bioinformatics pipeline for spatial genomics data analysis",
      "Collaborated within R&D and production teams to accelerate new product commercialization"
    ],
    skills: ["Spatial Genomics", "Process Automation", "Manufacturing Scaling", "Technical Leadership"],
    website: "https://www.takarabio.com"
  },
  {
    id: "curio-bioscience-2",
    title: "Senior Process Engineer II",
    company: "Curio Bioscience",
    location: "Palo Alto, CA",
    period: "2024 - 2025",
    type: "Full-time",
    description: "Developed and scaled manufacturing processes for spatial biology products. Focused on workflow optimization and transition from research to production environments.",
    achievements: [
      "Continually improved manufacturing processes for Seeker (R) and Trekker (R) spatial transcriptomics products",
      "Implemented quality control systems ensuring high process reliability",
      "Led process efficiency initiatives for increased production throughput",
      "Supported successful product launches through process development and manufacturing improvements"
    ],
    skills: ["Process Scaling", "Manufacturing", "Spatial Biology", "Computer Vision", "Image Analysis", "Python"],
    website: "https://curiobioscience.com"
  },
  {
    id: "curio-bioscience-1",
    title: "Senior Process Development Engineer",
    company: "Curio Bioscience",
    location: "Palo Alto, CA",
    period: "2022 - 2023",
    type: "Full-time",
    description: "Developed and optimized manufacturing workflows for biotech products. Designed and implemented automation solutions to improve efficiency and reproducibility.",
    achievements: [
      "Provided technical expertise in microscopy, mechanical design, and rapid prototyping",
      "Designed process automation tools reducing manual intervention",
      "Established standard operating procedures for new processes"
    ],
    skills: ["Process Development", "Automation", "Spatial Biology", "R&D"],
    website: "https://curiobioscience.com"
  },
  {
    id: "postdoc-research",
    title: "Postdoctoral Researcher",
    company: "Michigan State University",
    location: "East Lansing, MI",
    period: "2018 - 2022",
    type: "Research",
    description: "Conducted advanced research in synthetic biology, microbial consortia, and bioengineering.",
    achievements: [
      "Designed, executed, and analyzed experiments using microbes for sustainable bioproduction of sucrose",
      "Developed a tunable protein degradation system in cyanobacteria",
      "Studied a light‑driven, modular platform based on cyanobacteria for fundamental insight into emergent microbial interactions within consortia using both computational and experimental methodology",
      "Led a team developing genetic circuits based on quorum sensing for use in cyanobacteria and microbial consortia",
      "Co‑authored 3 peer‑reviewed journal articles on molecular tools for cyanobacteria and protein‑based nanomaterials in current position",
      "Mentored 7 graduate and 3 undergraduate students in synthetic biology, leading to 2 co‑authorships on peer‑reviewed journal articles",
      "Established collaborations with scientists and engineers at Oak Ridge National Laboratory’s Center For Nanophase Materials and Newcastle University for studying microbial communities, leading to 3 upcoming journal articles"
    ],
    skills: ["Synthetic Biology", "Computational Biology", "Microscopy", "Bioimage Analysis"],
    website: "https://bmb.natsci.msu.edu/labs/ducat-lab/"
  },
  {
    id: "graduate-research",
    title: "Graduate Research Assistant",
    company: "University of Minnesota",
    location: "Minneapolis, MN",
    period: "2012 - 2018",
    type: "PhD Research",
    description: "Doctoral research focused on living material engineering and biodegradation/biocatalysis applications.",
    achievements: [
      "Designed, synthesized, and characterized new porous silica nanomaterials for bioencapsulation (physical confinement) of bacteria for applications in biotechnology",
      "Authored 7 peer-reviewed journal articles and filed 3 patent applications on bioencapsulation of microbes for water remediation and biocatalysis",
      "Collaborated with a multi‑disciplinary team of biochemists, microbiologists, and engineers to meet overarching project goals",
      "Communicated research output through oral and poster presentations at regional, national, and international conferences",
      "Mentored 6 undergraduate students in materials testing, biochemical assays, and bioencapsulation, leading to co‑authorship on a peer‑reviewed journal article"
    ],
    skills: ["Engineering Living Materials", "Mechanical Testing", "Microscopy", "Spectroscopy", "Biointerface Characterization", "Design of Experiments"],
    website: "https://biogellabs.umn.edu/"
  }
];

const education = [
  {
    degree: "PhD in Mechanical Engineering",
    institution: "University of Minnesota",
    location: "Minneapolis, MN",
    period: "2012 - 2018",
    focus: "Engineered Living Materials, Biocatalysis, Biomaterials",
    thesis: "Engineering Biocatalytic Materials: Encapsulation Systems for Biotechnology"
  },
  {
    degree: "BS in Mechanical Engineering",
    institution: "University of Portland",
    location: "Portland, OR",
    period: "2005 - 2009",
    focus: "Mechanical Systems, Materials Science, Engineering Design",
    thesis: null
  }
];

export default function ExperiencePage() {
  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero section */}
      <div className="relative isolate overflow-hidden py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Professional Experience
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              A journey from academic research to biotech industry,
              specializing in spatial genomics, process development, and automation.
            </p>
          </div>
        </div>
      </div>

      {/* Experience timeline */}
      <section className="pb-16 sm:pb-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center mb-16">
            <h2 className="text-base font-semibold leading-7 text-blue-600 dark:text-blue-400">Career Timeline</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Professional Journey
            </p>
          </div>

          <div className="space-y-8">
            {experiences.map((experience, index) => (
              <div key={experience.id} className="relative">
                {/* Timeline line */}
                {index < experiences.length - 1 && (
                  <div className="absolute left-4 top-16 w-0.5 h-full bg-gray-200 dark:bg-gray-700 -z-10"></div>
                )}

                <article className="relative flex gap-6">
                  {/* Timeline dot */}
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 dark:bg-blue-400 ring-8 ring-white dark:ring-gray-900 z-10">
                    <Briefcase className="h-4 w-4 text-white dark:text-gray-900" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {experience.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 text-blue-600 dark:text-blue-400">
                          <span className="font-medium">{experience.company}</span>
                          {experience.website && (
                            <Link
                              href={experience.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-blue-500"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col sm:items-end mt-2 sm:mt-0">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="h-3 w-3" />
                          {experience.period}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
                          <MapPin className="h-3 w-3" />
                          {experience.location}
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                      {experience.description}
                    </p>

                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Key Achievements</h4>
                      <ul className="space-y-2">
                        {experience.achievements.map((achievement, achievementIndex) => (
                          <li key={achievementIndex} className="flex items-start gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-2 flex-shrink-0"></div>
                            <span className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                              {achievement}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Key Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {experience.skills.map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Education section */}
      <section className="bg-gray-50 dark:bg-gray-800/50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center mb-16">
            <h2 className="text-base font-semibold leading-7 text-blue-600 dark:text-blue-400">Academic Foundation</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Education
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {education.map((edu, index) => (
              <article
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <GraduationCap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {edu.degree}
                    </h3>
                    <p className="text-blue-600 dark:text-blue-400 font-medium mb-2">
                      {edu.institution}
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {edu.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {edu.period}
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-3">
                      <span className="font-medium">Focus:</span> {edu.focus}
                    </p>
                    {edu.thesis && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                        Thesis: {edu.thesis}
                      </p>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Core competencies */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center mb-16">
            <h2 className="text-base font-semibold leading-7 text-blue-600 dark:text-blue-400">Technical Expertise</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Core Competencies
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                category: "Process Development",
                skills: ["Manufacturing Scaling", "Workflow Optimization", "Quality Systems", "Process Validation", "Automation Design"]
              },
              {
                category: "Biotechnology",
                skills: ["Spatial Biology", "Synthetic Biology", "Biomaterials", "Cell Culture", "Bioprocess Engineering"]
              },
              {
                category: "Technical Skills",
                skills: ["Python Programming", "Data Analysis", "Microscopy", "CAD Design", "Laboratory Automation"]
              },
              {
                category: "Research & Development",
                skills: ["Experimental Design", "Statistical Analysis", "Technical Writing", "Project Management", "Collaboration"]
              },
              {
                category: "Engineering Design",
                skills: ["Mechanical Systems", "Prototype Development", "Equipment Specification", "Process Controls", "Safety Systems"]
              },
              {
                category: "Leadership",
                skills: ["Team Management", "Cross-functional Collaboration", "Mentoring", "Strategic Planning", "Communication"]
              }
            ].map((competency) => (
              <div
                key={competency.category}
                className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {competency.category}
                </h3>
                <div className="space-y-2">
                  {competency.skills.map((skill) => (
                    <div key={skill} className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400 mr-3"></div>
                      <span className="text-gray-600 dark:text-gray-300 text-sm">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="bg-gray-50 dark:bg-gray-800/50 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
            Let&apos;s Work Together
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-300">
            Interested in discussing process development opportunities, biotech innovation,
            or technical collaboration?
          </p>
          <div className="mt-8">
            <Link
              href="/contact"
              className="rounded-md bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}