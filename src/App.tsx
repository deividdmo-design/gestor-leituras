import { useState, useMemo, useEffect } from 'react'
import { useBooks } from './contexts/BookContext'
import { supabase } from './lib/supabase'
import { 
  Library, Plus, Trash2, CheckCircle2, 
  BookMarked, X, Pencil, Search, ArrowUpDown, Sparkles, Star, Trophy, Globe,
  Book, PieChart, LayoutGrid, Shuffle, Sparkle, Loader2, Tag, Calendar, StickyNote
} from 'lucide-react'

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

type BookStatus = 'Lendo' | 'Na Fila' | 'Concluído' | 'Abandonado';

export default function App() {
  const { books, refreshBooks } = useBooks()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isShuffleOpen, setIsShuffleOpen] = useState(false)
  const [isShuffling, setIsShuffling] = useState(false)
  const [editingBookId, setEditingBookId] = useState<string | null>(null)
  const [shuffledBook, setShuffledBook] = useState<any>(null)
  const [currentView, setCurrentView] = useState<'library' | 'analytics'>('library')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<BookStatus | 'Todos'>('Todos')
  const [sortBy, setSortBy] = useState<'recent' | 'rating'>('recent')
  const [readingGoal, setReadingGoal] = useState(24)

  const currentYear = new Date().getFullYear();
  const emptyForm = { title: '', author: '', author_nationality: '', publisher: '', total_pages: 0, read_pages: 0, cover_url: '', format: 'Físico', status: 'Na Fila' as BookStatus, rating: 0, finished_at: '', started_at: '', genre: 'Romance', notes: '' };
  const [formData, setFormData] = useState(emptyForm);

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
      setShuffledBook(queue[Math.floor(Math.random() * queue.length)]);
      counter++;
      if (counter > 12) { clearInterval(interval); setShuffledBook(queue[Math.floor(Math.random() * queue.length)]); setIsShuffling(false); }
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
        setFormData(prev => ({ ...prev, title: info.title || prev.title, author: info.authors?.join(', ') || '', total_pages: info.pageCount || 0, cover_url: info.imageLinks?.thumbnail?.replace('http:', 'https:') || '', }));
      }
    } catch (e) { console.error(e); }
  }

  const stats = useMemo(() => {
    const ratedBooks = books.filter(b => b.rating && b.rating > 0);
    const sumRatings = ratedBooks.reduce((acc, b) => acc + (b.rating || 0), 0);
    return {
      totalBooks: books.length,
      totalReadPages: books.reduce((acc, b) => acc + (b.read_pages || 0), 0),
      completedBooks: books.filter(b => b.status === 'Concluído').length,
      queueBooks: books.filter(b => b.status === 'Na Fila').length,
      averageRating: ratedBooks.length > 0 ? (sumRatings / ratedBooks.length).toFixed(1) : '0.0'
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
          <div className="bg-stone-900 p-2.5 rounded-xl text-amber-500 shadow-lg shadow-stone-200"><Library /></div>
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
          <div className="bg-white/40 backdrop-blur-sm p-5 rounded-3xl border border-white/60 shadow-sm flex flex-col items-center"><Book className="text-stone-400 mb-1"/><p className="text-xl font-black">{stats.totalBooks}</p><p className="text-[8px] text-stone-400 font-black uppercase tracking-widest">Total</p></div>
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
                return (
                  <div key={book.id} className="bg-white p-5 rounded-[2rem] border border-stone-100 flex gap-6 relative group shadow-sm hover:shadow-xl transition-all duration-300">
                    <div className="w-32 h-44 bg-stone-50 rounded-xl overflow-hidden shrink-0 shadow-inner border border-stone-100">{book.cover_url ? <img src={book.cover_url} className="w-full h-full object-cover" alt={book.title} /> : <div className="w-full h-full flex items-center justify-center bg-stone-50"><BookMarked className="text-stone-200 w-8 h-8"/></div>}</div>
                    <div className="flex-1 py-1 min-w-0">
                      <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border shadow-sm mb-2 block w-fit ${book.genre && genreColors[book.genre] ? genreColors[book.genre] : genreColors['Outros']}`}>{book.genre}</span>
                      <h3 className="font-black text-lg truncate text-stone-900 tracking-tight leading-tight">{book.title}</h3>
                      <p className="text-xs text-stone-400 font-bold flex items-center gap-2 mt-1 uppercase tracking-wider">{book.author_nationality ? (countryFlags[book.author_nationality.toLowerCase().trim()] || <Globe size={10}/>) : <Globe size={10}/>} {book.author}</p>
                      <div className="mt-5"><div className="flex justify-between text-[9px] font-black text-stone-400 mb-1 uppercase tracking-widest"><span>Progresso</span><span className={`${book.status === 'Lendo' ? 'text-amber-700' : ''}`}>{progress}%</span></div><div className="w-full bg-stone-50 h-1 rounded-full overflow-hidden"><div className={`h-full transition-all duration-700 ${book.status === 'Concluído' ? 'bg-stone-900' : 'bg-amber-600'}`} style={{ width: `${progress}%` }}></div></div></div>
                      <div className="flex gap-2 mt-4">
                        <span className={`text-[9px] font-black px-2 py-1 rounded uppercase tracking-widest ${book.status === 'Concluído' ? 'bg-stone-900 text-white' : 'bg-stone-50 text-stone-500'}`}>{book.status}</span>
                        {(book.rating || 0) > 0 && <div className="flex items-center gap-1 bg-amber-50 px-2 rounded text-amber-700 text-[9px] font-black"><Star size={10} className="fill-amber-500 text-amber-500"/> {book.rating}</div>}
                        {book.notes && <div className="flex items-center gap-1 bg-stone-100 px-2 rounded text-stone-500 text-[9px] font-black"><StickyNote size={10}/> NOTA</div>}
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
              <div className="w-full bg-stone-200/50 h-3 rounded-full overflow-hidden shadow-inner"><div className="bg-amber-500 h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min((analytics.totalLidosAno / readingGoal) * 100, 100)}%` }}></div></div>
            </div>
            <div className="bg-white/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/60 shadow-sm">
                <h2 className="text-[11px] font-black uppercase text-stone-900 mb-8 flex items-center gap-2 tracking-[0.2em] border-b border-stone-100 pb-4"><Calendar size={16} className="text-blue-500"/> Histórico Mensal</h2>
                <div className="flex items-end justify-between h-32 px-4 gap-2">
                  {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'].map((mes, i) => (
                    <div key={mes} className="flex flex-col items-center flex-1 group">
                      <div className="bg-blue-500 w-full rounded-t-lg transition-all duration-700 hover:bg-stone-900 relative" style={{ height: `${(analytics.mensal[i] / (Math.max(...analytics.mensal, 1))) * 100}%` }}>
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-[8px] font-black py-1 px-2 rounded opacity-0 group-hover:opacity-100">{analytics.mensal[i]}</div>
                      </div>
                      <span className="text-[9px] font-black uppercase text-stone-400 mt-2">{mes}</span>
                    </div>
                  ))}
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/60 shadow-sm">
                <h2 className="text-[11px] font-black uppercase text-stone-900 mb-8 flex items-center gap-2 border-b border-stone-100 pb-4"><Tag size={16}/> Ranking de Gêneros</h2>
                <div className="space-y-6">{analytics.topGeneros.map(([n, c]) => (<div key={n}><div className="flex justify-between items-center mb-2 font-black text-[10px] uppercase"><span>{n}</span><span className="text-stone-400">{c} Livros</span></div><div className="w-full bg-stone-950/5 h-2 rounded-full overflow-hidden shadow-inner"><div className={`h-full rounded-full transition-all duration-1000 ${genreBarColors[n] || 'bg-stone-900'}`} style={{ width: `${(c / (stats.totalBooks || 1)) * 100}%` }}></div></div></div>))}</div>
              </div>
              <div className="bg-white/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/60 shadow-sm">
                <h2 className="text-[11px] font-black uppercase text-stone-900 mb-8 flex items-center gap-2 border-b border-stone-100 pb-4"><Globe size={16}/> Nacionalidades</h2>
                <div className="grid grid-cols-1 gap-4">{analytics.topPaises.map(([n, c]) => (<div key={n} className="flex justify-between items-center bg-white/50 p-4 rounded-2xl border border-white/20 hover:bg-white/80 transition-all"><div className="flex items-center gap-3"><span className="text-2xl">{countryFlags[n] || '🏳️'}</span><span className="text-xs font-black uppercase tracking-widest text-stone-700">{n}</span></div><span className="bg-white px-3 py-1 rounded-full text-[10px] font-black shadow-sm border border-stone-100">{c}</span></div>))}</div>
              </div>
            </div>
          </div>
        )}
      </main>

      {isShuffleOpen && shuffledBook && (
        <div className="fixed inset-0 bg-stone-950/95 backdrop-blur-2xl flex items-center justify-center z-50 p-4 animate-in fade-in duration-500">
          <div className="bg-white/5 w-full max-w-lg rounded-[4rem] p-12 text-center relative overflow-hidden border border-white/10 shadow-2xl">
            <button onClick={() => setIsShuffleOpen(false)} className="absolute top-8 right-8 p-3 bg-white/5 text-white/40 rounded-full hover:bg-white/10 hover:text-white transition-all z-20"><X size={24}/></button>
            <div className="relative z-10 space-y-8">
              <div className="bg-amber-600/20 w-20 h-20 rounded-3xl mx-auto flex items-center justify-center mb-4 border border-amber-600/30">{isShuffling ? <Loader2 className="text-amber-500 w-10 h-10 animate-spin" /> : <Sparkles className="text-amber-500 w-10 h-10 animate-pulse" />}</div>
              <div className={`w-52 h-80 bg-stone-900 rounded-[2.5rem] mx-auto shadow-2xl overflow-hidden border-[6px] transition-all duration-700 ${isShuffling ? 'border-white/5 scale-95 blur-[2px]' : 'border-white/20 scale-105 shadow-amber-600/20'}`}>{shuffledBook.cover_url && <img src={shuffledBook.cover_url} className="w-full h-full object-cover" alt="Sorteio" />}</div>
              <div className={`transition-all duration-700 ${isShuffling ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}><h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-amber-500/60 mb-2">Destino Literário</h2><h3 className="text-2xl font-black text-white mb-2 leading-tight tracking-tight">{shuffledBook.title}</h3><p className="text-sm font-bold text-stone-400 uppercase tracking-widest">{shuffledBook.author}</p><div className="flex gap-4 mt-10"><button onClick={startReadingShuffled} className="flex-1 bg-white text-stone-950 py-5 rounded-2xl font-black uppercase shadow-2xl hover:bg-amber-500 transition-all">Aceitar</button><button onClick={handleShuffle} className="px-8 bg-white/5 text-white py-5 rounded-2xl font-black border border-white/10 hover:bg-white/10">Girar</button></div></div>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] p-8 max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-100">
            <div className="flex justify-between items-center mb-8 pb-6 border-b border-stone-50"><h2 className="text-lg font-black text-stone-900 uppercase tracking-[0.2em]">{editingBookId ? 'Editar Acervo' : 'Novo Registro'}</h2><button onClick={() => setIsModalOpen(false)} className="p-2 bg-stone-50 rounded-full hover:bg-stone-100 transition-colors"><X/></button></div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex gap-2"><input className="flex-1 bg-stone-50 rounded-2xl px-6 py-4 font-bold outline-none border-2 border-transparent focus:border-stone-200 transition-all" placeholder="Título" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required/><button type="button" onClick={searchGoogleBooks} className="bg-stone-900 text-amber-500 px-5 rounded-2xl hover:bg-stone-800 transition-colors"><Sparkles size={20}/></button></div>
              <div className="grid grid-cols-2 gap-4"><input className="bg-stone-50 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-stone-200 border-2 border-transparent" placeholder="Autor" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})}/><input className="bg-stone-50 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-stone-200 border-2 border-transparent" placeholder="País" value={formData.author_nationality} onChange={e => setFormData({...formData, author_nationality: e.target.value})}/></div>
              <div className="space-y-1"><label className="text-[10px] font-black text-stone-400 ml-2 uppercase tracking-widest">Link da Capa</label><input className="w-full bg-stone-50 rounded-2xl px-6 py-4 text-[11px] font-bold outline-none border-2 border-transparent focus:border-stone-200" placeholder="URL da imagem..." value={formData.cover_url} onChange={e => setFormData({ ...formData, cover_url: e.target.value })}/></div>
              <div className="space-y-1"><label className="text-[10px] font-black text-stone-400 ml-2 uppercase tracking-widest">Gênero Literário</label>
                <select className="w-full bg-stone-50 rounded-2xl px-6 py-4 text-sm font-bold outline-none appearance-none border-2 border-transparent focus:border-stone-200" value={formData.genre} onChange={e => setFormData({...formData, genre: e.target.value})}>
                  <option>Romance</option><option>História</option><option>Medicina</option><option>Psicologia</option><option>Filosofia</option><option>Não Ficção</option><option>Tecnologia & Computação</option><option>Autoajuda</option><option>Outros</option>
                </select>
              </div>
              <div className="space-y-1"><label className="text-[10px] font-black text-stone-400 ml-2 uppercase tracking-widest flex items-center gap-1"><StickyNote size={12}/> Anotações / Citações</label><textarea rows={3} className="w-full bg-stone-50 rounded-2xl px-6 py-4 text-xs font-bold outline-none border-2 border-transparent focus:border-stone-200 resize-none" placeholder=" Insights marcantes do livro..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}></textarea></div>
              <div className="grid grid-cols-2 gap-4"><input type="date" className="w-full bg-stone-50 rounded-2xl px-6 py-4 text-xs font-bold outline-none border-2 border-transparent focus:border-stone-200" value={formData.started_at} onChange={e => setFormData({...formData, started_at: e.target.value})}/><input type="date" className="w-full bg-stone-50 rounded-2xl px-6 py-4 text-xs font-bold outline-none border-2 border-transparent focus:border-stone-200" value={formData.finished_at} onChange={e => setFormData({...formData, finished_at: e.target.value})}/></div>
              <div className="grid grid-cols-2 gap-4"><select className="bg-stone-50 rounded-2xl px-6 py-4 text-sm font-bold outline-none appearance-none border-2 border-transparent focus:border-stone-200" value={formData.format} onChange={e => setFormData({...formData, format: e.target.value})}><option>Físico</option><option>E-book</option><option>Audiobook</option></select><select className="bg-stone-50 rounded-2xl px-6 py-4 text-sm font-bold outline-none appearance-none border-2 border-transparent focus:border-stone-200" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as BookStatus})}><option value="Na Fila">Na Fila</option><option value="Lendo">Lendo</option><option value="Concluído">Concluído</option><option value="Abandonado">Abandonado</option></select></div>
              <div className="grid grid-cols-2 gap-4"><input type="number" className="bg-stone-50 rounded-2xl px-6 py-4 font-bold outline-none border-2 border-transparent focus:border-stone-200" placeholder="Páginas" value={formData.total_pages} onChange={e => setFormData({...formData, total_pages: Number(e.target.value)})}/><input type="number" className="bg-stone-50 rounded-2xl px-6 py-4 font-bold outline-none border-2 border-transparent focus:border-stone-200" placeholder="Lidas" value={formData.read_pages} onChange={e => setFormData({...formData, read_pages: Number(e.target.value)})}/></div>
              <button type="submit" className="w-full bg-stone-950 text-white py-5 rounded-2xl font-black uppercase tracking-[0.3em] hover:bg-amber-700 transition-all shadow-2xl">Finalizar Cadastro</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}