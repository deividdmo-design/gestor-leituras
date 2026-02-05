import { useState, useMemo, useEffect } from 'react'
import { useBooks } from './contexts/BookContext'
import { supabase } from './lib/supabase'
import { 
  Library, Globe, Save, History, 
  PieChart, LayoutGrid, Quote, MessageSquare, PenTool, Clock, FileDown,
  BookMarked, StickyNote, X, Pencil, Trash2, Plus, Star, Trophy, CheckCircle2
} from 'lucide-react'

type BookStatus = 'Lendo' | 'Na Fila' | 'Concluído' | 'Abandonado';

interface Marginalia {
  id: string; date: string; quote: string; reflection: string;
}

interface AppBook {
  id: string; title: string; author: string; author_nationality?: string;
  total_pages: number; read_pages: number; cover_url?: string;
  genre?: string; status: BookStatus; notes?: string;
}

// 🌍 MAPA-MÚNDI COMPLETO (RESTAURADO)
const countryFlags: Record<string, string> = {
  'brasil': '🇧🇷', 'brasileira': '🇧🇷', 'argentina': '🇦🇷', 'chile': '🇨🇱', 'colombia': '🇨🇴', 'mexico': '🇲🇽', 'estados unidos': '🇺🇸', 'eua': '🇺🇸', 'canada': '🇨🇦', 'peru': '🇵🇪', 'uruguai': '🇺🇾', 'paraguai': '🇵🇾', 'bolivia': '🇧🇴', 'equador': '🇪🇨', 'venezuela': '🇻🇪', 'cuba': '🇨🇺', 'jamaica': '🇯🇲', 'haiti': '🇭🇹', 'republica dominicana': '🇩🇴', 'guatemala': '🇬🇹', 'honduras': '🇭🇳', 'el salvador': '🇸🇻', 'nicaragua': '🇳🇮', 'costa rica': '🇨🇷', 'panama': '🇵🇦', 'portugal': '🇵🇹', 'espanha': '🇪🇸', 'franca': '🇫🇷', 'italia': '🇮🇹', 'alemanha': '🇩🇪', 'reino unido': '🇬🇧', 'inglaterra': '🇬🇧', 'irlanda': '🇮🇪', 'russia': '🇷🇺', 'grecia': '🇬🇷', 'suica': '🇨🇭', 'austria': '🇦🇹', 'suecia': '🇸🇪', 'noruega': '🇳🇴', 'dinamarca': '🇩🇰', 'finlandia': '🇫🇮', 'polonia': '🇵🇱', 'belgica': '🇧🇪', 'holanda': '🇳🇱', 'paises baixos': '🇳🇱', 'ucrania': '🇺🇦', 'turquia': '🇹🇷', 'checa': '🇨🇿', 'hungria': '🇭🇺', 'romenia': '🇷🇴', 'bulgaria': '🇧🇬', 'croacia': '🇭🇷', 'servia': '🇷🇸', 'eslovaquia': '🇸🇰', 'eslovenia': '🇸🇮', 'estonia': '🇪🇪', 'letonia': '🇱🇻', 'lituania': '🇱🇹', 'islandia': '🇮🇸', 'luxemburgo': '🇱🇺', 'monaco': '🇲🇨', 'angola': '🇦🇴', 'mocambique': '🇲🇿', 'africa do sul': '🇿🇦', 'egito': '🇪🇬', 'nigeria': '🇳🇬', 'marrocos': '🇲🇦', 'argelia': '🇩🇿', 'quenia': '🇰🇪', 'etiopia': '🇪🇹', 'tanzania': '🇹🇿', 'mali': '🇲🇱', 'congo': '🇨🇩', 'gana': '🇬🇭', 'camaroes': '🇨🇲', 'costa do marfim': '🇨🇮', 'senegal': '🇸🇳', 'tunisia': '🇹🇳', 'madagascar': '🇲🇬', 'japao': '🇯🇵', 'china': '🇨🇳', 'coreia do sul': '🇰🇷', 'india': '🇮🇳', 'israel': '🇮🇱', 'palestina': '🇵🇸', 'iraque': '🇮🇶', 'ira': '🇮🇷', 'afeganistao': '🇦🇫', 'vietna': '🇻🇳', 'tailandia': '🇹🇭', 'indonesia': '🇮🇩', 'filipinas': '🇵🇭', 'malasia': '🇲🇾', 'singapura': '🇸🇬', 'paquistao': '🇵🇰', 'bangladesh': '🇧🇩', 'arabia saudita': '🇸🇦', 'emirados arabes': '🇦🇪', 'catar': '🇶🇦', 'libano': '🇱🇧', 'jordania': '🇯🇴', 'siria': '🇸🇾', 'australia': '🇦🇺', 'nova zelandia': '🇳🇿', 'timor leste': '🇹🇱', 'fiji': '🇫🇯', 'niger': '🇳🇪', 'chade': '🇹🇩', 'sudan': '🇸🇩', 'libia': '🇱🇾', 'somalia': '🇸🇴', 'zambia': '🇿🇲', 'zimbabue': '🇿🇼', 'namibia': '🇳🇦', 'botsuana': '🇧🇼', 'guiana': '🇬🇾', 'suriname': '🇸🇷'
};

