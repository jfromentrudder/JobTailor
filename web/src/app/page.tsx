import Link from "next/link";
import { FileText, Zap, Shield, Globe } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Nav */}
      <nav className="flex items-center justify-between max-w-5xl mx-auto px-6 py-6">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-blue-600" />
          <span className="text-xl font-bold text-gray-900 dark:text-gray-100">JobTailor</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-24 text-center">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-100 leading-tight max-w-3xl mx-auto">
          Tailor your resume to every job in{" "}
          <span className="text-blue-600">seconds</span>
        </h1>
        <p className="mt-6 text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
          Upload your resume once. Our browser extension detects job
          descriptions and uses AI to create a perfectly tailored version — no
          copy-pasting, no manual rewrites.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/signup"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Start Free
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 font-medium"
          >
            Sign In
          </Link>
        </div>
        <p className="mt-4 text-sm text-gray-400 dark:text-gray-500">
          5 free tailored resumes per month. No credit card required.
        </p>
      </section>

      {/* How It Works */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 text-center mb-12">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-600 font-bold text-lg">1</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Upload Your Resume
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Upload your base resume PDF to your dashboard. This is the
              starting point for all tailored versions.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-600 font-bold text-lg">2</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Browse Job Listings
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Install the browser extension and browse jobs normally. It
              automatically detects job descriptions on LinkedIn, Indeed, and
              more.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-600 font-bold text-lg">3</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
              One-Click Tailor
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Click &quot;Tailor My Resume&quot; and AI rewrites your resume to
              match the job. Download the PDF and apply with confidence.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 dark:bg-gray-900 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 text-center mb-12">
            Built for Job Seekers
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <Zap className="h-8 w-8 text-blue-600 mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">AI-Powered</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Uses GPT-4o Mini by default. Bring your own API key for
                unlimited usage with OpenAI or Anthropic models.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <Shield className="h-8 w-8 text-blue-600 mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Honest Tailoring
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Never fabricates experience. Only rewrites existing content to
                better match the job description using relevant keywords and
                framing.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <Globe className="h-8 w-8 text-blue-600 mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Works Everywhere
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Chrome, Firefox, and Edge support. Detects jobs on LinkedIn,
                Indeed, Greenhouse, Lever, Workday, and more.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-6 py-12 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-blue-600" />
          <span className="font-bold text-gray-900 dark:text-gray-100">JobTailor</span>
        </div>
        <p className="text-sm text-gray-400 dark:text-gray-500">
          Open source resume tailoring for everyone.
        </p>
      </footer>
    </div>
  );
}
