import { useState, useMemo, useEffect } from 'react'
import { useBooks } from './contexts/BookContext'
import { supabase } from './lib/supabase'
import { 
  Library, Plus, X, Pencil, Search, Star, Trophy, Globe,
  Book as BookIcon, PieChart, LayoutGrid, Quote, MessageSquare, PenTool, FileDown
} from 'lucide-react'

type BookStatus = 'Lendo' | 'Na Fila' | 'Concluído' | 'Abandonado';

interface AppBook {
  id: string;
  title: string;
  author: string;
  author_nationality?: string;
  total_pages: number;
  read_pages: number;
  cover_url?: string;
  genre?: string;
  status: BookStatus;
  rating?: number;
  notes?: string;
  finished_at?: string;
  started_at?: string;
}

// 🌍 MAPA-MÚNDI COMPLETO PRESERVADO
const countryFlags: Record<string, string> = {
  'brasil': '🇧🇷', 'brasileira': '🇧🇷', 'argentina': '🇦🇷', 'chile': '🇨🇱', 'colombia': '🇨🇴', 'mexico': '🇲🇽', 'estados unidos': '🇺🇸', 'eua': '🇺🇸', 'canada': '🇨🇦', 'peru': '🇵🇪', 'uruguai': '🇺🇾', 'paraguai': '🇵🇾', 'bolivia': '🇧🇴', 'equador': '🇪🇨', 'venezuela': '🇻🇪', 'cuba': '🇨🇺', 'jamaica': '🇯🇲', 'haiti': '🇭🇹', 'republica dominicana': '🇩🇴', 'guatemala': '🇬🇹', 'honduras': '🇭🇳', 'el salvador': '🇸🇻', 'nicaragua': '🇳🇮', 'costa rica': '🇨🇷', 'panama': '🇵🇦', 'portugal': '🇵🇹', 'espanha': '🇪🇸', 'franca': '🇫🇷', 'italia': '🇮🇹', 'alemanha': '🇩🇪', 'reino unido': '🇬🇧', 'inglaterra': '🇬🇧', 'irlanda': '🇮🇪', 'russia': '🇷🇺', 'grecia': '🇬🇷', 'suica': '🇨🇭', 'austria': '🇦🇹', 'suecia': '🇸🇪', 'noruega': '🇳🇴', 'dinamarca': '🇩🇰', 'finlandia': '🇫🇮', 'polonia': '🇵🇱', 'belgica': '🇧🇪', 'holanda': '🇳🇱', 'paises baixos': '🇳🇱', 'ucrania': '🇺🇦', 'turquia': '🇹🇷', 'checa': '🇨🇿', 'hungria': '🇭🇺', 'romenia': '🇷🇴', 'bulgaria': '🇧🇬', 'croacia': '🇭🇷', 'servia': '🇷🇸', 'eslovaquia': '🇸🇰', 'eslovenia': '🇸🇮', 'estonia': '🇪🇪', 'letonia': '🇱🇻', 'lituania': '🇱🇹', 'islandia': '🇮🇸', 'luxemburgo': '🇱🇺', 'monaco': '🇲🇨', 'angola': '🇦🇴', 'mocambique': '🇲🇿', 'africa do sul': '🇿🇦', 'egito': '🇪🇬', 'nigeria': '🇳🇬', 'marrocos': '🇲🇦', 'argelia': '🇩🇿', 'quenia': '🇰🇪', 'etiopia': '🇪🇹', 'tanzania': '🇹🇿', 'mali': '🇲🇱', 'congo': '🇨🇩', 'gana': '🇬🇭', 'camaroes': '🇨🇲', 'costa do marfim': '🇨🇮', 'senegal': '🇸🇳', 'tunisia': '🇹🇳', 'madagascar': '🇲🇬', 'japao': '🇯🇵', 'china': '🇨🇳', 'coreia do sul': '🇰🇷', 'india': '🇮🇳', 'israel': '🇮🇱', 'palestina': '🇵🇸', 'iraque': '🇮🇶', 'ira': '🇮🇷', 'afeganistao': '🇦🇫', 'vietna': '🇻🇳', 'tailandia': '🇹🇭', 'indonesia': '🇮🇩', 'filipinas': '🇵🇭', 'malasia': '🇲🇾', 'singapura': '🇸🇬', 'paquistao': '🇵🇰', 'bangladesh': '🇧🇩', 'arabia saudita': '🇸🇦', 'emirados arabes': '🇦🇪', 'catar': '🇶🇦', 'libano': '🇱🇧', 'jordania': '🇯🇴', 'siria': '🇸🇾', 'australia': '🇦🇺', 'nova zelandia': '🇳🇿', 'timor leste': '🇹🇱', 'fiji': '🇫🇯', 'niger': '🇳🇪', 'chade': '🇹🇩', 'sudan': '🇸🇩', 'libia': '🇱🇾', 'somalia': '🇸🇴', 'zambia': '🇿🇲', 'zimbabue': '🇿🇼', 'namibia': '🇳🇦', 'botsuana': '🇧🇼', 'guiana': '🇬🇾', 'suriname': '🇸🇷'
};

