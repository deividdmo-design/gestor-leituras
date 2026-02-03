import { useState, useMemo, useEffect } from 'react'
import { useBooks } from './contexts/BookContext'
import { supabase } from './lib/supabase'
import { 
  Library, Star, Trophy, Globe, CheckCircle, Save, History,
  Book as BookIcon, PieChart, LayoutGrid, Quote, MessageSquare, PenTool, FileDown, Clock
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
  genre?: string; status: BookStatus; notes?: string; // notes guardará o JSON das marginalias
}

const countryFlags: Record<string, string> = {
  'brasil': '🇧🇷', 'portugal': '🇵🇹', 'estados unidos': '🇺🇸', 'franca': '🇫🇷' // ... (mantenha seu dicionário completo aqui)
};

export default function App() {
  const { books, refreshBooks } = useBooks()
  const [currentView, setCurrentView] = useState<'library' | 'analytics' | 'insights'>('library')
  const [selectedBookId, setSelectedBookId] = useState<string>('')
  
  // Campos de digitação atual
  const [currentEntry, setCurrentEntry] = useState({ quote: '', reflection: '' })
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null)

  const activeInsightBook = useMemo(() => 
    books.find(b => b.id === selectedBookId) as AppBook | undefined, 
  [selectedBookId, books])

  // Decodifica as notas salvas no banco (JSON) para uma lista de objetos
  const history: Marginalia[] = useMemo(() => {
    if (!activeInsightBook?.notes) return [];
    try {
      return JSON.parse(activeInsightBook.notes);
    } catch (e) { return []; }
  }, [activeInsightBook]);

  const readingBooks = useMemo(() => books.filter(b => b.status === 'Lendo'), [books])

  // Função para salvar uma nova entrada ou atualizar uma existente
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

  function loadEntry(entry: Marginalia) {
    setCurrentEntry({ quote: entry.quote, reflection: entry.reflection });
    setEditingEntryId(entry.id);
  }

  return (
    <div className="min-h-screen bg-[#F9F7F2] text-slate-900">
      <header className="bg-white/80 backdrop-blur-md border-b border-stone-200 h-20 flex items-center justify-between px-6 sticky top-0 z-40 print:hidden">
        <div className="flex items-center gap-3">
          <div className="bg-stone-900 p-2.5 rounded-xl text-amber-500 shadow-lg"><Library /></div>
          <h1 className="text-xl font-black uppercase tracking-widest">Estante Premium</h1>
        </div>
        <div className="flex bg-stone-100/50 p-1 rounded-xl">
          <button onClick={() => setCurrentView('library')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase ${currentView === 'library' ? 'bg-white shadow-sm' : 'text-stone-400'}`}>Biblioteca</button>
          <button onClick={() => setCurrentView('insights')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase ${currentView === 'insights' ? 'bg-white shadow-sm' : 'text-stone-400'}`}>Insights</button>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-6">
        {currentView === 'insights' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-[2rem] border border-stone-200 flex items-center gap-4 print:hidden">
              <select className="flex-1 bg-stone-50 border-none rounded-xl p-4 font-black" value={selectedBookId} onChange={(e) => { setSelectedBookId(e.target.value); setEditingEntryId(null); setCurrentEntry({quote:'', reflection:''}); }}>
                <option value="">Selecione um livro em leitura...</option>
                {readingBooks.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
              </select>
              {activeInsightBook && (
                <button onClick={handleSaveEntry} className="bg-stone-900 text-white px-6 py-4 rounded-xl font-black flex items-center gap-2 hover:bg-amber-600 transition-all">
                  <Save size={18}/> {editingEntryId ? 'Atualizar' : 'Salvar Insight'}
                </button>
              )}
            </div>

            {activeInsightBook && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* COLUNAS DE ESCRITA (8 colunas) */}
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 bg-white rounded-[2.5rem] border border-stone-200 overflow-hidden shadow-xl min-h-[600px]">
                  <div className="p-8 border-r border-stone-100 space-y-4 bg-[#FDFCFB]">
                    <div className="flex items-center gap-2 text-amber-600 font-black uppercase text-[10px] tracking-widest"><Quote size={16}/> O Autor Disse</div>
                    <textarea className="w-full h-[450px] bg-transparent text-lg font-serif italic outline-none resize-none" placeholder="Digite a passagem..." value={currentEntry.quote} onChange={e => setCurrentEntry({...currentEntry, quote: e.target.value})} />
                  </div>
                  <div className="p-8 space-y-4">
                    <div className="flex items-center gap-2 text-blue-600 font-black uppercase text-[10px] tracking-widest"><MessageSquare size={16}/> Minha Reflexão</div>
                    <textarea className="w-full h-[450px] bg-transparent text-lg font-bold outline-none resize-none" placeholder="O que isso te ensinou?" value={currentEntry.reflection} onChange={e => setCurrentEntry({...currentEntry, reflection: e.target.value})} />
                  </div>
                </div>

                {/* COLUNA DE HISTÓRICO (4 colunas) */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="flex items-center gap-2 font-black uppercase text-[10px] tracking-widest text-stone-400 px-2"><History size={16}/> Histórico de Notas</div>
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                    {history.length === 0 && <div className="p-8 text-center text-stone-300 border-2 border-dashed border-stone-100 rounded-[2rem]">Nenhuma nota salva ainda.</div>}
                    {history.map((entry) => (
                      <button key={entry.id} onClick={() => loadEntry(entry)} className={`w-full text-left p-5 rounded-3xl border transition-all ${editingEntryId === entry.id ? 'bg-amber-50 border-amber-200 shadow-md' : 'bg-white border-stone-100 hover:border-stone-300'}`}>
                        <div className="flex items-center gap-2 text-[9px] font-black text-stone-400 mb-2"><Clock size={12}/> {entry.date}</div>
                        <p className="text-sm font-serif italic text-stone-600 line-clamp-2 mb-1">"{entry.quote}"</p>
                        <p className="text-xs font-bold text-stone-900 line-clamp-1">{entry.reflection}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}