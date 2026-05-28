import Link from "next/link"
import packageJson from "../../package.json"

export default function Footer() {
  return (
    <footer className="h-12 flex items-center justify-between px-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-sm text-slate-500 dark:text-slate-400 shrink-0 z-10">
      <div>
        Urlaubsplaner by <a href="https://sm4sh.it" target="_blank" rel="noopener noreferrer" className="font-medium text-brand-600 dark:text-brand-500 hover:underline">sm4sh.it</a>
      </div>
      <div className="flex items-center gap-4">
        <span>Version: {packageJson.version}</span>
        <Link href="/about" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
          About
        </Link>
      </div>
    </footer>
  )
}
