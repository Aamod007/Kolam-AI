'use client'
import FestivalCalendar from './FestivalCalendar'

export default function FestivalCalendarOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
    if (!open) return null
    return (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold font-serif text-yellow-700">Festival Calendar</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl font-bold">&times;</button>
                </div>
                <FestivalCalendar />
            </div>
        </div>
    )
}