// 🎨 TODOS OS GÊNEROS (RESTAURADO)
const genreColors: Record<string, string> = {
  'História': 'bg-amber-100 text-amber-900 border-amber-200',
  'Medicina': 'bg-emerald-50 text-emerald-900 border-emerald-100',
  'Psicologia': 'bg-indigo-50 text-indigo-900 border-indigo-100',
  'Filosofia': 'bg-stone-800 text-stone-100 border-stone-600',
  'Romance': 'bg-rose-50 text-rose-800 border-rose-100',
  'Autoajuda': 'bg-zinc-700 text-zinc-100 border-zinc-600',
  'Educação': 'bg-blue-100 text-blue-900 border-blue-200',
  'Religião': 'bg-purple-100 text-purple-900 border-purple-200',
  'Ciência': 'bg-cyan-100 text-cyan-900 border-cyan-200',
  'Outros': 'bg-stone-50 text-stone-500 border-stone-200'
};

export default function App() {
  const { books, refreshBooks } = useBooks()
  const [currentView, setCurrentView] = useState<'library' | 'analytics' | 'insights'>('library')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBookId, setEditingBookId] = useState<string | null>(null)
  const [selectedBookId, setSelectedBookId] = useState<string>('')
  const [readingGoal, setReadingGoal] = useState(30)
  
  const [currentEntry, setCurrentEntry] = useState({ quote: '', reflection: '' })
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null)

  const emptyForm = { title: '', author: '', author_nationality: '', total_pages: 0, read_pages: 0, cover_url: '', status: 'Na Fila' as BookStatus, genre: 'Outros' };
  const [formData, setFormData] = useState<any>(emptyForm);

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
      newHistory = [{ id: crypto.randomUUID(), date: new Date().toLocaleDateString('pt-BR'), quote: currentEntry.quote, reflection: currentEntry.reflection }, ...newHistory];
    }
    await supabase.from('books').update({ notes: JSON.stringify(newHistory) }).eq('id', selectedBookId);
    setCurrentEntry({ quote: '', reflection: '' }); setEditingEntryId(null); refreshBooks();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingBookId) await supabase.from('books').update(formData).eq('id', editingBookId);
      else await supabase.from('books').insert([formData]);
      setFormData(emptyForm); setIsModalOpen(false); refreshBooks();
    } catch (e: any) { alert(e.message); }
  }

  const stats = useMemo(() => ({
    total: books.length,
    completed: books.filter(b => b.status === 'Concluído').length,
    pages: books.reduce((acc, b) => acc + (b.read_pages || 0), 0)
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
        <button onClick={() => { setEditingBookId(null); setFormData(emptyForm); setIsModalOpen(true); }} className="bg-stone-900 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-amber-700 shadow-lg active:scale-95 transition-all"><Plus size={20}/> Novo</button>
      </header>

      <main className="max-w-[1600px] mx-auto p-6 space-y-8 print:p-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:hidden">
          <div className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm flex flex-col items-center justify-center"><p className="text-2xl font-black text-stone-900">{stats.total}</p><p className="text-[9px] font-black uppercase text-stone-400 tracking-widest">Acervo</p></div>
          <div className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm flex flex-col items-center justify-center"><p className="text-2xl font-black text-stone-900">{stats.pages.toLocaleString()}</p><p className="text-[9px] font-black uppercase text-stone-400 tracking-widest">Páginas</p></div>
          <div className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm flex flex-col items-center justify-center"><p className="text-2xl font-black text-stone-900">{stats.completed}</p><p className="text-[9px] font-black uppercase text-stone-400 tracking-widest">Lidos</p></div>
        </div>

        {currentView === 'library' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
            {books.map(book => {
              const typedBook = book as any as AppBook;
              const progress = Math.round(((typedBook.read_pages || 0) / (typedBook.total_pages || 1)) * 100);
              return (
                <div key={typedBook.id} className="bg-white p-6 rounded-[2.5rem] border border-stone-100 flex gap-6 group hover:shadow-xl transition-all relative overflow-hidden">
                  <div className="w-32 h-44 bg-stone-50 rounded-2xl overflow-hidden shrink-0 shadow-inner border border-stone-100">{typedBook.cover_url ? <img src={typedBook.cover_url} className="w-full h-full object-cover" alt={typedBook.title} /> : <div className="w-full h-full flex items-center justify-center"><BookMarked className="text-stone-200"/></div>}</div>
                  <div className="flex-1 py-1">
                    <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-md border mb-3 block w-fit ${genreColors[typedBook.genre || 'Outros']}`}>{typedBook.genre}</span>
                    <h3 className="font-black text-lg text-stone-900 leading-tight mb-1">{typedBook.title}</h3>
                    <p className="text-xs text-stone-400 font-bold uppercase flex items-center gap-1">{typedBook.author_nationality ? (countryFlags[typedBook.author_nationality.toLowerCase().trim()] || <Globe size={10}/>) : <Globe size={10}/>} {typedBook.author}</p>
                    <div className="mt-6"><div className="flex justify-between text-[9px] font-black text-stone-400 mb-1.5 uppercase tracking-widest"><span>Progresso</span><span className="text-amber-600">{progress}%</span></div><div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden shadow-inner"><div className="bg-amber-500 h-full transition-all duration-1000" style={{ width: `${progress}%` }}></div></div></div>
                    <div className="mt-5 flex gap-2"><span className="text-[9px] font-black px-3 py-1 rounded-lg bg-stone-50 text-stone-500 uppercase">{typedBook.status}</span>{typedBook.notes && <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-lg text-[9px] font-black flex items-center gap-1 shadow-sm uppercase"><StickyNote size={10}/> Nota</div>}</div>
                  </div>
                  <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => { setEditingBookId(typedBook.id); setFormData(typedBook); setIsModalOpen(true); }} className="p-2.5 text-stone-300 hover:text-stone-900 bg-stone-50 rounded-xl hover:bg-white border border-transparent hover:border-stone-100 shadow-sm transition-all"><Pencil size={16}/></button>
                    <button onClick={() => { if(confirm('Excluir este livro?')) supabase.from('books').delete().eq('id', typedBook.id).then(refreshBooks); }} className="p-2.5 text-stone-300 hover:text-red-600 bg-stone-50 rounded-xl hover:bg-white border border-transparent hover:border-stone-100 shadow-sm transition-all"><Trash2 size={16}/></button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {currentView === 'insights' && (
          <div className="space-y-6 animate-in slide-in-from-right duration-500">
            <div className="bg-white p-6 rounded-[2rem] border border-stone-200 flex items-center gap-4 print:hidden shadow-sm">
              <select className="flex-1 bg-stone-50 border-none rounded-2xl p-4 font-black text-stone-800 outline-none cursor-pointer appearance-none" value={selectedBookId} onChange={(e) => { setSelectedBookId(e.target.value); setEditingEntryId(null); setCurrentEntry({quote:'', reflection:''}); }}>
                <option value="">O que você está lendo agora?</option>
                {readingBooks.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
              </select>
              {activeInsightBook && <button onClick={handleSaveEntry} className="bg-stone-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-amber-600 transition-all shadow-lg active:scale-95"><Save size={18}/> {editingEntryId ? 'Atualizar' : 'Salvar Insight'}</button>}
              {activeInsightBook && <button onClick={() => window.print()} className="bg-amber-500 text-white px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-stone-900 transition-all shadow-lg active:scale-95"><FileDown size={18}/> PDF</button>}
            </div>

            {activeInsightBook && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 bg-white rounded-[3rem] border border-stone-200 overflow-hidden shadow-2xl min-h-[600px] relative print:shadow-none print:border-none print:block">
                  <div className="p-10 border-r border-stone-100 space-y-6 bg-[#FDFCFB] print:bg-white print:p-0 print:mb-10 print:border-none">
                    <div className="flex items-center gap-3 text-amber-600 print:text-black"><Quote size={24} /><span className="text-[11px] font-black uppercase tracking-[0.4em]">Passagem da Obra</span></div>
                    <textarea className="w-full h-[450px] bg-transparent text-xl font-serif italic text-stone-700 outline-none resize-none leading-relaxed print:h-auto print:text-black" placeholder="Digite aqui o trecho..." value={currentEntry.quote} onChange={e => setCurrentEntry({...currentEntry, quote: e.target.value})} />
                  </div>
                  <div className="p-10 space-y-6 bg-white print:p-0">
                    <div className="flex items-center gap-3 text-blue-600 print:text-black"><MessageSquare size={24} /><span className="text-[11px] font-black uppercase tracking-[0.4em]">Sua Reflexão</span></div>
                    <textarea className="w-full h-[450px] bg-transparent text-xl font-bold text-stone-900 outline-none resize-none leading-relaxed print:h-auto print:text-black print:font-normal" placeholder="O que você pensou sobre isso?" value={currentEntry.reflection} onChange={e => setCurrentEntry({...currentEntry, reflection: e.target.value})} />
                  </div>
                </div>
                <div className="lg:col-span-4 space-y-4 print:hidden">
                  <div className="flex items-center gap-2 font-black uppercase text-[10px] text-stone-400 px-4"><History size={16}/> Histórico</div>
                  <div className="space-y-3 max-h-[650px] overflow-y-auto pr-2 custom-scrollbar">
                    {history.map((entry) => (
                      <button key={entry.id} onClick={() => { setCurrentEntry({quote: entry.quote, reflection: entry.reflection}); setEditingEntryId(entry.id); }} className={`w-full text-left p-6 rounded-[2rem] border transition-all ${editingEntryId === entry.id ? 'bg-amber-50 border-amber-200 shadow-md' : 'bg-white border-stone-100 hover:border-stone-300'}`}>
                        <div className="flex items-center gap-2 text-[9px] font-black text-stone-400 mb-3"><Clock size={12}/> {entry.date}</div>
                        <p className="text-sm font-serif italic text-stone-600 line-clamp-2 mb-2">"{entry.quote}"</p>
                        <p className="text-xs font-bold text-stone-900 line-clamp-1">{entry.reflection}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {currentView === 'analytics' && (
          <div className="bg-white p-12 rounded-[3rem] border border-stone-100 shadow-xl print:hidden animate-in slide-in-from-bottom-4">
            <h2 className="text-[11px] font-black uppercase text-amber-600 tracking-[0.3em] mb-6">Reading Challenge 2026</h2>
            <div className="w-full bg-stone-50 h-5 rounded-full overflow-hidden shadow-inner border border-stone-100"><div className="bg-amber-500 h-full transition-all duration-1000 shadow-[0_0_20px_rgba(245,158,11,0.5)]" style={{ width: `${Math.min((stats.completed/readingGoal)*100, 100)}%` }}></div></div>
            <p className="text-4xl font-black mt-8 text-stone-900 tracking-tighter">{stats.completed} de {readingGoal} lidos</p>
          </div>
        )}
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 print:hidden animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] p-8 shadow-2xl overflow-y-auto max-h-[90vh] border border-stone-100">
            <div className="flex justify-between items-center mb-6 pb-6 border-b border-stone-50"><h2 className="font-black uppercase tracking-widest text-stone-900">{editingBookId ? 'Editar Obra' : 'Nova Obra'}</h2><button onClick={() => setIsModalOpen(false)} className="p-2 bg-stone-50 rounded-full hover:bg-stone-100"><X/></button></div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input className="w-full bg-stone-50 rounded-2xl px-6 py-4 font-bold outline-none border-2 border-transparent focus:border-stone-100 transition-all shadow-sm" placeholder="Título" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required/>
              <div className="grid grid-cols-2 gap-4"><input className="bg-stone-50 rounded-2xl px-6 py-4 text-sm font-bold outline-none border-2 border-transparent focus:border-stone-100 shadow-sm" placeholder="Autor" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})}/><input className="bg-stone-50 rounded-2xl px-6 py-4 text-sm font-bold outline-none border-2 border-transparent focus:border-stone-100 shadow-sm" placeholder="País" value={formData.author_nationality} onChange={e => setFormData({...formData, author_nationality: e.target.value})}/></div>
              <input className="w-full bg-stone-50 rounded-2xl px-6 py-4 text-xs font-bold outline-none border-2 border-transparent focus:border-stone-100 shadow-sm" placeholder="URL da Capa" value={formData.cover_url} onChange={e => setFormData({...formData, cover_url: e.target.value})}/>
              <div className="grid grid-cols-2 gap-4"><input type="number" className="bg-stone-50 rounded-2xl px-6 py-4 font-bold outline-none border-2 border-transparent focus:border-stone-100 shadow-sm" placeholder="Total Páginas" value={formData.total_pages} onChange={e => setFormData({...formData, total_pages: Number(e.target.value)})}/><input type="number" className="bg-stone-50 rounded-2xl px-6 py-4 font-bold outline-none border-2 border-transparent focus:border-stone-100 shadow-sm" placeholder="Lidas" value={formData.read_pages} onChange={e => setFormData({...formData, read_pages: Number(e.target.value)})}/></div>
              <div className="grid grid-cols-2 gap-4">
                <select className="bg-stone-50 rounded-2xl px-6 py-4 font-bold outline-none appearance-none cursor-pointer shadow-sm" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}><option value="Na Fila">Na Fila</option><option value="Lendo">Lendo</option><option value="Concluído">Concluído</option><option value="Abandonado">Abandonado</option></select>
                <select className="bg-stone-50 rounded-2xl px-6 py-4 font-bold outline-none appearance-none cursor-pointer shadow-sm" value={formData.genre} onChange={e => setFormData({...formData, genre: e.target.value})}>
                  {Object.keys(genreColors).map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <button type="submit" className="w-full bg-stone-900 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-amber-600 transition-all shadow-xl active:scale-95">Salvar na Estante</button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @media print { 
          @page { size: A4 portrait; margin: 2cm; } 
          body { background: white !important; -webkit-print-color-adjust: exact; font-family: serif; }
          .print\\:hidden { display: none !important; }
          textarea { border: none !important; resize: none !important; overflow: visible !important; height: auto !important; }
        }
      `}</style>
    </div>
  )
}