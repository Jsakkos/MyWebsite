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
    description: "Leading R&D engineering initiatives for spatial genomics platforms. Responsible for developing and scaling manufacturing processes, implementing automation solutions, and driving technical innovation for next-generation products.",
    achievements: [
      "Leading process development for novel spatial biology applications",
      "Designing automated workflows for high-throughput manufacturing",
      "Bridging R&D and production teams to accelerate product commercialization"
    ],
    skills: ["Spatial Genomics", "R&D Strategy", "Process Automation", "Manufacturing Scaling", "Technical Leadership"],
    website: "https://www.takarabio.com"
  },
  {
    id: "curio-bioscience",
    title: "Senior Process Development Engineer",
    company: "Curio Bioscience",
    location: "Palo Alto, CA",
    period: "2022 - 2024",
    type: "Full-time",
    description: "Led process development initiatives for spatial biology platforms, focusing on scaling manufacturing processes from research to production. Designed and implemented automation solutions to improve efficiency and reproducibility.",
    achievements: [
      "Developed automated sample preparation workflows that increased throughput by 300%",
      "Led cross-functional teams to optimize manufacturing processes for spatial transcriptomics platforms",
      "Implemented quality control systems ensuring >99% process reliability",
      "Designed custom automation tools reducing manual intervention by 80%"
    ],
    skills: ["Process Development", "Automation", "Spatial Biology", "Manufacturing Scaling", "Quality Control"],
    website: "https://curiobioscience.com"
  },
  {
    id: "postdoc-research",
    title: "Postdoctoral Research Associate",
    company: "University of Minnesota",
    location: "Minneapolis, MN",
    period: "2018 - 2023",
    type: "Research",
    description: "Conducted advanced research in synthetic biology and biomaterials engineering. Developed novel protein engineering approaches and automated microscopy systems for studying cellular dynamics.",
    achievements: [
      "Published 10+ peer-reviewed articles in high-impact journals",
      "Developed orthogonal degron systems for controllable protein degradation",
      "Created automated image analysis pipelines for tracking cellular processes",
      "Mentored 8+ graduate and undergraduate students"
    ],
    skills: ["Synthetic Biology", "Protein Engineering", "Microscopy", "Data Analysis", "Research Management"],
    website: "https://www.umn.edu"
  },
  {
    id: "graduate-research",
    title: "Graduate Research Assistant",
    company: "University of Minnesota",
    location: "Minneapolis, MN",
    period: "2012 - 2018",
    type: "PhD Research",
    description: "Doctoral research focused on biofilm engineering and synthetic biology applications. Specialized in developing controllable biological systems and understanding microbial community dynamics.",
    achievements: [
      "Completed PhD in Mechanical Engineering with focus on bioengineering",
      "Developed novel quorum sensing toolkits for cyanobacterial systems",
      "Created mathematical models for predicting biofilm behavior",
      "Collaborated with interdisciplinary teams across engineering and biology"
    ],
    skills: ["Biofilm Engineering", "Mathematical Modeling", "Cyanobacteria", "Research Design"],
    website: "https://www.umn.edu"
  }
];

const education = [
  {
    degree: "PhD in Mechanical Engineering",
    institution: "University of Minnesota",
    location: "Minneapolis, MN",
    period: "2012 - 2018",
    focus: "Bioengineering, Synthetic Biology, Biomaterials",
    thesis: "Engineering Controllable Biological Systems for Biofilm Applications"
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
              A journey from academic research to biotech industry leadership,
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
            Let's Work Together
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