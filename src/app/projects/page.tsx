import Link from "next/link";
import Image from "next/image";
import { ExternalLink, Github, Tag, BookOpen } from "lucide-react";
import { getResume, Project } from "@/lib/resume";

export default async function ProjectsPage() {
  const resume = await getResume();
  const personalProjects = resume.projects.filter((p) => p.type === "personal");
  const academicProjects = resume.projects.filter((p) => p.type === "academic");

  const ProjectCard = ({ project }: { project: Project }) => (
    <article className="group relative flex flex-col items-start justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 overflow-hidden transition-all hover:shadow-md">
      {project.image && (
        <div className="absolute inset-0 z-0 transition-opacity duration-500 opacity-0 group-hover:opacity-10">
          <Image
            src={project.image}
            alt={project.name}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="z-10 w-full mb-4">
        <div className="flex items-center gap-x-4 text-xs mb-4">
          <time className="text-gray-500 dark:text-gray-400">
            {project.startDate.slice(0, 4)}
          </time>
          <span
            className={`relative z-10 rounded-full px-3 py-1.5 font-medium capitalize ${project.type === "personal"
              ? "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
              : "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
              }`}
          >
            {project.type}
          </span>
        </div>
        <div className="group/title relative w-full">
          <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-white group-hover/title:text-blue-600 dark:group-hover/title:text-blue-400">
            {project.name === "Caltrain Performance Tracker" ? (
              <Link href="/projects/caltrain-tracker">
                <span className="absolute inset-0" />
                {project.name}
              </Link>
            ) : project.url ? (
              <a href={project.url} target="_blank" rel="noopener noreferrer">
                <span className="absolute inset-0" />
                {project.name}
              </a>
            ) : (
              <span>{project.name}</span>
            )}
          </h3>
          <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300 line-clamp-3">
            {project.description}
          </p>
        </div>
      </div>

      <div className="z-10 mt-auto w-full pt-4">
        <div className="flex flex-wrap gap-2 mb-6">
          {project.keywords.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300"
            >
              <Tag className="mr-1 h-3 w-3" />
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {project.blogUrl && (
            <Link
              href={project.blogUrl}
              className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 z-10"
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
              className="flex items-center gap-2 text-sm font-semibold text-gray-900 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white z-10"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
          )}
          {project.name.includes("Caltrain") && (
            <Link href="/projects/caltrain-tracker" className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-500 z-10">
              <ExternalLink className="h-4 w-4" />
              View Dashboard
            </Link>
          )}
        </div>
      </div>
    </article>
  );

  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative isolate overflow-hidden py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Projects
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              A showcase of my experimentation and research. From personal data science projects to academic research in synthetic biology.
            </p>
          </div>
        </div>
      </div>

      {/* Personal Projects */}
      <section className="pb-16 sm:pb-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center mb-12">
            <h2 className="text-base font-semibold leading-7 text-purple-600 dark:text-purple-400">Personal</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Tinkering & Experiments
            </p>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Projects born out of curiosity, utility, and the joy of building.
            </p>
          </div>
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-2">
            {personalProjects.map((project) => (
              <ProjectCard key={project.name} project={project} />
            ))}
          </div>
        </div>
      </section>

      {/* Academic Projects */}
      <section className="bg-gray-50 dark:bg-gray-800/50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center mb-12">
            <h2 className="text-base font-semibold leading-7 text-blue-600 dark:text-blue-400">Academic Features</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Research & Publications
            </p>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Contributions to science and engineering during my academic career.
            </p>
          </div>
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {academicProjects.map((project) => (
              <ProjectCard key={project.name} project={project} />
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
            Interested in knowing more?
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-300">
            Check out my publications or get in touch for a chat.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/publications"
              className="text-sm font-semibold leading-6 text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              View Publications <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/contact"
              className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}