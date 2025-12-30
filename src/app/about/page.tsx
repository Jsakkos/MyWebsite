import Image from "next/image";
import Link from "next/link";
import { Download, ExternalLink } from "lucide-react";

export default function About() {
  return (
    <div className="bg-white dark:bg-gray-900">
      <div className="relative isolate overflow-hidden py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
            <div className="max-w-xl lg:max-w-lg">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                About Jonathan K. Sakkos
              </h1>
              <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-300">
                Staff Engineer, Spatial Genomics R&D combining mechanical engineering expertise
                with biotechnology innovation to scale manufacturing processes for next-generation
                spatial biology platforms.
              </p>
              <div className="mt-8">
                <Link
                  href="/files/SakkosCV.pdf"
                  target="_blank"
                  className="inline-flex items-center gap-x-2 rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  <Download className="h-4 w-4" />
                  Download CV
                </Link>
              </div>
            </div>
            <div className="flex items-start justify-center lg:justify-end">
              <Image
                className="rounded-2xl object-cover shadow-xl"
                src="/avatar.jpg"
                alt="Jonathan K. Sakkos"
                width={400}
                height={500}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Professional Summary */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-24">
        <div className="mx-auto max-w-2xl lg:max-w-none">
          <div className="mb-16">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
              Professional Background
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              Currently serving as Staff Engineer, Spatial Genomics R&D at Takara Bio USA, Inc.,
              I specialize in scaling manufacturing processes for spatial biology platforms.
              My role involves bridging the gap between research-scale innovations and
              production-ready systems, with a focus on automation, process optimization,
              and quality control.
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              My background combines deep mechanical engineering expertise with specialized
              knowledge in biotechnology, biomaterials, and synthetic biology. I have extensive
              experience in microscopy, CAD design, rapid prototyping, and bioimage processing,
              which enables me to develop comprehensive solutions for complex biotech challenges.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-2">
            {/* Education */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Education</h3>
              <div className="mt-6 space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">PhD in Mechanical Engineering</h4>
                  <p className="text-gray-600 dark:text-gray-300">University of Minnesota • 2012-2018</p>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Specialized in biomaterials, synthetic biology, and bioengineering applications
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">BS in Mechanical Engineering</h4>
                  <p className="text-gray-600 dark:text-gray-300">University of Portland • 2005-2009</p>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Foundation in mechanical systems, materials science, and engineering design
                  </p>
                </div>
              </div>
            </div>

            {/* Core Competencies */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Core Competencies</h3>
              <div className="mt-6">
                <div className="grid grid-cols-1 gap-2">
                  {[
                    "Process Development & Scaling",
                    "Automation",
                    "Bioimage Processing",
                    "CAD Design & Prototyping",
                    "Microscopy & Imaging",
                    "Data Analysis & Visualization",
                    "Quality Control Systems",
                    "Biomaterials Engineering",
                    "Synthetic Biology",
                    "Project Management"
                  ].map((skill) => (
                    <div key={skill} className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-blue-600 mr-3"></div>
                      <span className="text-gray-600 dark:text-gray-300">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Interests & Focus Areas */}
          <div className="mt-16">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Research Interests & Focus Areas</h3>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
                <h4 className="font-medium text-gray-900 dark:text-white">Process Automation</h4>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  Developing automated systems to improve efficiency, reproducibility, and
                  scalability in biotechnology manufacturing.
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
                <h4 className="font-medium text-gray-900 dark:text-white">Spatial Biology</h4>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  Scaling manufacturing processes for spatial biology platforms that enable
                  comprehensive tissue analysis and disease research.
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
                <h4 className="font-medium text-gray-900 dark:text-white">Data-Driven Engineering</h4>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  Creating custom software tools for process monitoring, data analysis,
                  and decision support in engineering applications.
                </p>
              </div>
            </div>
          </div>

          {/* Contact CTA */}
          <div className="mt-16 text-center">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Let&apos;s Connect</h3>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Interested in collaborating or discussing biotechnology innovation?
            </p>
            <div className="mt-6">
              <Link
                href="/contact"
                className="inline-flex items-center gap-x-2 rounded-md bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Get in Touch
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}