import { useState, useMemo, useEffect } from 'react'
import { useBooks } from './contexts/BookContext'
import { supabase } from './lib/supabase'
import { 
  Library, Globe, Save, History, 
  PieChart, LayoutGrid, Quote, MessageSquare, PenTool, Clock, FileDown,
  BookMarked, StickyNote, X, Pencil, Trash2, Plus, Trophy, CheckCircle2,
  BarChart3, BookOpen, MapPin, Search, Shuffle, Sparkles, PlayCircle
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

const countryFlags: Record<string, string> = {
  'afeganistão': '🇦🇫', 'áfrica do sul': '🇿🇦', 'albânia': '🇦🇱', 'alemanha': '🇩🇪', 'andorra': '🇦🇩', 'angola': '🇦🇴', 'antígua e barbuda': '🇦🇬', 'arábia saudita': '🇸🇦', 'argélia': '🇩🇿', 'argentina': '🇦🇷', 'armênia': '🇦🇲', 'austrália': '🇦🇺', 'áustria': '🇦🇹', 'azerbaijão': '🇦🇿', 'bahamas': '🇧🇸', 'bahrein': '🇧🇭', 'bangladesh': '🇧🇩', 'barbados': '🇧🇧', 'bélgica': '🇧🇪', 'belize': '🇧🇿', 'benin': '🇧🇯', 'bielorrússia': '🇧🇾', 'bolívia': '🇧🇴', 'bósnia e herzegovina': '🇧🇦', 'botsuana': '🇧🇼', 'brasil': '🇧🇷', 'brasileira': '🇧🇷', 'brunei': '🇧🇳', 'bulgária': '🇧🇬', 'burkina faso': '🇧🇫', 'burundi': '🇧🇮', 'camboja': '🇰🇭', 'camarões': '🇨🇲', 'canadá': '🇨🇦', 'cabo verde': '🇨🇻', 'cazaquistão': '🇰🇿', 'chade': '🇹🇩', 'chile': '🇨🇱', 'china': '🇨🇳', 'chipre': '🇨🇾', 'colômbia': '🇨🇴', 'comores': '🇰🇲', 'congo': '🇨🇬', 'coreia do norte': '🇰🇵', 'coreia do sul': '🇰🇷', 'costa do marfim': '🇨🇮', 'costa rica': '🇨🇷', 'croácia': '🇭🇷', 'cuba': '🇨🇺', 'dinamarca': '🇩🇰', 'djibuti': '🇩🇯', 'dominica': '🇩🇲', 'egito': '🇪🇬', 'el salvador': '🇸🇻', 'emirados árabes unidos': '🇦🇪', 'equador': '🇪🇨', 'eritreia': '🇪🇷', 'eslováquia': '🇸🇰', 'eslovênia': '🇸🇮', 'espanha': '🇪🇸', 'estados unidos': '🇺🇸', 'eua': '🇺🇸', 'estônia': '🇪🇪', 'etiópia': '🇪🇹', 'fiji': '🇫🇯', 'filipinas': '🇵🇭', 'finlândia': '🇫🇮', 'frança': '🇫🇷', 'gabão': '🇬🇦', 'gâmbia': '🇬🇲', 'gana': '🇬🇭', 'geórgia': '🇬🇪', 'granada': '🇬🇩', 'grécia': '🇬🇷', 'guatemala': '🇬🇹', 'guiana': '🇬🇾', 'guiné': '🇬🇳', 'guiné-bissau': '🇬🇼', 'guiné equatorial': '🇬🇶', 'haiti': '🇭🇹', 'honduras': '🇭🇳', 'hungria': '🇭🇺', 'iêmen': '🇾🇪', 'índia': '🇮🇳', 'indonésia': '🇮🇩', 'irã': '🇮🇷', 'iraque': '🇮🇶', 'irlanda': '🇮🇪', 'islândia': '🇮🇸', 'israel': '🇮🇱', 'itália': '🇮🇹', 'jamaica': '🇯🇲', 'japão': '🇯🇵', 'jordânia': '🇯🇴', 'kuwait': '🇰🇼', 'laos': '🇱🇦', 'lesoto': '🇱🇸', 'letônia': '🇱🇻', 'líbano': '🇱🇧', 'libéria': '🇱🇷', 'líbia': '🇱🇾', 'liechtenstein': '🇱🇮', 'lituânia': '🇱🇹', 'luxemburgo': '🇱🇺', 'macedônia do norte': '🇲🇰', 'madagascar': '🇲🇬', 'malásia': '🇲🇾', 'malaui': '🇲🇼', 'maldivas': '🇲🇻', 'mali': '🇲🇱', 'malta': '🇲🇹', 'marrocos': '🇲🇦', 'maurício': '🇲🇺', 'mauritânia': '🇲🇷', 'méxico': '🇲🇽', 'mianmar': '🇲🇲', 'moçambique': '🇲🇿', 'moldávia': '🇲🇩', 'mônaco': '🇲🇨', 'mongólia': '🇲🇳', 'montenegro': '🇲🇪', 'namíbia': '🇳🇦', 'nauru': '🇳🇷', 'nepal': '🇳🇵', 'nicarágua': '🇳🇮', 'níger': '🇳🇪', 'nigéria': '🇳🇬', 'noruega': '🇳🇴', 'nova zelândia': '🇳🇿', 'omã': '🇴🇲', 'países baixos': '🇳🇱', 'panamá': '🇵🇦', 'paquistão': '🇵🇰', 'paraguai': '🇵🇾', 'peru': '🇵🇪', 'polônia': '🇵🇱', 'portugal': '🇵🇹', 'qatar': '🇶🇦', 'quênia': '🇰🇪', 'reino unido': '🇬🇧', 'inglaterra': '🇬🇧', 'república dominicana': '🇩🇴', 'república tcheca': '🇨🇿', 'romênia': '🇷🇴', 'ruanda': '🇷🇼', 'rússia': '🇷🇺', 'samoa': '🇼🇸', 'senegal': '🇸🇳', 'sérvia': '🇷🇸', 'singapura': '🇸🇬', 'síria': '🇸🇾', 'somália': '🇸🇴', 'sri lanka': '🇱🇰', 'sudão': '🇸🇩', 'suécia': '🇸🇪', 'suíça': '🇨🇭', 'suriname': '🇸🇷', 'tailândia': '🇹🇭', 'tanzânia': '🇹🇿', 'timor-leste': '🇹🇱', 'togo': '🇹🇬', 'tunísia': '🇹🇳', 'turquia': '🇹🇷', 'ucrânia': '🇺🇦', 'uganda': '🇺🇬', 'uruguai': '🇺🇾', 'uzbequistão': '🇺🇿', 'vaticano': '🇻🇦', 'venezuela': '🇻🇪', 'vietnã': '🇻🇳', 'zâmbia': '🇿🇲', 'zimbábue': '🇿🇼'
};

const genreStructure: Record<string, string[]> = {
  '1. Narrativos (Ficção)': ['Romance', 'Romance realista', 'Romance psicológico', 'Romance histórico', 'Novela', 'Conto', 'Microconto'],
  '2. Ficção Especulativa': ['Fantasia', 'Ficção Científica', 'Distopia', 'Cyberpunk', 'Realismo mágico'],
  '3. Terror e Suspense': ['Terror psicológico', 'Terror sobrenatural', 'Horror gótico', 'Suspense'],
  '4. Policial': ['Romance policial', 'Investigativo', 'Espionagem', 'Thriller'],
  '5. Romance e Drama': ['Romance romântico', 'Contemporâneo', 'Romance de época', 'Tragédia', 'YA'],
  '6. Dramáticos (Teatro)': ['Tragédia', 'Comédia', 'Drama', 'Teatro do absurdo'],
  '7. Poesia': ['Lírica', 'Épica', 'Soneto', 'Verso livre', 'Poesia visual'],
  '8. Não Ficção Literária': ['Biografia', 'Autobiografia', 'Memórias', 'Diário', 'Jornalismo literário'],
  '9. Híbridos': ['Autoficção', 'Metaficção', 'Graphic Novel'],
  '10. Infantil e Juvenil': ['Literatura infantil', 'Fábulas', 'Infantojuvenil'],
  '11. Filosofia': ['Filosofia Antiga', 'Filosofia Medieval', 'Filosofia Moderna', 'Filosofia Contemporânea', 'Ética', 'Existencialismo'],
  '12. Sociologia': ['Sociologia Clássica', 'Teoria Social', 'Sociologia Política', 'Sociologia da Cultura'],
  '13. Economia': ['Economia Política', 'Macroeconomia', 'História Econômica', 'Investimentos'],
  '14. Política': ['Teoria Política', 'Geopolítica', 'Relações Internacionais', 'Democracia'],
  '15. Antropologia': ['Antropologia Cultural', 'Etnografia', 'Arqueologia'],
  '16. História': ['História do Brasil', 'História Antiga', 'História Medieval', 'História Moderna', 'História Contemporânea'],
  '17. Psicologia': ['Psicologia Social', 'Psicologia Cognitiva', 'Psicanálise', 'Neurociência'],
  '18. Direito': ['Teoria do Direito', 'Filosofia do Direito', 'Direito Constitucional', 'Criminologia'],
  '19. Educação e Ciência': ['Pedagogia', 'Metodologia Científica', 'Divulgação Científica']
};

const getGenreStyle = (genre: string): string => {
  if (!genre) return 'bg-stone-100 text-stone-500 border-stone-200';
  if (genreStructure['11. Filosofia'].includes(genre)) return 'bg-stone-200 text-stone-800 border-stone-400';
  if (genreStructure['16. História'].includes(genre)) return 'bg-yellow-100 text-yellow-900 border-yellow-200';
  if (genreStructure['18. Direito'].includes(genre)) return 'bg-red-50 text-red-900 border-red-200';
  return 'bg-stone-50 text-stone-500 border-stone-200';
};

export default function App() {
  const { books, refreshBooks } = useBooks()
  const [currentView, setCurrentView] = useState<'library' | 'analytics' | 'insights'>('library')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isShuffleOpen, setIsShuffleOpen] = useState(false)
  const [editingBookId, setEditingBookId] = useState<string | null>(null)
  const [selectedBookId, setSelectedBookId] = useState<string>('')
  const [readingGoal, setReadingGoal] = useState(30)
  const [currentEntry, setCurrentEntry] = useState({ quote: '', reflection: '' })
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null)
  const [isShuffling, setIsShuffling] = useState(false)
  const [shuffledBook, setShuffledBook] = useState<AppBook | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string | 'Todos'>('Todos')

  const emptyForm = { title: '', author: '', author_nationality: '', total_pages: 0, read_pages: 0, cover_url: '', status: 'Na Fila' as BookStatus, genre: 'Outros' };
  const [formData, setFormData] = useState<any>(emptyForm);

  const activeInsightBook = useMemo(() => books.find(b => b.id === selectedBookId) as AppBook | undefined, [selectedBookId, books])
  
  const history: Marginalia[] = useMemo(() => {
    if (!activeInsightBook?.notes) return [];
    try { const parsed = JSON.parse(activeInsightBook.notes); return Array.isArray(parsed) ? parsed : []; } catch (e) { return []; }
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
      newHistory = newHistory.map(en => en.id === editingEntryId ? { ...en, quote: currentEntry.quote, reflection: currentEntry.reflection } : en);
    } else {
      newHistory = [{ id: crypto.randomUUID(), date: new Date().toLocaleDateString('pt-BR'), quote: currentEntry.quote, reflection: currentEntry.reflection }, ...newHistory];
    }
    await supabase.from('books').update({ notes: JSON.stringify(newHistory) }).eq('id', selectedBookId);
    setCurrentEntry({ quote: '', reflection: '' }); setEditingEntryId(null); refreshBooks();
  }

  async function handleDeleteEntry(entryId: string) {
    if (!selectedBookId || !confirm('Excluir esta anotação?')) return;
    const newHistory = history.filter(en => en.id !== entryId);
    await supabase.from('books').update({ notes: JSON.stringify(newHistory) }).eq('id', selectedBookId);
    if (editingEntryId === entryId) { setCurrentEntry({ quote: '', reflection: '' }); setEditingEntryId(null); }
    refreshBooks();
  }

  function loadEntryForEdit(entry: Marginalia) {
    setCurrentEntry({ quote: entry.quote, reflection: entry.reflection });
    setEditingEntryId(entry.id);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingBookId) await supabase.from('books').update(formData).eq('id', editingBookId);
      else await supabase.from('books').insert([formData]);
      setFormData(emptyForm); setIsModalOpen(false); refreshBooks();
    } catch (e: any) { alert(e.message); }
  }

  function handleShuffle() {
    const queue = books.filter(b => b.status === 'Na Fila');
    if (queue.length === 0) return alert('Sua fila está vazia!');
    setIsShuffleOpen(true); setIsShuffling(true);
    let counter = 0;
    const interval = setInterval(() => {
      const random = queue[Math.floor(Math.random() * queue.length)];
      setShuffledBook(random as any);
      counter++;
      if (counter > 20) { clearInterval(interval); setIsShuffling(false); }
    }, 80);
  }

  async function startReadingShuffled() {
    if (!shuffledBook) return;
    await supabase.from('books').update({ status: 'Lendo' }).eq('id', shuffledBook.id);
    await refreshBooks(); setIsShuffleOpen(false); setSelectedBookId(shuffledBook.id); setCurrentView('insights');
  }

  const analytics = useMemo(() => {
    const finished = books.filter(b => b.status === 'Concluído');
    const totalPages = books.reduce((acc, b) => acc + (b.read_pages || 0), 0);
    const nations: Record<string, number> = {};
    books.forEach(b => { if(b.author_nationality) { const nat = b.author_nationality.toLowerCase().trim(); nations[nat] = (nations[nat] || 0) + 1; } });
    const sortedNations = Object.entries(nations).sort((a,b) => b[1] - a[1]).slice(0, 6);
    const avgPages = finished.length > 0 ? Math.round(finished.reduce((acc, b) => acc + (b.total_pages || 0), 0) / finished.length) : 0;
    return { totalBooks: books.length, completed: finished.length, totalPages, avgPages, sortedNations };
  }, [books]);

  return (
    <div className="min-h-screen bg-[#F9F7F2] text-slate-900 print:bg-white">
      <header className="bg-white/80 backdrop-blur-md border-b border-stone-200 h-20 flex items-center justify-between px-6 sticky top-0 z-40 print:hidden">
        <div className="flex items-center gap-3">
          <div className="bg-stone-900 p-2.5 rounded-xl text-amber-500 shadow-lg"><Library /></div>
          <h1 className="text-xl font-black uppercase tracking-widest hidden md:block">Estante Premium</h1>
        </div>
        <div className="flex bg-stone-100/50 p-1 rounded-xl">
          <button onClick={() => setCurrentView('library')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${currentView === 'library' ? 'bg-white shadow-sm' : 'text-stone-400'}`}><LayoutGrid size={14} className="inline mr-1"/> Biblioteca</button>
          <button onClick={() => setCurrentView('insights')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${currentView === 'insights' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-400'}`}><PenTool size={14} className="inline mr-1"/> Insights</button>
          <button onClick={() => setCurrentView('analytics')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${currentView === 'analytics' ? 'bg-white shadow-sm' : 'text-stone-400'}`}><PieChart size={14} className="inline mr-1"/> Relatórios</button>
        </div>
        <button onClick={() => { setEditingBookId(null); setFormData(emptyForm); setIsModalOpen(true); }} className="bg-stone-900 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-amber-700 shadow-lg active:scale-95 transition-all"><Plus size={20}/> Novo</button>
      </header>

      <main className="max-w-[1600px] mx-auto p-6 space-y-8 print:p-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:hidden">
          <div className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm flex flex-col items-center justify-center"><Library className="text-stone-300 mb-2 w-6 h-6"/><p className="text-2xl font-black text-stone-900">{analytics.totalBooks}</p><p className="text-[9px] font-black uppercase text-stone-400 tracking-widest">Acervo</p></div>
          <div className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm flex flex-col items-center justify-center"><Trophy className="text-amber-400 mb-2 w-6 h-6"/><p className="text-2xl font-black text-stone-900">{analytics.totalPages.toLocaleString()}</p><p className="text-[9px] font-black uppercase text-stone-400 tracking-widest">Páginas</p></div>
          <div className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm flex flex-col items-center justify-center"><CheckCircle2 className="text-stone-900 mb-2 w-6 h-6"/><p className="text-2xl font-black text-stone-900">{analytics.completed}</p><p className="text-[9px] font-black uppercase text-stone-400 tracking-widest">Lidos</p></div>
        </div>

        {currentView === 'library' && (
          <>
            <div className="bg-white/60 backdrop-blur-md p-2 rounded-[1.5rem] border border-stone-200 flex flex-col lg:flex-row gap-2 shadow-sm animate-in fade-in duration-500">
              <div className="relative flex-1"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 w-5 h-5"/><input className="w-full pl-12 pr-4 bg-transparent font-bold outline-none text-stone-800 placeholder:text-stone-300 h-full py-3 text-sm" placeholder="Pesquisar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/></div>
              <div className="flex gap-2 p-1 overflow-x-auto">
                {['Todos', 'Na Fila', 'Lendo', 'Concluído'].map((s) => (<button key={s} onClick={() => setFilterStatus(s as any)} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${filterStatus === s ? 'bg-stone-900 text-white shadow-md' : 'text-stone-400 hover:bg-white hover:shadow-sm'}`}>{s}</button>))}
                <button onClick={handleShuffle} className="p-3 bg-stone-100 text-stone-500 rounded-xl hover:bg-amber-500 hover:text-white transition-all shadow-sm"><Shuffle size={18}/></button>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
              {books.filter(b => (b.title.toLowerCase().includes(searchTerm.toLowerCase()) || b.author.toLowerCase().includes(searchTerm.toLowerCase())) && (filterStatus === 'Todos' || b.status === filterStatus)).map(book => {
                const typedBook = book as any as AppBook;
                const progress = Math.round(((typedBook.read_pages || 0) / (typedBook.total_pages || 1)) * 100);
                return (
                  <div key={typedBook.id} className="bg-white p-6 rounded-[2.5rem] border border-stone-100 flex gap-6 group hover:shadow-xl transition-all relative overflow-hidden">
                    <div className="w-32 h-44 bg-stone-50 rounded-2xl overflow-hidden shrink-0 shadow-inner border border-stone-100">{typedBook.cover_url ? <img src={typedBook.cover_url} className="w-full h-full object-cover" alt={typedBook.title} /> : <div className="w-full h-full flex items-center justify-center text-stone-200"><BookMarked size={32}/></div>}</div>
                    <div className="flex-1 py-1">
                      <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-md border mb-3 block w-fit ${getGenreStyle(typedBook.genre || '')}`}>{typedBook.genre}</span>
                      <h3 className="font-black text-lg text-stone-900 leading-tight mb-1">{typedBook.title}</h3>
                      <p className="text-xs text-stone-400 font-bold uppercase flex items-center gap-1">{typedBook.author_nationality ? (countryFlags[typedBook.author_nationality.toLowerCase().trim()] || <Globe size={10}/>) : <Globe size={10}/>} {typedBook.author}</p>
                      <div className="mt-6"><div className="flex justify-between text-[9px] font-black text-stone-400 mb-1.5 uppercase tracking-widest"><span>Progresso</span><span className="text-amber-600">{progress}%</span></div><div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden shadow-inner"><div className="bg-amber-500 h-full transition-all duration-1000" style={{ width: `${progress}%` }}></div></div></div>
                      <div className="mt-5 flex gap-2"><span className="text-[9px] font-black px-3 py-1 rounded-lg bg-stone-50 text-stone-500 uppercase">{typedBook.status}</span>{typedBook.notes && <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-lg text-[9px] font-black flex items-center gap-1 shadow-sm uppercase"><StickyNote size={10}/> Nota</div>}</div>
                    </div>
                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => { setEditingBookId(typedBook.id); setFormData(typedBook); setIsModalOpen(true); }} className="p-2.5 text-stone-300 hover:text-stone-900 bg-stone-50 rounded-xl transition-all"><Pencil size={16}/></button>
                      <button onClick={() => { if(confirm('Excluir este livro?')) supabase.from('books').delete().eq('id', typedBook.id).then(refreshBooks); }} className="p-2.5 text-stone-300 hover:text-red-600 bg-stone-50 rounded-xl transition-all"><Trash2 size={16}/></button>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {currentView === 'insights' && (
          <div className="space-y-6 animate-in slide-in-from-right duration-500">
            <div className="bg-white p-6 rounded-[2rem] border border-stone-200 flex items-center gap-4 print:hidden shadow-sm">
              <select className="flex-1 bg-stone-50 border-none rounded-2xl p-4 font-black text-stone-800 outline-none cursor-pointer appearance-none" value={selectedBookId} onChange={(e) => { setSelectedBookId(e.target.value); setEditingEntryId(null); setCurrentEntry({quote:'', reflection:''}); }}>
                <option value="">Selecione o livro...</option>
                {readingBooks.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
              </select>
              {activeInsightBook && (
                <>
                   <button onClick={handleSaveEntry} className={`px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 transition-all shadow-lg active:scale-95 ${editingEntryId ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-stone-900 hover:bg-stone-800 text-white'}`}><Save size={18}/> {editingEntryId ? 'Atualizar Nota' : 'Salvar Insight'}</button>
                   <button onClick={() => window.print()} className="bg-stone-100 text-stone-600 px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-stone-200 transition-all shadow-sm active:scale-95"><FileDown size={18}/> PDF</button>
                </>
              )}
            </div>
            {activeInsightBook && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 bg-white rounded-[3rem] border border-stone-200 overflow-hidden shadow-2xl min-h-[600px] relative print:shadow-none print:border-none print:block">
                  <div className="p-10 border-r border-stone-100 space-y-6 bg-[#FDFCFB] print:bg-white print:p-0 print:mb-10 print:border-none">
                    <div className="flex items-center gap-3 text-amber-600 print:text-black"><Quote size={24} /><span className="text-[11px] font-black uppercase tracking-[0.4em]">Passagem da Obra</span></div>
                    <textarea className="w-full h-[450px] bg-transparent text-xl font-serif italic text-stone-700 outline-none resize-none leading-relaxed print:h-auto print:text-black" placeholder="Citação..." value={currentEntry.quote} onChange={e => setCurrentEntry({...currentEntry, quote: e.target.value})} />
                  </div>
                  <div className="p-10 space-y-6 bg-white print:p-0">
                    <div className="flex items-center gap-3 text-blue-600 print:text-black"><MessageSquare size={24} /><span className="text-[11px] font-black uppercase tracking-[0.4em]">Sua Reflexão</span></div>
                    <textarea className="w-full h-[450px] bg-transparent text-xl font-bold text-stone-900 outline-none resize-none leading-relaxed print:h-auto print:text-black print:font-normal" placeholder="Insights..." value={currentEntry.reflection} onChange={e => setCurrentEntry({...currentEntry, reflection: e.target.value})} />
                  </div>
                </div>
                <div className="lg:col-span-4 space-y-4 print:hidden">
                  <div className="flex items-center justify-between px-4"><div className="flex items-center gap-2 font-black uppercase text-[10px] text-stone-400"><History size={16}/> Histórico</div>{editingEntryId && <button onClick={() => { setEditingEntryId(null); setCurrentEntry({quote:'', reflection:''}) }} className="text-[9px] font-bold text-red-500 uppercase hover:underline">Cancelar</button>}</div>
                  <div className="space-y-3 max-h-[650px] overflow-y-auto pr-2 custom-scrollbar">
                    {history.map((entry) => (
                      <div key={entry.id} className={`w-full text-left p-5 rounded-[2rem] border transition-all relative group ${editingEntryId === entry.id ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-100' : 'bg-white border-stone-100 hover:border-stone-300'}`}>
                        <div className="flex justify-between items-start mb-3">
                           <div className="flex items-center gap-2 text-[9px] font-black text-stone-400"><Clock size={12}/> {entry.date}</div>
                           <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={(e) => { e.stopPropagation(); loadEntryForEdit(entry); }} className="p-1.5 bg-stone-100 text-stone-500 rounded-lg hover:bg-amber-500 transition-colors"><Pencil size={12}/></button>
                              <button onClick={(e) => { e.stopPropagation(); handleDeleteEntry(entry.id); }} className="p-1.5 bg-stone-100 text-stone-500 rounded-lg hover:bg-red-500 transition-colors"><Trash2 size={12}/></button>
                           </div>
                        </div>
                        <div onClick={() => loadEntryForEdit(entry)} className="cursor-pointer"><p className="text-sm font-serif italic text-stone-600 line-clamp-2 mb-2">"{entry.quote}"</p><p className="text-xs font-bold text-stone-900 line-clamp-2">{entry.reflection}</p></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {currentView === 'analytics' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4">
            <div className="bg-white p-12 rounded-[3rem] border border-stone-100 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-[11px] font-black uppercase text-amber-600 tracking-[0.3em]">Reading Challenge 2026</h2>
                <div className="flex items-center gap-2 text-stone-400 text-xs font-bold"><Trophy size={14} className="text-amber-500"/> Meta: {readingGoal}</div>
              </div>
              <div className="w-full bg-stone-50 h-5 rounded-full overflow-hidden shadow-inner border border-stone-100"><div className="bg-amber-500 h-full transition-all duration-1000 shadow-[0_0_20px_rgba(245,158,11,0.5)]" style={{ width: `${Math.min((analytics.completed/readingGoal)*100, 100)}%` }}></div></div>
              <p className="text-4xl font-black mt-8 text-stone-900 tracking-tighter">{analytics.completed} <span className="text-stone-300 text-xl font-bold">de {readingGoal} lidos</span></p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-8 text-stone-900"><BarChart3 size={20}/><h3 className="font-black uppercase tracking-widest text-xs">Nacionalidades</h3></div>
                    <div className="grid grid-cols-1 gap-3">
                        {analytics.sortedNations.map(([nation, count]) => (
                            <div key={nation} className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-100"><div className="flex items-center gap-3"><span className="text-xl">{countryFlags[nation] || '🏳️'}</span><span className="text-[10px] font-black uppercase text-stone-600">{nation}</span></div><span className="text-[10px] font-black bg-white px-2 py-1 rounded-lg shadow-sm text-stone-900">{count}</span></div>
                        ))}
                    </div>
                </div>
                <div className="bg-stone-900 text-white p-8 rounded-[2.5rem] shadow-xl flex flex-col justify-between min-h-[300px]">
                    <div><div className="flex items-center gap-3 mb-8 text-white/50"><BookOpen size={20}/><h3 className="font-black uppercase tracking-widest text-xs">Performance</h3></div><div className="space-y-6"><div><p className="text-[9px] font-black uppercase text-white/40 mb-1">Média de Páginas</p><p className="text-3xl font-black">{analytics.avgPages}</p></div></div></div>
                </div>
            </div>
          </div>
        )}
      </main>

      {isShuffleOpen && (
        <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-500">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 text-center shadow-2xl relative overflow-hidden">
            <button onClick={() => setIsShuffleOpen(false)} className="absolute top-6 right-6 p-2 bg-stone-100 rounded-full hover:bg-stone-200"><X size={20}/></button>
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-stone-400 mb-6">{isShuffling ? 'EMBARALHANDO...' : 'O DESTINO ESCOLHEU'}</h2>
            <div className="flex justify-center mb-6">
                {shuffledBook ? (
                    <div className="w-48 h-72 bg-stone-50 rounded-2xl shadow-xl overflow-hidden border-4 border-stone-100 transform transition-transform hover:scale-105">
                       {shuffledBook.cover_url ? <img src={shuffledBook.cover_url} className="w-full h-full object-cover" alt={shuffledBook.title}/> : <div className="w-full h-full flex items-center justify-center text-stone-300"><BookMarked size={40}/></div>}
                    </div>
                ) : <div className="p-10 bg-amber-50 rounded-full animate-spin"><Sparkles className="text-amber-500" size={40}/></div>}
            </div>
            {shuffledBook && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h3 className="text-2xl font-black text-stone-900 leading-tight mb-2 line-clamp-2">{shuffledBook.title}</h3>
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-8">{shuffledBook.author}</p>
                    {!isShuffling && <button onClick={startReadingShuffled} className="w-full bg-stone-900 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-amber-600 transition-all shadow-xl active:scale-95"><PlayCircle size={20} /> INICIAR LEITURA</button>}
                </div>
            )}
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 print:hidden animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] p-8 shadow-2xl overflow-y-auto max-h-[90vh] border border-stone-100">
            <div className="flex justify-between items-center mb-6 pb-6 border-b border-stone-50"><h2 className="font-black uppercase tracking-widest text-stone-900">{editingBookId ? 'Editar Obra' : 'Nova Obra'}</h2><button onClick={() => setIsModalOpen(false)} className="p-2 bg-stone-50 rounded-full hover:bg-stone-100"><X/></button></div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input className="w-full bg-stone-50 rounded-2xl px-6 py-4 font-bold outline-none border-2 border-transparent focus:border-stone-100 transition-all shadow-sm" placeholder="Título" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required/>
              <div className="grid grid-cols-2 gap-4"><input className="bg-stone-50 rounded-2xl px-6 py-4 text-sm font-bold outline-none" placeholder="Autor" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})}/><input className="bg-stone-50 rounded-2xl px-6 py-4 text-sm font-bold outline-none" placeholder="País" value={formData.author_nationality} onChange={e => setFormData({...formData, author_nationality: e.target.value})}/></div>
              <input className="w-full bg-stone-50 rounded-2xl px-6 py-4 text-xs font-bold outline-none" placeholder="URL da Capa" value={formData.cover_url} onChange={e => setFormData({...formData, cover_url: e.target.value})}/>
              <div className="grid grid-cols-2 gap-4"><input type="number" className="bg-stone-50 rounded-2xl px-6 py-4 font-bold outline-none" placeholder="Páginas" value={formData.total_pages} onChange={e => setFormData({...formData, total_pages: Number(e.target.value)})}/><input type="number" className="bg-stone-50 rounded-2xl px-6 py-4 font-bold outline-none" placeholder="Lidas" value={formData.read_pages} onChange={e => setFormData({...formData, read_pages: Number(e.target.value)})}/></div>
              <div className="grid grid-cols-2 gap-4">
                <select className="bg-stone-50 rounded-2xl px-6 py-4 font-bold outline-none appearance-none cursor-pointer" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}><option value="Na Fila">Na Fila</option><option value="Lendo">Lendo</option><option value="Concluído">Concluído</option><option value="Abandonado">Abandonado</option></select>
                <select className="bg-stone-50 rounded-2xl px-6 py-4 font-bold outline-none appearance-none cursor-pointer text-sm" value={formData.genre} onChange={e => setFormData({...formData, genre: e.target.value})}>
                  <option value="Outros">Selecione o Gênero</option>
                  {Object.entries(genreStructure).map(([category, subgenres]) => (
                    <optgroup key={category} label={category}>{subgenres.map(sub => <option key={sub} value={sub}>{sub}</option>)}</optgroup>
                  ))}
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