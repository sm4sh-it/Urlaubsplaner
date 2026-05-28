export default function Legend() {
  const legendItems = [
    { key: "U", label: "Urlaub", color: "bg-emerald-500 text-white" },
    { key: "u", label: "Urlaub (Halb)", color: "bg-emerald-300 text-emerald-900" },
    { key: "K", label: "Krank", color: "bg-red-500 text-white" },
    { key: "k", label: "Krank (Halb)", color: "bg-red-300 text-red-900" },
    { key: "Ü", label: "Überstunden", color: "bg-teal-500 text-white" },
    { key: "G", label: "Gleitzeit", color: "bg-orange-500 text-white" },
    { key: "D", label: "Dienstreise", color: "bg-amber-600 text-white" },
    { key: "S", label: "Sonderurlaub", color: "bg-green-700 text-white" },
    { key: "X", label: "Blockiert", color: "bg-neutral-600 text-white dark:bg-neutral-400 dark:text-neutral-900" },
  ]

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4">
      <h2 className="font-semibold text-lg mb-4 text-slate-800 dark:text-slate-200">Legende</h2>
      <div className="grid grid-cols-2 gap-2">
        {legendItems.map((item) => (
          <div key={item.key} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${item.color}`}>
              {item.key}
            </div>
            <span className="text-xs text-slate-600 dark:text-slate-400">{item.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 leading-relaxed">
        <strong>Tipp:</strong>{' '}Klicke auf einen Tag und drücke gleichzeitig die entsprechende Taste (z.B. &quot;U&quot;), um einen Eintrag zu erstellen.
      </div>
    </div>
  )
}
