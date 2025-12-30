import Link from "next/link";
import Image from "next/image";
import { 
  ArrowLeft, 
  ExternalLink, 
  Github, 
  Calendar, 
  Users, 
  Database, 
  BarChart3,
  Server,
  Globe,
  Code
} from "lucide-react";
import { CaltrainDashboard } from "@/components/caltrain-dashboard";

export default function CaltrainTrackerPage() {
  return (
    <article className="bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-4xl px-6 py-24 sm:py-32 lg:px-8">
        {/* Back to projects */}
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to projects
        </Link>

        {/* Project header */}
        <header className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Caltrain Performance Tracker
            </h1>
            <div className="mt-4 sm:mt-0 flex gap-3">
              <Link
                href="https://github.com/jsakkos/caltrain-tracker"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <Github className="h-4 w-4" />
                View Code
              </Link>
              <Link
                href="#live-demo"
                className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <ExternalLink className="h-4 w-4" />
                Live Demo
              </Link>
            </div>
          </div>
          
          <p className="text-xl leading-8 text-gray-600 dark:text-gray-300">
            A comprehensive real-time analytics platform for tracking Caltrain performance, 
            featuring automated data collection, processing, and interactive visualizations.
          </p>

          <div className="mt-6 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              2024
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              Personal Project
            </div>
            <div className="flex items-center gap-1">
              <Server className="h-4 w-4" />
              Self-hosted
            </div>
          </div>

          {/* Technologies */}
          <div className="mt-6 flex flex-wrap gap-2">
            {["Python", "FastAPI", "PostgreSQL", "Docker", "Plotly", "JavaScript", "HTML/CSS"].map((tech) => (
              <span
                key={tech}
                className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
              >
                {tech}
              </span>
            ))}
          </div>
        </header>

        {/* Project overview */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Project Overview</h2>
          <div className="prose prose-lg text-gray-600 dark:text-gray-300 max-w-none">
            <p>
              The Caltrain Performance Tracker addresses a real need for transparent, accessible transit 
              performance data in the San Francisco Bay Area. While Caltrain provides basic scheduling 
              information, there was no comprehensive public platform for analyzing historical performance 
              trends, delay patterns, and reliability metrics.
            </p>
            <p>
              This platform collects real-time train location data every minute from the 511.org GTFS-RT 
              API, processes it to determine actual arrival times, and generates comprehensive analytics 
              about on-time performance, delay patterns, and service reliability.
            </p>
          </div>
        </section>

        {/* Key features */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Key Features</h2>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center gap-3 mb-3">
                <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Real-time Data Collection</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Automated system collects train position data every minute from the 511.org API, 
                storing over 200MB of historical location and timing data.
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center gap-3 mb-3">
                <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Performance Analytics</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Comprehensive analysis of on-time performance, delay patterns by time of day, 
                day of week, and station location with interactive visualizations.
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center gap-3 mb-3">
                <Globe className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Web Dashboard</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Clean, responsive web interface with interactive Plotly charts for exploring 
                transit performance data and trends over time.
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center gap-3 mb-3">
                <Code className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">REST API</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                FastAPI-based REST API provides programmatic access to all performance 
                data and metrics for integration with other applications.
              </p>
            </div>
          </div>
        </section>

        {/* Technical architecture */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Technical Architecture</h2>
          <div className="prose prose-lg text-gray-600 dark:text-gray-300 max-w-none mb-6">
            <p>
              The system is designed for reliability and scalability, with clear separation between 
              data collection, processing, and presentation layers.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Data Layer</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>PostgreSQL database</li>
                <li>SQLAlchemy ORM</li>
                <li>Alembic migrations</li>
                <li>GTFS static data</li>
              </ul>
            </div>
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                <Server className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Backend Services</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>FastAPI web framework</li>
                <li>Prefect workflow orchestration</li>
                <li>Automated data collection</li>
                <li>Real-time processing</li>
              </ul>
            </div>
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Frontend & Deployment</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>Responsive web interface</li>
                <li>Interactive Plotly charts</li>
                <li>Docker containerization</li>
                <li>Self-hosted infrastructure</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Methodology */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Methodology</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Data Collection</h3>
              <p className="text-gray-600 dark:text-gray-300">
                The system fetches real-time train location data from the GTFS-RT Vehicle Monitoring API 
                every minute. Each data point includes train ID, current position (lat/long), destination 
                station, and timestamp, which is stored in a PostgreSQL database for analysis.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Arrival Detection</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Since the raw data only contains train positions, the system calculates arrival times 
                by determining when each train reaches minimum distance to its destination station using 
                the Haversine formula for geographic distance calculations.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Performance Metrics</h3>
              <p className="text-gray-600 dark:text-gray-300">
                On-time performance is calculated per train and station, with delays categorized as: 
                on-time (0-4 minutes), minor delays (5-14 minutes), and major delays (15+ minutes). 
                The system also tracks commute time patterns for morning (6-9 AM) and evening (3:30-7:30 PM) periods.
              </p>
            </div>
          </div>
        </section>

        {/* Live demo section */}
        <section className="mb-12" id="live-demo">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Live Demo Integration</h2>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              The Caltrain tracker is self-hosted and integrated with this website. You can view live 
              performance data and historical trends through the embedded dashboard below, or visit the 
              full application for detailed analytics.
            </p>
            
            <div className="bg-white dark:bg-gray-900 rounded-lg border p-4 mb-4">
              <CaltrainDashboard />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/projects/caltrain-tracker/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <BarChart3 className="h-4 w-4" />
                View Full Dashboard
              </Link>
              <Link
                href="/api/caltrain/docs"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <Code className="h-4 w-4" />
                API Documentation
              </Link>
            </div>
          </div>
        </section>

        {/* Impact and insights */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Impact & Insights</h2>
          <div className="prose prose-lg text-gray-600 dark:text-gray-300 max-w-none">
            <p>
              This project demonstrates practical application of data engineering principles to solve 
              real-world transit challenges. Key insights from the data include:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Peak hour delays are significantly higher during evening commute periods</li>
              <li>Weather conditions have measurable impact on system performance</li>
              <li>Certain stations consistently experience longer delays due to infrastructure constraints</li>
              <li>Weekend service reliability differs substantially from weekday patterns</li>
            </ul>
            <p>
              The platform has been running continuously since early 2024, collecting valuable transit 
              performance data that could inform infrastructure improvements and service optimization.
            </p>
          </div>
        </section>

        {/* Footer / Next project */}
        <footer className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Interested in the Technical Details?</h3>
              <p className="text-gray-600 dark:text-gray-300">
                The complete source code and documentation are available on GitHub.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="https://github.com/jsakkos/caltrain-tracker"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <Github className="h-4 w-4" />
                View on GitHub
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Discuss Project
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </article>
  );
}