const genreColors: Record<string, string> = {
  'História': 'bg-amber-100 text-amber-900 border-amber-200',
  'Medicina': 'bg-emerald-50 text-emerald-900 border-emerald-100',
  'Psicologia': 'bg-indigo-50 text-indigo-900 border-indigo-100',
  'Filosofia': 'bg-stone-800 text-stone-100 border-stone-600',
  'Romance': 'bg-rose-50 text-rose-800 border-rose-100',
  'Autoajuda': 'bg-zinc-700 text-zinc-100 border-zinc-600',
  'Outros': 'bg-stone-50 text-stone-500 border-stone-200'
};

export default function App() {
  const { books, refreshBooks } = useBooks()
  const [currentView, setCurrentView] = useState<'library' | 'analytics' | 'insights'>('library')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBookId, setEditingBookId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [readingGoal, setReadingGoal] = useState(24)
  const [selectedBookId, setSelectedBookId] = useState<string>('')
  
  const activeInsightBook = useMemo(() => 
    books.find(b => b.id === selectedBookId) as AppBook | undefined, 
  [selectedBookId, books])

  const currentYear = new Date().getFullYear();
  const emptyForm = { title: '', author: '', author_nationality: '', total_pages: 0, read_pages: 0, cover_url: '', status: 'Na Fila' as BookStatus, genre: 'Filosofia', notes: '' };
  const [formData, setFormData] = useState<any>(emptyForm);

  useEffect(() => {
    async function loadSettings() {
      const { data } = await supabase.from('settings').select('reading_goal').eq('id', 'user_settings').single();
      if (data) setReadingGoal(data.reading_goal);
    }
    loadSettings();
  }, []);

  async function saveMarginalia(text: string, type: 'quote' | 'reflection') {
    if (!activeInsightBook) return;
    const parts = activeInsightBook.notes?.split('---REF---') || ['', ''];
    const newNotes = type === 'quote' ? `${text}---REF---${parts[1]}` : `${parts[0]}---REF---${text}`;
    await supabase.from('books').update({ notes: newNotes }).eq('id', activeInsightBook.id);
    refreshBooks();
  }

  const stats = useMemo(() => ({
    totalBooks: books.length,
    totalReadPages: books.reduce((acc, b) => acc + (b.read_pages || 0), 0),
    completedBooks: books.filter(b => b.status === 'Concluído').length,
    avgRating: books.filter(b => (b.rating || 0) > 0).length > 0 ? (books.reduce((acc, b) => acc + (b.rating || 0), 0) / books.filter(b => (b.rating || 0) > 0).length).toFixed(1) : '0.0'
  }), [books]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingBookId) await supabase.from('books').update(formData).eq('id', editingBookId);
      else await supabase.from('books').insert([formData]);
      setFormData(emptyForm); setIsModalOpen(false); refreshBooks();
    } catch (e: any) { alert(e.message); }
  }

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
        <button onClick={() => { setEditingBookId(null); setFormData(emptyForm); setIsModalOpen(true); }} className="bg-stone-900 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-amber-700 shadow-lg"><Plus size={20}/> Novo</button>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-8 print:p-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:hidden">
          <div className="bg-white p-5 rounded-3xl border border-stone-200 flex flex-col items-center"><BookIcon className="text-stone-300 mb-1"/><p className="text-xl font-black">{stats.totalBooks}</p></div>
          <div className="bg-white p-5 rounded-3xl border border-stone-200 flex flex-col items-center"><Trophy className="text-amber-500 mb-1"/><p className="text-xl font-black">{stats.totalReadPages.toLocaleString()}</p></div>
          <div className="bg-white p-5 rounded-3xl border border-stone-200 flex flex-col items-center"><CheckCircle2 className="text-stone-900 mb-1"/><p className="text-xl font-black">{stats.completedBooks}</p></div>
          <div className="bg-white p-5 rounded-3xl border border-stone-200 flex flex-col items-center"><Star className="text-amber-500 mb-1"/><p className="text-xl font-black">{stats.avgRating}</p></div>
        </div>

        {currentView === 'library' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-500">
            {books.filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase())).map(book => {
              const typedBook = book as any as AppBook;
              return (
                <div key={book.id} className="bg-white p-5 rounded-[2rem] border border-stone-100 flex gap-6 group hover:shadow-xl transition-all">
                  <div className="w-28 h-40 bg-stone-50 rounded-xl overflow-hidden shadow-inner shrink-0">{book.cover_url && <img src={book.cover_url} className="w-full h-full object-cover" />}</div>
                  <div className="flex-1 py-1">
                    <span className={`text-[8px] font-black uppercase px-2 py-1 rounded border mb-2 block w-fit ${genreColors[book.genre || ''] || 'bg-stone-100'}`}>{book.genre}</span>
                    <h3 className="font-black text-lg text-stone-900 leading-tight truncate">{book.title}</h3>
                    <p className="text-xs text-stone-400 font-bold uppercase mt-1 flex items-center gap-1">
                      {book.author_nationality ? (countryFlags[book.author_nationality.toLowerCase().trim()] || <Globe size={10}/>) : <Globe size={10}/>} {book.author}
                    </p>
                    <div className="mt-4 flex gap-2">
                        <span className="text-[9px] font-black px-2 py-1 rounded bg-stone-900 text-white uppercase">{book.status}</span>
                        {typedBook.notes && <div className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-[9px] font-black shadow-sm">COM INSIGHTS</div>}
                    </div>
                  </div>
                  <button onClick={() => { setEditingBookId(book.id); setFormData(book); setIsModalOpen(true); }} className="opacity-0 group-hover:opacity-100 p-2 text-stone-300 hover:text-stone-900 transition-all self-start"><Pencil size={16}/></button>
                </div>
              )
            })}
          </div>
        )}

        {currentView === 'insights' && (
          <div className="space-y-6 animate-in slide-in-from-right duration-500">
            <div className="bg-white p-8 rounded-[2.5rem] border border-stone-200 shadow-sm flex flex-col items-center gap-6 print:hidden">
              <select className="w-full max-w-2xl bg-stone-50 border-2 border-stone-100 rounded-2xl p-4 font-black text-stone-800 outline-none focus:border-amber-500 appearance-none text-center shadow-inner" value={selectedBookId} onChange={(e) => setSelectedBookId(e.target.value)}>
                <option value="">Escolha uma obra para estudar...</option>
                {books.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
              </select>
              {activeInsightBook && <button onClick={() => window.print()} className="bg-amber-500 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-stone-900 transition-all shadow-lg"><FileDown size={18}/> Exportar PDF</button>}
            </div>
            {activeInsightBook && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0 bg-white rounded-[3rem] border border-stone-200 overflow-hidden shadow-2xl min-h-[600px] relative print:shadow-none print:border-none">
                <div className="p-12 border-r border-stone-100 space-y-6 bg-[#FDFCFB] print:bg-white">
                    <div className="flex items-center gap-3 text-amber-600 print:text-black"><Quote size={24} /><span className="text-[11px] font-black uppercase tracking-[0.4em]">O Autor Disse</span></div>
                    <textarea className="w-full h-[450px] bg-transparent text-xl font-serif italic text-stone-700 outline-none resize-none leading-relaxed print:text-black" value={activeInsightBook.notes?.split('---REF---')[0] || ''} onChange={(e) => saveMarginalia(e.target.value, 'quote')} />
                </div>
                <div className="p-12 space-y-6 bg-white">
                    <div className="flex items-center gap-3 text-blue-600 print:text-black"><MessageSquare size={24} /><span className="text-[11px] font-black uppercase tracking-[0.4em]">Sua Marginalia</span></div>
                    <textarea className="w-full h-[450px] bg-transparent text-xl font-bold text-stone-900 outline-none resize-none leading-relaxed print:text-black print:font-normal" value={activeInsightBook.notes?.split('---REF---')[1] || ''} onChange={(e) => saveMarginalia(e.target.value, 'reflection')} />
                </div>
              </div>
            )}
          </div>
        )}

        {currentView === 'analytics' && (
          <div className="bg-white p-8 rounded-[2.5rem] border border-stone-200 shadow-xl print:hidden">
            <h2 className="text-[11px] font-black uppercase text-amber-600 tracking-[0.3em] mb-4">Reading Challenge {currentYear}</h2>
            <div className="w-full bg-stone-100 h-3 rounded-full overflow-hidden shadow-inner"><div className="bg-amber-500 h-full transition-all duration-1000 shadow-[0_0_15px_rgba(245,158,11,0.4)]" style={{ width: `${Math.min((stats.completedBooks/readingGoal)*100, 100)}%` }}></div></div>
            <p className="text-2xl font-black mt-4">{stats.completedBooks} de {readingGoal} lidos</p>
          </div>
        )}
      </main>

      <style>{`@media print { @page { size: A4 landscape; margin: 1cm; } header, .print\\:hidden { display: none !important; } textarea { border: none !important; overflow: visible !important; height: auto !important; } }`}</style>

      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 print:hidden">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6 pb-6 border-b border-stone-50"><h2 className="font-black uppercase tracking-widest text-stone-900">Configurar Obra</h2><button onClick={() => setIsModalOpen(false)} className="p-2 bg-stone-50 rounded-full hover:bg-stone-100"><X/></button></div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input className="w-full bg-stone-50 rounded-2xl px-6 py-4 font-bold outline-none" placeholder="Título" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required/>
              <div className="grid grid-cols-2 gap-4">
                <input className="bg-stone-50 rounded-2xl px-6 py-4 text-sm font-bold outline-none" placeholder="Autor" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})}/>
                <input className="bg-stone-50 rounded-2xl px-6 py-4 text-sm font-bold outline-none" placeholder="País" value={formData.author_nationality} onChange={e => setFormData({...formData, author_nationality: e.target.value})}/>
              </div>
              <input className="w-full bg-stone-50 rounded-2xl px-6 py-4 text-xs font-bold outline-none" placeholder="URL da Capa" value={formData.cover_url} onChange={e => setFormData({...formData, cover_url: e.target.value})}/>
              <div className="grid grid-cols-2 gap-4">
                <input type="number" className="bg-stone-50 rounded-2xl px-6 py-4 font-bold outline-none" placeholder="Páginas" value={formData.total_pages} onChange={e => setFormData({...formData, total_pages: Number(e.target.value)})}/>
                <select className="bg-stone-50 rounded-2xl px-6 py-4 font-bold outline-none" value={formData.genre} onChange={e => setFormData({...formData, genre: e.target.value})}><option>Filosofia</option><option>Psicologia</option><option>História</option><option>Romance</option><option>Medicina</option><option>Autoajuda</option></select>
              </div>
              <button type="submit" className="w-full bg-stone-900 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-amber-600 transition-all shadow-xl">Salvar Registro</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}