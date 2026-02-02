import { useState, useMemo, useEffect } from 'react'
import { useBooks } from './contexts/BookContext'
import { supabase } from './lib/supabase'
import { 
  Library, Plus, Trash2, CheckCircle2, 
  BookMarked, X, Pencil, Search, ArrowUpDown, Sparkles, Star, Trophy, Globe,
  Book as BookIcon, PieChart, LayoutGrid, Shuffle, Sparkle, Loader2, Tag, Calendar, StickyNote
} from 'lucide-react'

// 🌍 RESTAURADO: MAPA-MÚNDI COMPLETO (120 BANDEIRAS)
const countryFlags: Record<string, string> = {
  'brasil': '🇧🇷', 'brasileira': '🇧🇷', 'argentina': '🇦🇷', 'chile': '🇨🇱', 'colombia': '🇨🇴', 'mexico': '🇲🇽', 'estados unidos': '🇺🇸', 'eua': '🇺🇸', 'canada': '🇨🇦', 'peru': '🇵🇪', 'uruguai': '🇺🇾', 'paraguai': '🇵🇾', 'bolivia': '🇧🇴', 'equador': '🇪🇨', 'venezuela': '🇻🇪', 'cuba': '🇨🇺', 'jamaica': '🇯🇲', 'haiti': '🇭🇹', 'republica dominicana': '🇩🇴', 'guatemala': '🇬🇹', 'honduras': '🇭🇳', 'el salvador': '🇸🇻', 'nicaragua': '🇳🇮', 'costa rica': '🇨🇷', 'panama': '🇵🇦', 'portugal': '🇵🇹', 'espanha': '🇪🇸', 'franca': '🇫🇷', 'italia': '🇮🇹', 'alemanha': '🇩🇪', 'reino unido': '🇬🇧', 'inglaterra': '🇬🇧', 'irlanda': '🇮🇪', 'russia': '🇷🇺', 'grecia': '🇬🇷', 'suica': '🇨🇭', 'austria': '🇦🇹', 'suecia': '🇸🇪', 'noruega': '🇳🇴', 'dinamarca': '🇩🇰', 'finlandia': '🇫🇮', 'polonia': '🇵🇱', 'belgica': '🇧🇪', 'holanda': '🇳🇱', 'paises baixos': '🇳🇱', 'ucrania': '🇺🇦', 'turquia': '🇹🇷', 'checa': '🇨🇿', 'hungria': '🇭🇺', 'romenia': '🇷🇴', 'bulgaria': '🇧🇬', 'croacia': '🇭🇷', 'servia': '🇷🇸', 'eslovaquia': '🇸🇰', 'eslovenia': '🇸🇮', 'estonia': '🇪🇪', 'letonia': '🇱🇻', 'lituania': '🇱🇹', 'islandia': '🇮🇸', 'luxemburgo': '🇱🇺', 'monaco': '🇲🇨', 'angola': '🇦🇴', 'mocambique': '🇲🇿', 'africa do sul': '🇿🇦', 'egito': '🇪🇬', 'nigeria': '🇳🇬', 'marrocos': '🇲🇦', 'argelia': '🇩🇿', 'quenia': '🇰🇪', 'etiopia': '🇪🇹', 'tanzania': '🇹🇿', 'mali': '🇲🇱', 'congo': '🇨🇩', 'gana': '🇬🇭', 'camaroes': '🇨🇲', 'costa do marfim': '🇨🇮', 'senegal': '🇸🇳', 'tunisia': '🇹🇳', 'madagascar': '🇲🇬', 'japao': '🇯🇵', 'china': '🇨🇳', 'coreia do sul': '🇰🇷', 'india': '🇮🇳', 'israel': '🇮🇱', 'palestina': '🇵🇸', 'iraque': '🇮🇶', 'ira': '🇮🇷', 'afeganistao': '🇦🇫', 'vietna': '🇻🇳', 'tailandia': '🇹🇭', 'indonesia': '🇮🇩', 'filipinas': '🇵🇭', 'malasia': '🇲🇾', 'singapura': '🇸🇬', 'paquistao': '🇵🇰', 'bangladesh': '🇧🇩', 'arabia saudita': '🇸🇦', 'emirados arabes': '🇦🇪', 'catar': '🇶🇦', 'libano': '🇱🇧', 'jordania': '🇯🇴', 'siria': '🇸🇾', 'australia': '🇦🇺', 'nova zelandia': '🇳🇿', 'timor leste': '🇹🇱', 'fiji': '🇫🇯', 'niger': '🇳🇪', 'chade': '🇹🇩', 'sudan': '🇸🇩', 'libia': '🇱🇾', 'somalia': '🇸🇴', 'zambia': '🇿🇲', 'zimbabue': '🇿🇼', 'namibia': '🇳🇦', 'botsuana': '🇧🇼', 'guiana': '🇬🇾', 'suriname': '🇸🇷'
};

