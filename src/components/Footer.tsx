import Link from "next/link"
import packageJson from "../../package.json"

export default function Footer() {
  return (
    <footer className="w-full h-12 flex items-center justify-between px-4 sm:px-6 border-t border-slate-200/80 dark:border-white/5 bg-white/80 dark:bg-[#050a0f]/60 backdrop-blur-md text-xs text-slate-500 dark:text-slate-400 shrink-0 z-20 pb-[env(safe-area-inset-bottom)]">
      <div>
        Urlaubsplaner by{" "}
        <a
          href="https://sm4sh.it"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-brand-600 dark:text-brand-400 hover:underline"
        >
          sm4sh.it
        </a>
      </div>
      <div className="flex items-center gap-2.5 sm:gap-4 font-mono font-medium">
        <span>v{packageJson.version}</span>
        <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
        <Link
          href="/about"
          className="text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors font-sans font-semibold"
        >
          About
        </Link>
      </div>
    </footer>
  )
}
