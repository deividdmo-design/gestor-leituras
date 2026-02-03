import { useState, useMemo, useEffect } from 'react'
import { useBooks } from './contexts/BookContext'
import { supabase } from './lib/supabase'
import { 
  Library, Star, Trophy, Globe, CheckCircle,
  Book as BookIcon, PieChart, LayoutGrid, Quote, MessageSquare, PenTool, FileDown
} from 'lucide-react'

type BookStatus = 'Lendo' | 'Na Fila' | 'Concluído' | 'Abandonado';

interface AppBook {
  id: string; title: string; author: string; author_nationality?: string;
  total_pages: number; read_pages: number; cover_url?: string;
  genre?: string; status: BookStatus; rating?: number; notes?: string;
}

const countryFlags: Record<string, string> = {
  'brasil': '🇧🇷', 'brasileira': '🇧🇷', 'argentina': '🇦🇷', 'chile': '🇨🇱', 'colombia': '🇨🇴', 'mexico': '🇲🇽', 'estados unidos': '🇺🇸', 'eua': '🇺🇸', 'canada': '🇨🇦', 'peru': '🇵🇪', 'uruguai': '🇺🇾', 'paraguai': '🇵🇾', 'bolivia': '🇧🇴', 'equador': '🇪🇨', 'venezuela': '🇻🇪', 'cuba': '🇨🇺', 'jamaica': '🇯🇲', 'haiti': '🇭🇹', 'republica dominicana': '🇩🇴', 'guatemala': '🇬🇹', 'honduras': '🇭🇳', 'el salvador': '🇸🇻', 'nicaragua': '🇳🇮', 'costa rica': '🇨🇷', 'panama': '🇵🇦', 'portugal': '🇵🇹', 'espanha': '🇪🇸', 'franca': '🇫🇷', 'italia': '🇮🇹', 'alemanha': '🇩🇪', 'reino unido': '🇬🇧', 'inglaterra': '🇬🇧', 'irlanda': '🇮🇪', 'russia': '🇷🇺', 'grecia': '🇬🇷', 'suica': '🇨🇭', 'austria': '🇦🇹', 'suecia': '🇸🇪', 'noruega': '🇳🇴', 'dinamarca': '🇩🇰', 'finlandia': '🇫🇮', 'polonia': '🇵🇱', 'belgica': '🇧🇪', 'holanda': '🇳🇱', 'paises baixos': '🇳🇱', 'ucrania': '🇺🇦', 'turquia': '🇹🇷', 'checa': '🇨🇿', 'hungria': '🇭🇺', 'romenia': '🇷🇴', 'bulgaria': '🇧🇬', 'croacia': '🇭🇷', 'servia': '🇷🇸', 'eslovaquia': '🇸🇰', 'eslovenia': '🇸🇮', 'estonia': '🇪🇪', 'letonia': '🇱🇻', 'lituania': '🇱🇹', 'islandia': '🇮🇸', 'luxemburgo': '🇱🇺', 'monaco': '🇲🇨', 'angola': '🇦🇴', 'mocambique': '🇲🇿', 'africa do sul': '🇿🇦', 'egito': '🇪🇬', 'nigeria': '🇳🇬', 'marrocos': '🇲🇦', 'argelia': '🇩🇿', 'quenia': '🇰🇪', 'etiopia': '🇪🇹', 'tanzania': '🇹🇿', 'mali': '🇲🇱', 'congo': '🇨🇩', 'gana': '🇬🇭', 'camaroes': '🇨🇲', 'costa do marfim': '🇨🇮', 'senegal': '🇸🇳', 'tunisia': '🇹🇳', 'madagascar': '🇲🇬', 'japao': '🇯🇵', 'china': '🇨🇳', 'coreia do sul': '🇰🇷', 'india': '🇮🇳', 'israel': '🇮🇱', 'palestina': '🇵🇸', 'iraque': '🇮🇶', 'ira': '🇮🇷', 'afeganistao': '🇦🇫', 'vietna': '🇻🇳', 'tailandia': '🇹🇭', 'indonesia': '🇮🇩', 'filipinas': '🇵🇭', 'malasia': '🇲🇾', 'singapura': '🇸🇬', 'paquistao': '🇵🇰', 'bangladesh': '🇧🇩', 'arabia saudita': '🇸🇦', 'emirados arabes': '🇦🇪', 'catar': '🇶🇦', 'libano': '🇱🇧', 'jordania': '🇯🇴', 'siria': '🇸🇾', 'australia': '🇦🇺', 'nova zelandia': '🇳🇿', 'timor leste': '🇹🇱', 'fiji': '🇫🇯', 'niger': '🇳🇪', 'chade': '🇹🇩', 'sudan': '🇸🇩', 'libia': '🇱🇾', 'somalia': '🇸🇴', 'zambia': '🇿🇲', 'zimbabue': '🇿🇼', 'namibia': '🇳🇦', 'botsuana': '🇧🇼', 'guiana': '🇬🇾', 'suriname': '🇸🇷'
};

