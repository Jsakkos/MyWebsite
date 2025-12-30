import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Mail, ExternalLink, Github, BookOpen } from "lucide-react";
import { CaltrainDashboard } from "@/components/caltrain-dashboard";
import { getResume } from "@/lib/resume";

export default async function Home() {
  const resume = await getResume();
  const featuredProjects = resume.projects.filter((p) => p.featured);
  const caltrainProject = featuredProjects.find((p) => p.name.includes("Caltrain"));
  const otherFeatured = featuredProjects.filter((p) => !p.name.includes("Caltrain"));

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-950 px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-8">
            <Image
              className="mx-auto h-32 w-32 rounded-full object-cover ring-4 ring-white shadow-lg"
              src="/avatar.jpg"
              alt={resume.basics.name}
              width={128}
              height={128}
              priority
            />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
            {resume.basics.name}
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
            {resume.basics.label} at{" "}
            <a
              href="https://www.takarabio.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Takara Bio USA, Inc.
            </a>
          </p>
          <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-300">
            Scaling manufacturing processes for spatial biology platforms • Biotechnology innovation • Process automation
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/projects"
              className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
            >
              View Projects
              <ArrowRight className="ml-2 inline h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="text-sm font-semibold leading-6 text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Get in touch <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <dl className="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-3">
            <div className="mx-auto flex max-w-xs flex-col gap-y-4">
              <dt className="text-base leading-7 text-gray-600 dark:text-gray-400">Experience</dt>
              <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
                10+ Years
              </dd>
              <p className="text-sm text-gray-500 dark:text-gray-400">In biotech and mechanical engineering</p>
            </div>
            <div className="mx-auto flex max-w-xs flex-col gap-y-4">
              <dt className="text-base leading-7 text-gray-600 dark:text-gray-400">Publications</dt>
              <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
                {resume.publications.length}+
              </dd>
              <p className="text-sm text-gray-500 dark:text-gray-400">Peer-reviewed research publications</p>
            </div>
            <div className="mx-auto flex max-w-xs flex-col gap-y-4">
              <dt className="text-base leading-7 text-gray-600 dark:text-gray-400">Focus</dt>
              <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
                Innovation
              </dd>
              <p className="text-sm text-gray-500 dark:text-gray-400">Process optimization & automation</p>
            </div>
          </dl>
        </div>
      </section>

      {/* Expertise Overview */}
      <section className="bg-gray-50 dark:bg-gray-800/50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-blue-600 dark:text-blue-400">Expertise</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Bridging Engineering & Biotechnology
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              Combining mechanical engineering expertise with biotechnology innovation to develop scalable
              manufacturing processes and automation solutions.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-white">
                  Process Development
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-300">
                  <p className="flex-auto">
                    Scaling manufacturing processes for spatial biology platforms, optimizing workflows from
                    research scale to production.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-white">
                  Automation
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-300">
                  <p className="flex-auto">
                    Designing and implementing automated systems for biotechnology applications, improving
                    efficiency and reproducibility.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-white">
                  Data-Driven Solutions
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-300">
                  <p className="flex-auto">
                    Developing custom software tools for data analysis, process monitoring, and visualization
                    to support engineering decisions.
                  </p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Recent Projects Preview */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-blue-600 dark:text-blue-400">Featured Work</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Recent Projects
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              A selection of technical projects showcasing engineering solutions and innovation.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
            {caltrainProject && (
              <article className="flex flex-col items-start justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 lg:col-span-2">
                <div className="flex items-center gap-x-4 text-xs mb-4">
                  <time className="text-gray-500 dark:text-gray-400">
                    {caltrainProject.startDate.slice(0, 4)}
                  </time>
                  <span className="relative z-10 rounded-full bg-blue-50 px-3 py-1.5 font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 capitalize">
                    {caltrainProject.type}
                  </span>
                  <span className="relative z-10 rounded-full bg-green-50 px-3 py-1.5 font-medium text-green-600 dark:bg-green-900/30 dark:text-green-400">
                    Live Data
                  </span>
                </div>
                <div className="w-full">
                  <div className="group relative mb-6">
                    <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-white group-hover:text-gray-600 dark:group-hover:text-gray-300">
                      <Link href="/projects/caltrain-tracker">
                        <span className="absolute inset-0" />
                        {caltrainProject.name}
                      </Link>
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                      {caltrainProject.description}
                    </p>
                    {caltrainProject.blogUrl && (
                      <p className="mt-2 relative z-10">
                        <Link href={caltrainProject.blogUrl} className="text-sm font-semibold text-blue-600 hover:text-blue-500 flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          Read Story
                        </Link>
                      </p>
                    )}
                  </div>

                  <div className="relative z-10">
                    <CaltrainDashboard />
                  </div>
                </div>
              </article>
            )}

            {otherFeatured.map((project) => (
              <article key={project.name} className="flex flex-col items-start justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div className="flex items-center gap-x-4 text-xs mb-4">
                  <time className="text-gray-500 dark:text-gray-400">
                    {project.startDate.slice(0, 4)}
                  </time>
                  <span className={`relative z-10 rounded-full px-3 py-1.5 font-medium capitalize ${project.type === "personal"
                    ? "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                    : "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                    }`}>
                    {project.type}
                  </span>
                </div>
                <div className="group relative">
                  <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-white group-hover:text-gray-600 dark:group-hover:text-gray-300">
                    {project.url ? (
                      <a href={project.url} target="_blank" rel="noopener noreferrer">
                        <span className="absolute inset-0" />
                        {project.name}
                      </a>
                    ) : (
                      <span>{project.name}</span>
                    )}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
                    {project.description}
                  </p>
                </div>
                <div className="relative mt-8 flex items-center gap-x-4">
                  {project.blogUrl && (
                    <Link
                      href={project.blogUrl}
                      className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:ring-gray-700 dark:hover:bg-gray-700 flex items-center gap-2 z-10"
                    >
                      <BookOpen className="h-4 w-4" />
                      Read Story
                    </Link>
                  )}
                  {project.url && (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:ring-gray-700 dark:hover:bg-gray-700 flex items-center gap-2 z-10"
                    >
                      <Github className="h-4 w-4" />
                      View Code
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>

          <div className="mt-10 flex items-center justify-center">
            <Link
              href="/projects"
              className="text-sm font-semibold leading-6 text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              View all projects <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

