import Link from "next/link";
import { ArrowRight, Wallet, TrendingUp, BarChart3 } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-black">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Wallet className="h-6 w-6" />
            <span className="text-xl font-bold">UK Side-Hustle Vault</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link 
              href="/sign-in" 
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              Sign In
            </Link>
            <Link 
              href="/sign-up" 
              className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto px-4 py-24 text-center">
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 md:text-6xl">
            Track Every Passive-Income Stream
            <br />
            <span className="text-zinc-600 dark:text-zinc-400">Zero Spreadsheets</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            The all-in-one dashboard for UK side-hustlers. Connect your bank accounts, 
            track income streams, and visualize your passive income – all in one place.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/sign-up"
              className="flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-3 font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Start Tracking Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full border border-zinc-300 px-6 py-3 font-medium text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
            >
              View Demo
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-zinc-100 p-4 dark:bg-zinc-900">
                <Wallet className="h-8 w-8 text-zinc-900 dark:text-zinc-50" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Open Banking</h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Securely connect UK bank accounts with TrueLayer integration
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-zinc-100 p-4 dark:bg-zinc-900">
                <TrendingUp className="h-8 w-8 text-zinc-900 dark:text-zinc-50" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Track Income</h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Monitor rental income, dividends, freelance work, and more
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-zinc-100 p-4 dark:bg-zinc-900">
                <BarChart3 className="h-8 w-8 text-zinc-900 dark:text-zinc-50" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Visualize Growth</h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                See your passive income growth with beautiful dashboards
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 py-8 dark:border-zinc-800">
        <div className="container mx-auto px-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
          <p>© 2025 UK Side-Hustle Vault. Built with Next.js & TailwindCSS.</p>
        </div>
      </footer>
    </div>
  );
}