export default function App() {
  const { books, refreshBooks } = useBooks()
  const [currentView, setCurrentView] = useState<'library' | 'analytics' | 'insights'>('library')
  const [readingGoal, setReadingGoal] = useState(24)
  const [selectedBookId, setSelectedBookId] = useState<string>('')
  const [localNotes, setLocalNotes] = useState({ quote: '', reflection: '' })

  const activeInsightBook = useMemo(() => 
    books.find(b => b.id === selectedBookId) as AppBook | undefined, 
  [selectedBookId, books])

  const readingBooks = useMemo(() => books.filter(b => b.status === 'Lendo'), [books])

  useEffect(() => {
    async function loadSettings() {
      const { data } = await supabase.from('settings').select('reading_goal').eq('id', 'user_settings').single();
      if (data) setReadingGoal(data.reading_goal);
    }
    loadSettings();
  }, []);

  useEffect(() => {
    if (activeInsightBook) {
      const parts = activeInsightBook.notes?.split('---REF---') || ['', ''];
      setLocalNotes({ quote: parts[0], reflection: parts[1] });
    }
  }, [selectedBookId, activeInsightBook]);

  useEffect(() => {
    if (!selectedBookId) return;
    const delay = setTimeout(async () => {
      const formattedNote = `${localNotes.quote}---REF---${localNotes.reflection}`;
      await supabase.from('books').update({ notes: formattedNote }).eq('id', selectedBookId);
      refreshBooks();
    }, 1000);
    return () => clearTimeout(delay);
  }, [localNotes, selectedBookId, refreshBooks]);

  const stats = useMemo(() => ({
    totalBooks: books.length,
    totalReadPages: books.reduce((acc, b) => acc + (b.read_pages || 0), 0),
    completedBooks: books.filter(b => b.status === 'Concluído').length,
    avgRating: books.filter(b => (b.rating || 0) > 0).length > 0 ? (books.reduce((acc, b) => acc + (b.rating || 0), 0) / books.filter(b => (b.rating || 0) > 0).length).toFixed(1) : '0.0'
  }), [books]);

  return (
    <div className="min-h-screen bg-[#F9F7F2] text-slate-900 print:bg-white">
      <header className="bg-white/80 backdrop-blur-md border-b border-stone-200 h-20 flex items-center justify-between px-6 sticky top-0 z-40 print:hidden">
        <div className="flex items-center gap-3">
          <div className="bg-stone-900 p-2.5 rounded-xl text-amber-500 shadow-lg"><Library /></div>
          <h1 className="text-xl font-black uppercase tracking-widest hidden md:block">Estante Premium</h1>
        </div>
        <div className="flex bg-stone-100/50 p-1 rounded-xl">
          <button onClick={() => setCurrentView('library')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${currentView === 'library' ? 'bg-white shadow-sm' : 'text-stone-400'}`}><LayoutGrid className="w-3.5 h-3.5 inline mr-1"/> Biblioteca</button>
          <button onClick={() => setCurrentView('insights')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${currentView === 'insights' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-400'}`}><PenTool className="w-3.5 h-3.5 inline mr-1"/> Insights</button>
          <button onClick={() => setCurrentView('analytics')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${currentView === 'analytics' ? 'bg-white shadow-sm' : 'text-stone-400'}`}><PieChart className="w-3.5 h-3.5 inline mr-1"/> Relatórios</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-8 print:p-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:hidden">
          <div className="bg-white p-5 rounded-3xl border border-stone-200 flex flex-col items-center"><BookIcon className="text-stone-300 mb-1"/><p className="text-xl font-black">{stats.totalBooks}</p></div>
          <div className="bg-white p-5 rounded-3xl border border-stone-200 flex flex-col items-center"><Trophy className="text-amber-500 mb-1"/><p className="text-xl font-black">{stats.totalReadPages.toLocaleString()}</p></div>
          <div className="bg-white p-5 rounded-3xl border border-stone-200 flex flex-col items-center"><CheckCircle className="text-stone-900 mb-1"/><p className="text-xl font-black">{stats.completedBooks}</p></div>
          <div className="bg-white p-5 rounded-3xl border border-stone-200 flex flex-col items-center"><Star className="text-amber-500 mb-1"/><p className="text-xl font-black">{stats.avgRating}</p></div>
        </div>

        {currentView === 'library' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-500">
            {books.map(book => {
              const typedBook = book as any as AppBook;
              return (
                <div key={book.id} className="bg-white p-5 rounded-[2rem] border border-stone-100 flex gap-6 group hover:shadow-xl transition-all">
                  <div className="w-28 h-40 bg-stone-50 rounded-xl overflow-hidden shrink-0 shadow-inner">{book.cover_url && <img src={book.cover_url} className="w-full h-full object-cover" alt={book.title} />}</div>
                  <div className="flex-1 py-1">
                    <span className="text-[8px] font-black uppercase px-2 py-1 rounded border mb-2 block w-fit bg-stone-50">{book.genre}</span>
                    <h3 className="font-black text-lg text-stone-900 leading-tight truncate">{book.title}</h3>
                    <p className="text-xs text-stone-400 font-bold uppercase mt-1 flex items-center gap-1">
                      {book.author_nationality ? (countryFlags[book.author_nationality.toLowerCase().trim()] || <Globe size={10}/>) : <Globe size={10}/>} {book.author}
                    </p>
                    <div className="mt-4 flex gap-2">
                        <span className="text-[9px] font-black px-2 py-1 rounded bg-stone-900 text-white uppercase">{book.status}</span>
                        {typedBook.notes && <div className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-[9px] font-black shadow-sm uppercase tracking-widest">Insights Ativos</div>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {currentView === 'insights' && (
          <div className="space-y-6 animate-in slide-in-from-right duration-500">
            <div className="bg-white p-8 rounded-[2.5rem] border border-stone-200 shadow-sm flex flex-col items-center gap-6 print:hidden">
              <select className="w-full max-w-2xl bg-stone-50 border-2 border-stone-100 rounded-2xl p-4 font-black text-stone-800 outline-none appearance-none text-center shadow-inner cursor-pointer" value={selectedBookId} onChange={(e) => setSelectedBookId(e.target.value)}>
                <option value="">O que você está lendo agora?</option>
                {readingBooks.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
              </select>
              {activeInsightBook && <button onClick={() => window.print()} className="bg-amber-500 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-stone-900 transition-all shadow-lg active:scale-95"><FileDown size={18}/> Exportar PDF</button>}
            </div>
            {activeInsightBook && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0 bg-white rounded-[3rem] border border-stone-200 overflow-hidden shadow-2xl min-h-[600px] relative print:shadow-none print:border-none">
                <div className="p-12 border-r border-stone-100 space-y-6 bg-[#FDFCFB] print:bg-white">
                    <div className="flex items-center gap-3 text-amber-600 print:text-black"><Quote size={24} /><span className="text-[11px] font-black uppercase tracking-[0.4em]">O Autor Disse</span></div>
                    <textarea className="w-full h-[450px] bg-transparent text-xl font-serif italic text-stone-700 outline-none resize-none leading-relaxed print:text-black focus:ring-0" value={localNotes.quote} onChange={(e) => setLocalNotes({...localNotes, quote: e.target.value})} placeholder="Passagem do livro..." />
                </div>
                <div className="p-12 space-y-6 bg-white">
                    <div className="flex items-center gap-3 text-blue-600 print:text-black"><MessageSquare size={24} /><span className="text-[11px] font-black uppercase tracking-[0.4em]">Sua Marginalia</span></div>
                    <textarea className="w-full h-[450px] bg-transparent text-xl font-bold text-stone-900 outline-none resize-none leading-relaxed print:text-black print:font-normal focus:ring-0" value={localNotes.reflection} onChange={(e) => setLocalNotes({...localNotes, reflection: e.target.value})} placeholder="Sua reflexão de borda..." />
                </div>
              </div>
            )}
          </div>
        )}

        {currentView === 'analytics' && (
          <div className="bg-white p-8 rounded-[2.5rem] border border-stone-200 shadow-xl print:hidden animate-in slide-in-from-bottom-4">
            <h2 className="text-[11px] font-black uppercase text-amber-600 tracking-[0.3em] mb-4">Reading Challenge 2026</h2>
            <div className="w-full bg-stone-100 h-3 rounded-full overflow-hidden shadow-inner"><div className="bg-amber-500 h-full transition-all duration-1000 shadow-[0_0_15px_rgba(245,158,11,0.4)]" style={{ width: `${Math.min((stats.completedBooks/readingGoal)*100, 100)}%` }}></div></div>
            <p className="text-2xl font-black mt-4">{stats.completedBooks} de {readingGoal} lidos</p>
          </div>
        )}
      </main>

      <style>{`@media print { @page { size: A4 landscape; margin: 1cm; } header, .print\\:hidden { display: none !important; } textarea { border: none !important; overflow: visible !important; height: auto !important; } }`}</style>
    </div>
  )
}