const genreColors: Record<string, string> = {
  'História': 'bg-amber-100 text-amber-900 border-amber-200',
  'Medicina': 'bg-emerald-50 text-emerald-900 border-emerald-100',
  'Psicologia': 'bg-indigo-50 text-indigo-900 border-indigo-100',
  'Filosofia': 'bg-stone-800 text-stone-100 border-stone-600',
  'Romance': 'bg-rose-50 text-rose-800 border-rose-100',
  'Ficção': 'bg-stone-100 text-stone-700 border-stone-200',
  'Literatura Clássica': 'bg-amber-50 text-amber-800 border-amber-200',
  'Não Ficção': 'bg-slate-100 text-slate-700 border-slate-200',
  'Tecnologia & Computação': 'bg-slate-900 text-white border-slate-700',
  'Autoajuda': 'bg-zinc-700 text-zinc-100 border-zinc-600',
  'Outros': 'bg-stone-50 text-stone-500 border-stone-200'
};

const genreBarColors: Record<string, string> = {
    'História': 'bg-amber-600', 'Medicina': 'bg-emerald-600', 'Psicologia': 'bg-indigo-600',
    'Filosofia': 'bg-stone-800', 'Romance': 'bg-rose-600', 'Ficção': 'bg-stone-400',
    'Literatura Clássica': 'bg-amber-700', 'Não Ficção': 'bg-slate-600', 
    'Tecnologia & Computação': 'bg-slate-900', 'Autoajuda': 'bg-zinc-600'
};

// 🛠️ TIPO APPBOOK PARA EVITAR CONFLITO COM O CONTEXTO
interface AppBook {
  id: string;
  title: string;
  author: string;
  author_nationality?: string;
  total_pages: number;
  read_pages: number;
  cover_url?: string;
  genre?: string;
  status: 'Lendo' | 'Na Fila' | 'Concluído' | 'Abandonado';
  rating?: number;
  notes?: string;
  finished_at?: string;
  started_at?: string;
}

