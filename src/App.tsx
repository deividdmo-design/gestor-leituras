import { useState, useMemo, useEffect } from 'react'
import { useBooks } from './contexts/BookContext'
import { supabase } from './lib/supabase'
import { 
  Library, Star, Trophy, Globe, CheckCircle, Save, History,
  Book as BookIcon, PieChart, LayoutGrid, Quote, MessageSquare, PenTool, Clock, X
} from 'lucide-react'

type BookStatus = 'Lendo' | 'Na Fila' | 'Concluído' | 'Abandonado';

interface Marginalia {
  id: string;
  date: string;
  quote: string;
  reflection: string;
}

interface AppBook {
  id: string; title: string; author: string; author_nationality?: string;
  total_pages: number; read_pages: number; cover_url?: string;
  genre?: string; status: BookStatus; notes?: string;
}

const countryFlags: Record<string, string> = {
  'brasil': '🇧🇷', 'portugal': '🇵🇹', 'estados unidos': '🇺🇸', 'eua': '🇺🇸', 'argentina': '🇦🇷', 'franca': '🇫🇷', 'reino unido': '🇬🇧', 'italia': '🇮🇹', 'alemanha': '🇩🇪'
};

export default function App() {
  const { books, refreshBooks } = useBooks()
  const [currentView, setCurrentView] = useState<'library' | 'analytics' | 'insights'>('library')
  const [selectedBookId, setSelectedBookId] = useState<string>('')
  const [readingGoal, setReadingGoal] = useState(24)
  
  const [currentEntry, setCurrentEntry] = useState({ quote: '', reflection: '' })
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null)

  const activeInsightBook = useMemo(() => 
    books.find(b => b.id === selectedBookId) as AppBook | undefined, 
  [selectedBookId, books])

  const history: Marginalia[] = useMemo(() => {
    if (!activeInsightBook?.notes) return [];
    try {
      const parsed = JSON.parse(activeInsightBook.notes);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) { return []; }
  }, [activeInsightBook]);

  const readingBooks = useMemo(() => books.filter(b => b.status === 'Lendo'), [books])

  useEffect(() => {
    async function loadSettings() {
      const { data } = await supabase.from('settings').select('reading_goal').eq('id', 'user_settings').single();
      if (data) setReadingGoal(data.reading_goal);
    }
    loadSettings();
  }, []);

  async function handleSaveEntry() {
    if (!selectedBookId || (!currentEntry.quote && !currentEntry.reflection)) return;

    let newHistory = [...history];
    if (editingEntryId) {
      newHistory = newHistory.map(en => en.id === editingEntryId ? 
        { ...en, quote: currentEntry.quote, reflection: currentEntry.reflection } : en
      );
    } else {
      const newEntry: Marginalia = {
        id: crypto.randomUUID(),
        date: new Date().toLocaleDateString('pt-BR'),
        quote: currentEntry.quote,
        reflection: currentEntry.reflection
      };
      newHistory = [newEntry, ...newHistory];
    }

    await supabase.from('books').update({ notes: JSON.stringify(newHistory) }).eq('id', selectedBookId);
    setCurrentEntry({ quote: '', reflection: '' });
    setEditingEntryId(null);
    refreshBooks();
  }

  return (
    <div className="min-h-screen bg-[#F9F7F2] text-slate-900">
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
        <div className="w-10 md:w-32"></div> 
      </header>

      <main className="max-w-[1600px] mx-auto p-6 space-y-8">
        {currentView === 'library' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-500">
            {books.map(book => (
              <div key={book.id} className="bg-white p-5 rounded-[2rem] border border-stone-100 flex gap-6 group hover:shadow-xl transition-all">
                <div className="w-28 h-40 bg-stone-50 rounded-xl overflow-hidden shadow-inner shrink-0">{book.cover_url && <img src={book.cover_url} className="w-full h-full object-cover" alt={book.title} />}</div>
                <div className="flex-1 py-1">
                  <span className="text-[8px] font-black uppercase px-2 py-1 rounded border mb-2 block w-fit bg-stone-50">{book.genre}</span>
                  <h3 className="font-black text-lg text-stone-900 leading-tight truncate">{book.title}</h3>
                  <p className="text-xs text-stone-400 font-bold uppercase mt-1 flex items-center gap-1">
                    {book.author_nationality ? (countryFlags[book.author_nationality.toLowerCase().trim()] || <Globe size={10}/>) : <Globe size={10}/>} {book.author}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {currentView === 'insights' && (
          <div className="space-y-6 animate-in slide-in-from-right duration-500">
            <div className="bg-white p-6 rounded-[2rem] border border-stone-200 flex items-center gap-4 print:hidden shadow-sm">
              <select className="flex-1 bg-stone-50 border-none rounded-2xl p-4 font-black text-stone-800 outline-none appearance-none" value={selectedBookId} onChange={(e) => { setSelectedBookId(e.target.value); setEditingEntryId(null); setCurrentEntry({quote:'', reflection:''}); }}>
                <option value="">O que você está lendo agora?</option>
                {readingBooks.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
              </select>
              {activeInsightBook && (
                <button onClick={handleSaveEntry} className="bg-stone-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-amber-600 transition-all shadow-lg">
                  <Save size={18}/> {editingEntryId ? 'Atualizar' : 'Salvar Insight'}
                </button>
              )}
            </div>

            {activeInsightBook && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 bg-white rounded-[3rem] border border-stone-200 overflow-hidden shadow-2xl min-h-[600px]">
                  <div className="p-10 border-r border-stone-100 space-y-6 bg-[#FDFCFB]">
                    <div className="flex items-center gap-2 text-amber-600 font-black uppercase text-[10px] tracking-widest"><Quote size={20}/> Passagem da Obra</div>
                    <textarea className="w-full h-[450px] bg-transparent text-xl font-serif italic text-stone-700 outline-none resize-none leading-relaxed" placeholder="Trecho extraído do livro..." value={currentEntry.quote} onChange={e => setCurrentEntry({...currentEntry, quote: e.target.value})} />
                  </div>
                  <div className="p-10 space-y-6 bg-white">
                    <div className="flex items-center gap-2 text-blue-600 font-black uppercase text-[10px] tracking-widest"><MessageSquare size={20}/> Sua Reflexão</div>
                    <textarea className="w-full h-[450px] bg-transparent text-xl font-bold text-stone-900 outline-none resize-none leading-relaxed" placeholder="O que você anotou na borda?" value={currentEntry.reflection} onChange={e => setCurrentEntry({...currentEntry, reflection: e.target.value})} />
                  </div>
                </div>

                <div className="lg:col-span-4 space-y-4">
                  <div className="flex items-center gap-2 font-black uppercase text-[10px] tracking-[0.2em] text-stone-400 px-4"><History size={16}/> Histórico de Marginalia</div>
                  <div className="space-y-3 max-h-[650px] overflow-y-auto pr-2 custom-scrollbar">
                    {history.length === 0 && <div className="p-10 text-center text-stone-300 border-4 border-dashed border-stone-100 rounded-[2.5rem] font-black uppercase text-[10px]">Aguardando primeiro registro</div>}
                    {history.map((entry) => (
                      <div key={entry.id} className="relative group">
                        <button onClick={() => loadEntry(entry)} className={`w-full text-left p-6 rounded-[2rem] border transition-all ${editingEntryId === entry.id ? 'bg-amber-50 border-amber-200 shadow-lg' : 'bg-white border-stone-100 hover:border-stone-300 shadow-sm'}`}>
                          <div className="flex justify-between items-center mb-3">
                             <div className="flex items-center gap-2 text-[9px] font-black text-stone-400"><Clock size={12}/> {entry.date}</div>
                             {editingEntryId === entry.id && <span className="bg-amber-200 text-amber-800 text-[8px] font-black px-2 py-0.5 rounded-full uppercase">Editando</span>}
                          </div>
                          <p className="text-sm font-serif italic text-stone-600 line-clamp-2 mb-2">"{entry.quote}"</p>
                          <p className="text-xs font-bold text-stone-900 line-clamp-1">{entry.reflection}</p>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {currentView === 'analytics' && (
          <div className="bg-white p-8 rounded-[2.5rem] border border-stone-200 shadow-xl print:hidden">
            <h2 className="text-[11px] font-black uppercase text-amber-600 tracking-[0.3em] mb-4">Reading Challenge 2026</h2>
            <div className="w-full bg-stone-100 h-3 rounded-full overflow-hidden shadow-inner"><div className="bg-amber-500 h-full transition-all duration-1000 shadow-[0_0_15px_rgba(245,158,11,0.4)]" style={{ width: `${Math.min((stats.completedBooks/readingGoal)*100, 100)}%` }}></div></div>
            <p className="text-2xl font-black mt-4">{stats.completedBooks} de {readingGoal} lidos</p>
          </div>
        )}
      </main>
    </div>
  )
}