export default function App() {
  const { books, refreshBooks } = useBooks()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isShuffleOpen, setIsShuffleOpen] = useState(false)
  const [isShuffling, setIsShuffling] = useState(false)
  const [editingBookId, setEditingBookId] = useState<string | null>(null)
  const [shuffledBook, setShuffledBook] = useState<AppBook | null>(null)
  const [currentView, setCurrentView] = useState<'library' | 'analytics'>('library')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string | 'Todos'>('Todos')
  const [sortBy, setSortBy] = useState<'recent' | 'rating'>('recent')
  const [readingGoal, setReadingGoal] = useState(24)

  const currentYear = new Date().getFullYear();
  const emptyForm = { title: '', author: '', author_nationality: '', total_pages: 0, read_pages: 0, cover_url: '', status: 'Na Fila', rating: 0, genre: 'Romance', notes: '' };
  const [formData, setFormData] = useState<any>(emptyForm);

  // 🔄 PERSISTÊNCIA DA META
  useEffect(() => {
    async function loadSettings() {
      const { data } = await supabase.from('settings').select('reading_goal').eq('id', 'user_settings').single();
      if (data) setReadingGoal(data.reading_goal);
    }
    loadSettings();
  }, []);

  async function updateGoal(newGoal: number) {
    setReadingGoal(newGoal);
    await supabase.from('settings').update({ reading_goal: newGoal }).eq('id', 'user_settings');
  }

  async function handleShuffle() {
    const queue = books.filter(b => b.status === 'Na Fila');
    if (queue.length === 0) return alert('Sua fila está vazia!');
    setIsShuffleOpen(true); setIsShuffling(true);
    let counter = 0;
    const interval = setInterval(() => {
      setShuffledBook(queue[Math.floor(Math.random() * queue.length)] as any);
      counter++;
      if (counter > 12) { clearInterval(interval); setShuffledBook(queue[Math.floor(Math.random() * queue.length)] as any); setIsShuffling(false); }
    }, 120);
  }

  async function startReadingShuffled() {
    if (!shuffledBook) return;
    try {
      await supabase.from('books').update({ status: 'Lendo', started_at: new Date().toISOString().split('T')[0] }).eq('id', shuffledBook.id);
      setIsShuffleOpen(false); refreshBooks();
    } catch (e: any) { alert(e.message); }
  }

  async function searchGoogleBooks() {
    const query = formData.title.trim();
    if (!query) return;
    const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_KEY;
    try {
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${API_KEY}&maxResults=1`);
      const data = await response.json();
      if (data.items?.[0]) {
        const info = data.items[0].volumeInfo;
        setFormData((prev: any) => ({ ...prev, title: info.title || prev.title, author: info.authors?.join(', ') || '', total_pages: info.pageCount || 0, cover_url: info.imageLinks?.thumbnail?.replace('http:', 'https:') || '', }));
      }
    } catch (e) { console.error(e); }
  }

  const stats = useMemo(() => {
    const ratedBooks = books.filter(b => b.rating && b.rating > 0);
    return {
      totalBooks: books.length,
      totalReadPages: books.reduce((acc, b) => acc + (b.read_pages || 0), 0),
      completedBooks: books.filter(b => b.status === 'Concluído').length,
      queueBooks: books.filter(b => b.status === 'Na Fila').length,
      averageRating: ratedBooks.length > 0 ? (ratedBooks.reduce((acc, b) => acc + (b.rating || 0), 0) / ratedBooks.length).toFixed(1) : '0.0'
    };
  }, [books]);

  const analytics = useMemo(() => {
    const counters = { countries: {} as Record<string, number>, genres: {} as Record<string, number>, monthly: Array(12).fill(0) };
    let finishedThisYear = 0;
    books.forEach(b => {
      if (b.genre) counters.genres[b.genre] = (counters.genres[b.genre] || 0) + 1;
      if (b.author_nationality) {
        const nat = b.author_nationality.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        counters.countries[nat] = (counters.countries[nat] || 0) + 1;
      }
      if (b.status === 'Concluído' && b.finished_at) {
        const date = new Date(b.finished_at);
        if (date.getFullYear() === currentYear) { finishedThisYear++; counters.monthly[date.getMonth()]++; }
      }
    });
    return {
      totalLidosAno: finishedThisYear,
      mensal: counters.monthly,
      topGeneros: Object.entries(counters.genres).sort((a,b) => b[1] - a[1]).slice(0, 5),
      topPaises: Object.entries(counters.countries).sort((a,b) => b[1] - a[1]).slice(0, 5)
    };
  }, [books, currentYear]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = { ...formData, rating: editingBookId ? formData.rating : 0 };
      if (editingBookId) await supabase.from('books').update(payload).eq('id', editingBookId);
      else await supabase.from('books').insert([payload]);
      setFormData(emptyForm); setIsModalOpen(false); refreshBooks(); alert('✅ Salvo.');
    } catch (e: any) { alert('❌ Erro: ' + e.message); }
  }

  return (
    <div className="min-h-screen bg-[#F9F7F2] text-slate-900 font-sans tracking-tight">
      <header className="bg-white/80 backdrop-blur-md border-b border-stone-200 h-20 flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-stone-900 p-2.5 rounded-xl text-amber-500 shadow-lg"><Library /></div>
          <h1 className="text-xl font-black text-stone-900 tracking-widest uppercase hidden md:block">Estante Premium</h1>
        </div>
        <div className="flex bg-stone-100/50 p-1 rounded-xl">
          <button onClick={() => setCurrentView('library')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase transition-all ${currentView === 'library' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400'}`}><LayoutGrid className="w-4 h-4 inline mr-2"/> Biblioteca</button>
          <button onClick={() => setCurrentView('analytics')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase transition-all ${currentView === 'analytics' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400'}`}><PieChart className="w-4 h-4 inline mr-2"/> Relatórios</button>
        </div>
        <button onClick={() => { setEditingBookId(null); setFormData(emptyForm); setIsModalOpen(true); }} className="bg-stone-900 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-amber-700 transition-all shadow-xl shadow-stone-200"><Plus size={20}/> Novo</button>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white/40 backdrop-blur-sm p-5 rounded-3xl border border-white/60 shadow-sm flex flex-col items-center"><BookIcon className="text-stone-400 mb-1"/><p className="text-xl font-black">{stats.totalBooks}</p><p className="text-[8px] text-stone-400 font-black uppercase tracking-widest">Total</p></div>
          <div className="bg-white/40 backdrop-blur-sm p-5 rounded-3xl border border-white/60 shadow-sm flex flex-col items-center"><Trophy className="text-blue-600 mb-1"/><p className="text-xl font-black">{stats.totalReadPages.toLocaleString()}</p><p className="text-[8px] text-stone-400 font-black uppercase tracking-widest">Páginas</p></div>
          <div className="bg-white/40 backdrop-blur-sm p-5 rounded-3xl border border-white/60 shadow-sm flex flex-col items-center"><CheckCircle2 className="text-stone-900 mb-1"/><p className="text-xl font-black">{stats.completedBooks}</p><p className="text-[8px] text-stone-400 font-black uppercase tracking-widest">Lidos</p></div>
          <div className="bg-white/40 backdrop-blur-sm p-5 rounded-3xl border border-white/60 shadow-sm flex flex-col items-center"><Star className="text-amber-600 mb-1"/><p className="text-xl font-black">{stats.averageRating}</p><p className="text-[8px] text-stone-400 font-black uppercase tracking-widest">Média</p></div>
          <div className="bg-white/40 backdrop-blur-sm p-5 rounded-3xl border border-white/60 shadow-sm flex items-center justify-center"><Sparkle className="text-stone-300 w-8 h-8"/></div>
        </div>

        {currentView === 'library' ? (
          <>
            <div className="bg-white/60 backdrop-blur-md p-2 rounded-[1.5rem] border border-stone-200 flex flex-col lg:flex-row gap-2 shadow-sm">
              <div className="relative flex-1"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 w-5 h-5"/><input className="w-full pl-12 pr-4 bg-transparent font-bold outline-none text-stone-800 placeholder:text-stone-300" placeholder="Pesquisar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/></div>
              <div className="flex gap-2 p-1">
                {['Todos', 'Na Fila', 'Lendo', 'Concluído'].map((s) => (<button key={s} onClick={() => setFilterStatus(s as any)} className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === s ? 'bg-stone-900 text-white' : 'text-stone-400 hover:text-stone-600'}`}>{s}</button>))}
                <button onClick={handleShuffle} className="p-3 bg-stone-50/50 text-stone-900 rounded-xl hover:bg-stone-900 transition-all border border-stone-100"><Shuffle size={18}/></button>
                <div className="relative ml-1"><select className="appearance-none bg-stone-50/50 pl-4 pr-10 py-3 rounded-xl text-[10px] font-black uppercase text-stone-600 outline-none border border-stone-100" value={sortBy} onChange={e => setSortBy(e.target.value as any)}><option value="recent">Recentes</option><option value="rating">Melhores</option></select><ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-stone-400 pointer-events-none" /></div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-500">
              {books.filter(b => (b.title.toLowerCase().includes(searchTerm.toLowerCase()) || b.author.toLowerCase().includes(searchTerm.toLowerCase())) && (filterStatus === 'Todos' || b.status === filterStatus)).map(book => {
                const progress = Math.round(((book.read_pages || 0) / (book.total_pages || 1)) * 100);
                const typedBook = book as any as AppBook;
                return (
                  <div key={book.id} className="bg-white p-5 rounded-[2rem] border border-stone-100 flex gap-6 relative group shadow-sm hover:shadow-xl transition-all duration-300">
                    <div className="w-32 h-44 bg-stone-50 rounded-xl overflow-hidden shrink-0 shadow-inner border border-stone-100">{book.cover_url ? <img src={book.cover_url} className="w-full h-full object-cover" alt={book.title} /> : <div className="w-full h-full flex items-center justify-center bg-stone-50"><BookMarked className="text-stone-200 w-8 h-8"/></div>}</div>
                    <div className="flex-1 py-1 min-w-0">
                      <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border shadow-sm mb-2 block w-fit ${book.genre && genreColors[book.genre] ? genreColors[book.genre] : genreColors['Outros']}`}>{book.genre}</span>
                      <h3 className="font-black text-lg truncate text-stone-900 tracking-tight leading-tight">{book.title}</h3>
                      <p className="text-xs text-stone-400 font-bold flex items-center gap-2 mt-1 uppercase tracking-wider">
                          {book.author_nationality ? (countryFlags[book.author_nationality.toLowerCase().trim()] || <Globe size={10}/>) : <Globe size={10}/>} {book.author}
                      </p>
                      <div className="mt-5"><div className="flex justify-between text-[9px] font-black text-stone-400 mb-1 uppercase tracking-widest"><span>Progresso</span><span className={`${book.status === 'Lendo' ? 'text-amber-700' : ''}`}>{progress}%</span></div><div className="w-full bg-stone-50 h-1 rounded-full overflow-hidden"><div className={`h-full transition-all duration-700 ${book.status === 'Concluído' ? 'bg-stone-900' : 'bg-amber-600'}`} style={{ width: `${progress}%` }}></div></div></div>
                      <div className="flex gap-2 mt-4">
                        <span className={`text-[9px] font-black px-2 py-1 rounded uppercase tracking-widest ${book.status === 'Concluído' ? 'bg-stone-900 text-white' : 'bg-stone-50 text-stone-500'}`}>{book.status}</span>
                        {(book.rating || 0) > 0 && <div className="flex items-center gap-1 bg-amber-50 px-2 rounded text-amber-700 text-[9px] font-black"><Star size={10} className="fill-amber-500 text-amber-500"/> {book.rating}</div>}
                        {typedBook.notes && <div title={typedBook.notes} className="flex items-center gap-1 bg-stone-100 px-2 rounded text-stone-500 text-[9px] font-black"><StickyNote size={10}/> NOTA</div>}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all"><button onClick={() => { setEditingBookId(book.id); setFormData(book as any); setIsModalOpen(true); }} className="p-2 text-stone-300 hover:text-stone-900 bg-stone-50 rounded-lg"><Pencil size={14}/></button><button onClick={() => { if(confirm('Excluir?')) supabase.from('books').delete().eq('id', book.id).then(refreshBooks); }} className="p-2 text-stone-300 hover:text-red-800 bg-stone-50 rounded-lg"><Trash2 size={14}/></button></div>
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/60 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <div><h2 className="text-[11px] font-black uppercase text-amber-600 tracking-[0.3em]">Meta Anual {currentYear}</h2><p className="text-3xl font-black text-stone-900 tracking-tighter">{analytics.totalLidosAno} de {readingGoal} lidos</p></div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-stone-100 shadow-sm"><span className="text-[10px] font-black uppercase text-stone-400">Objetivo:</span><input type="number" value={readingGoal} onChange={e => updateGoal(Number(e.target.value))} className="w-12 bg-transparent font-black text-stone-900 outline-none text-center"/></div>
              </div>
              <div className="w-full bg-stone-200/50 h-3 rounded-full overflow-hidden shadow-inner"><div className="bg-amber-500 h-full rounded-full shadow-[0_0_15px_rgba(245,158,11,0.5)] transition-all duration-1000" style={{ width: `${Math.min((analytics.totalLidosAno / readingGoal) * 100, 100)}%` }}></div></div>
            </div>
            <div className="