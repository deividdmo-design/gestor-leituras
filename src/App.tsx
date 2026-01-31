import { useState, useMemo } from 'react'
import { useBooks } from './contexts/BookContext'
import { supabase } from './lib/supabase'
import { 
  Library, Plus, Trash2, CheckCircle2, 
  BookMarked, X, Pencil, Search, ArrowUpDown, Sparkles, Star, Trophy, Globe, Link as LinkIcon, Image as ImageIcon,
  Layers, Book, PlayCircle, StopCircle, Timer, Award, PieChart, LayoutGrid, Calendar, User, Hash, Monitor, Tag, Shuffle, Sparkle
} from 'lucide-react'

const countryFlags: Record<string, string> = {
  'brasil': '🇧🇷', 'brasileira': '🇧🇷', 'argentina': '🇦🇷', 'chile': '🇨🇱', 'colombia': '🇨🇴',
  'mexico': '🇲🇽', 'estados unidos': '🇺🇸', 'eua': '🇺🇸', 'canada': '🇨🇦', 'peru': '🇵🇪',
  'uruguai': '🇺🇾', 'paraguai': '🇵🇾', 'bolivia': '🇧🇴', 'equador': '🇪🇨', 'venezuela': '🇻🇪',
  'cuba': '🇨🇺', 'jamaica': '🇯🇲', 'haiti': '🇭🇹', 'republica dominicana': '🇩🇴',
  'portugal': '🇵🇹', 'espanha': '🇪🇸', 'franca': '🇫🇷', 'italia': '🇮🇹', 'alemanha': '🇩🇪',
  'reino unido': '🇬🇧', 'inglaterra': '🇬🇧', 'irlanda': '🇮🇪', 'russia': '🇷🇺', 'grecia': '🇬🇷',
  'suica': '🇨🇭', 'austria': '🇦🇹', 'suecia': '🇸🇪', 'noruega': '🇳🇴', 'dinamarca': '🇩🇰',
  'finlandia': '🇫🇮', 'polonia': '🇵🇱', 'belgica': '🇧🇪', 'holanda': '🇳🇱', 'paises baixos': '🇳🇱',
  'ucrania': '🇺🇦', 'turquia': '🇹🇷', 'checa': '🇨🇿', 'hungria': '🇭🇺', 'romenia': '🇷🇴',
  'angola': '🇦🇴', 'mocambique': '🇲🇿', 'africa do sul': '🇿🇦', 'egito': '🇪🇬', 'nigeria': '🇳🇬',
  'marrocos': '🇲🇦', 'argelia': '🇩🇿', 'quenia': '🇰🇪', 'etiopia': '🇪🇹', 'tanzania': '🇹🇿',
  'mali': '🇲🇱', 'congo': '🇨🇩', 'japao': '🇯🇵', 'china': '🇨🇳', 'coreia do sul': '🇰🇷', 
  'india': '🇮🇳', 'israel': '🇮🇱', 'palestina': '🇵🇸', 'iraque': '🇮🇶', 'ira': '🇮🇷', 
  'afeganistao': '🇦🇫', 'vietna': '🇻🇳', 'australia': '🇦🇺', 'timor leste': '🇹🇱'
};

const genreColors: Record<string, string> = {
  'Ficção': 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100',
  'Romance': 'bg-rose-50 text-rose-700 border-rose-100',
  'Fantasia': 'bg-purple-50 text-purple-700 border-purple-100',
  'Sci-Fi': 'bg-indigo-50 text-indigo-700 border-indigo-100',
  'Clássicos': 'bg-amber-100 text-amber-800 border-amber-200',
  'Gestão': 'bg-emerald-50 text-emerald-700 border-emerald-100',
  'Estratégia': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Liderança': 'bg-blue-50 text-blue-800 border-blue-200',
  'Vendas': 'bg-green-50 text-green-700 border-green-100',
  'Marketing': 'bg-orange-50 text-orange-700 border-orange-100',
  'RH': 'bg-pink-50 text-pink-700 border-pink-100',
  'Processos': 'bg-slate-200 text-slate-700 border-slate-300',
  'Startups': 'bg-violet-50 text-violet-700 border-violet-100',
  'Finanças': 'bg-yellow-50 text-yellow-700 border-yellow-100',
  'Negociação': 'bg-red-50 text-red-700 border-red-100',
  'Tecnologia': 'bg-cyan-50 text-cyan-700 border-cyan-100',
  'Data Science': 'bg-sky-50 text-sky-700 border-sky-100',
  'História': 'bg-stone-100 text-stone-700 border-stone-200',
  'Biografia': 'bg-gray-100 text-gray-700 border-gray-200',
  'Outros': 'bg-gray-50 text-gray-600 border-gray-100'
};

type BookStatus = 'Lendo' | 'Na Fila' | 'Concluído' | 'Abandonado';

export default function App() {
  const { books, refreshBooks } = useBooks()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isShuffleOpen, setIsShuffleOpen] = useState(false)
  const [editingBookId, setEditingBookId] = useState<string | null>(null)
  const [shuffledBook, setShuffledBook] = useState<any>(null)
  const [currentView, setCurrentView] = useState<'library' | 'analytics'>('library')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<BookStatus | 'Todos'>('Todos')
  const [sortBy, setSortBy] = useState<'recent' | 'rating'>('recent')

  const [formData, setFormData] = useState({
    title: '', author: '', author_nationality: '', publisher: '',
    total_pages: 0, read_pages: 0, cover_url: '', format: 'Físico',
    status: 'Na Fila' as BookStatus, rating: 0, finished_at: '', started_at: '',
    genre: 'Outros', is_bestseller: false, platform: 'Físico', interruption_reason: ''
  })

  function handleShuffle() {
    const queue = books.filter(b => b.status === 'Na Fila');
    if (queue.length === 0) return alert('Sua fila está vazia!');
    const random = queue[Math.floor(Math.random() * queue.length)];
    setShuffledBook(random);
    setIsShuffleOpen(true);
  }

  async function startReadingShuffled() {
    if (!shuffledBook) return;
    try {
      const { error } = await supabase.from('books').update({ 
        status: 'Lendo', 
        started_at: new Date().toISOString().split('T')[0] 
      }).eq('id', shuffledBook.id);
      if (error) throw error;
      setIsShuffleOpen(false);
      refreshBooks();
      alert('🚀 Boa leitura! Livro movido para "Lendo".');
    } catch (e: any) { alert(e.message); }
  }

  const stats = useMemo(() => ({
    totalBooks: books.length,
    totalReadPages: books.reduce((acc, b) => acc + (b.read_pages || 0), 0),
    completedBooks: books.filter(b => b.status === 'Concluído').length,
    readingBooks: books.filter(b => b.status === 'Lendo').length,
    queueBooks: books.filter(b => b.status === 'Na Fila').length,
    bestSellers: books.filter(b => b.is_bestseller).length
  }), [books]);

  const analytics = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const counters = {
      authors: {} as Record<string, number>,
      countries: {} as Record<string, number>,
      genres: {} as Record<string, number>,
      formats: {} as Record<string, number>,
      status: { 'Na Fila': 0, 'Lendo': 0, 'Concluído': 0, 'Abandonado': 0 } as Record<string, number>,
      monthly: Array(12).fill(0)
    };
    let totalDuration = 0; let booksWithDuration = 0; let finishedThisYear = 0; let pagesThisYear = 0;

    books.forEach(b => {
      if (b.author) counters.authors[b.author] = (counters.authors[b.author] || 0) + 1;
      if (b.author_nationality) {
        const nat = b.author_nationality.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        counters.countries[nat] = (counters.countries[nat] || 0) + 1;
      }
      if (b.genre) counters.genres[b.genre] = (counters.genres[b.genre] || 0) + 1;
      if (b.format) counters.formats[b.format] = (counters.formats[b.format] || 0) + 1;
      if (b.status && counters.status[b.status] !== undefined) counters.status[b.status]++;

      if (b.status === 'Concluído' && b.finished_at) {
        const date = new Date(b.finished_at);
        if (date.getFullYear() === currentYear) {
            counters.monthly[date.getMonth()]++;
            finishedThisYear++;
            pagesThisYear += (b.total_pages || 0);
        }
        if (b.started_at) {
          const start = new Date(b.started_at);
          totalDuration += Math.ceil(Math.abs(date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
          booksWithDuration++;
        }
      }
    });

    return {
      totalLidosAno: finishedThisYear,
      paginasLidasAno: pagesThisYear,
      mediaPaginas: books.length > 0 ? Math.round(books.reduce((acc, b) => acc + (b.total_pages || 0), 0) / books.length) : 0,
      tempoMedio: booksWithDuration > 0 ? Math.round(totalDuration / booksWithDuration) : 0,
      topAuthors: Object.entries(counters.authors).sort((a,b) => b[1] - a[1]).slice(0, 3),
      topCountries: Object.entries(counters.countries).sort((a,b) => b[1] - a[1]).slice(0, 3),
      statusDist: counters.status,
      mensal: counters.monthly,
      formatos: counters.formats
    };
  }, [books]);

  async function searchGoogleBooks() {
    const query = formData.title.trim();
    if (!query) return alert('Digite o título!');
    const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_KEY;
    try {
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${API_KEY}&maxResults=1`);
      const data = await response.json();
      if (data.items?.[0]) {
        const info = data.items[0].volumeInfo;
        setFormData(prev => ({
          ...prev, title: info.title || prev.title, author: info.authors?.join(', ') || '',
          publisher: info.publisher || '', total_pages: info.pageCount || 0,
          cover_url: info.imageLinks?.thumbnail?.replace('http:', 'https:') || '',
        }));
      }
    } catch (e) { alert('Erro na busca.'); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = { 
        ...formData, 
        rating: editingBookId ? formData.rating : 0,
        started_at: formData.started_at === '' ? null : formData.started_at,
        finished_at: formData.finished_at === '' ? null : formData.finished_at,
      };
      const { error } = editingBookId 
        ? await supabase.from('books').update(payload).eq('id', editingBookId)
        : await supabase.from('books').insert([payload]);
      if (error) throw error;
      setIsModalOpen(false); refreshBooks(); alert('✅ Livro salvo com sucesso!');
    } catch (e: any) { alert('❌ Erro ao salvar: ' + e.message); }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <header className="bg-white border-b border-slate-200 h-20 flex items-center justify-between px-6 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-lg"><Library /></div>
          <h1 className="text-xl font-bold text-slate-900 hidden md:block">Gestor de Leituras</h1>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button onClick={() => setCurrentView('library')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${currentView === 'library' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}><LayoutGrid className="w-4 h-4 inline mr-2"/> Biblioteca</button>
          <button onClick={() => setCurrentView('analytics')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${currentView === 'analytics' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}><PieChart className="w-4 h-4 inline mr-2"/> Relatórios</button>
        </div>
        <button onClick={() => { setEditingBookId(null); setFormData({ title: '', author: '', author_nationality: '', publisher: '', total_pages: 0, read_pages: 0, cover_url: '', format: 'Físico', status: 'Na Fila', rating: 0, finished_at: '', started_at: '', genre: 'Outros', is_bestseller: false, platform: 'Físico', interruption_reason: '' }); setIsModalOpen(true); }} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-600 transition-all"><Plus /> Novo</button>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-100"><Book className="text-violet-600 mb-2"/><p className="text-2xl font-black">{stats.totalBooks}</p><p className="text-xs text-slate-400 font-bold uppercase">Total</p></div>
          <div className="bg-white p-5 rounded-3xl border border-slate-100"><Award className="text-amber-600 mb-2"/><p className="text-2xl font-black">{stats.bestSellers}</p><p className="text-xs text-slate-400 font-bold uppercase">Best Sellers</p></div>
          <div className="bg-white p-5 rounded-3xl border border-slate-100"><Trophy className="text-blue-600 mb-2"/><p className="text-2xl font-black">{stats.totalReadPages.toLocaleString()}</p><p className="text-xs text-slate-400 font-bold uppercase">Páginas</p></div>
          <div className="bg-white p-5 rounded-3xl border border-slate-100"><Layers className="text-slate-600 mb-2"/><p className="text-2xl font-black">{stats.queueBooks}</p><p className="text-xs text-slate-400 font-bold uppercase">Na Fila</p></div>
          <div className="bg-white p-5 rounded-3xl border border-slate-100"><CheckCircle2 className="text-emerald-600 mb-2"/><p className="text-2xl font-black">{stats.completedBooks}</p><p className="text-xs text-slate-400 font-bold uppercase">Concluídos</p></div>
        </div>

        {currentView === 'library' ? (
          <>
            <div className="bg-white p-2 rounded-[1.5rem] border border-slate-200 flex flex-col lg:flex-row gap-2 shadow-sm">
              <div className="relative flex-1"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5"/><input className="w-full pl-12 pr-4 font-semibold outline-none text-slate-700" placeholder="Pesquisar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/></div>
              <div className="flex gap-2 p-1">
                {['Todos', 'Na Fila', 'Lendo', 'Concluído', 'Abandonado'].map((s) => (<button key={s} onClick={() => setFilterStatus(s as any)} className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase transition-all ${filterStatus === s ? 'bg-slate-900 text-white' : 'text-slate-500'}`}>{s}</button>))}
                <button onClick={handleShuffle} className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><Shuffle size={18}/></button>
                <div className="relative ml-1"><select className="appearance-none bg-slate-50 pl-4 pr-10 py-3 rounded-xl text-xs font-bold uppercase text-slate-600 outline-none" value={sortBy} onChange={e => setSortBy(e.target.value as any)}><option value="recent">Recentes</option><option value="rating">Melhores Notas</option></select><ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" /></div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-500">
              {books.filter(b => (b.title.toLowerCase().includes(searchTerm.toLowerCase()) || b.author.toLowerCase().includes(searchTerm.toLowerCase())) && (filterStatus === 'Todos' || b.status === filterStatus)).map(book => (
                <div key={book.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 flex gap-6 relative group shadow-sm hover:shadow-md transition-all">
                  <div className="w-24 h-36 bg-slate-50 rounded-xl overflow-hidden shrink-0 shadow-inner">{book.cover_url ? <img src={book.cover_url} className="w-full h-full object-cover" alt={book.title}/> : <div className="w-full h-full flex items-center justify-center bg-slate-100"><BookMarked className="text-slate-300 w-8 h-8"/></div>}</div>
                  <div className="flex-1 py-1 min-w-0">
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md border mb-1 block w-fit ${genreColors[book.genre || 'Outros'] || genreColors['Outros']}`}>{book.genre}</span>
                    <h3 className="font-bold text-lg truncate text-slate-900">{book.title}</h3>
                    <p className="text-sm text-slate-500 flex items-center gap-2">
                        {book.author_nationality ? (countryFlags[book.author_nationality.toLowerCase().trim()] || <Globe size={12}/>) : <Globe size={12}/>} {book.author}
                    </p>
                    <div className="mt-4"><div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider"><span>Progresso</span><span>{Math.round(((book.read_pages || 0) / (book.total_pages || 1)) * 100)}%</span></div><div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden"><div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${((book.read_pages || 0) / (book.total_pages || 1)) * 100}%` }}></div></div></div>
                    <div className="flex gap-2 mt-4"><span className={`text-[10px] font-black px-2 py-1 rounded uppercase ${book.status === 'Concluído' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>{book.status}</span>{(book.rating || 0) > 0 && <div className="flex items-center gap-1 bg-amber-50 px-2 rounded text-amber-600 text-[10px] font-bold"><Star size={10} className="fill-amber-400 text-amber-400"/> {book.rating}</div>}</div>
                  </div>
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all"><button onClick={() => { setEditingBookId(book.id); setFormData(book as any); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 rounded-lg"><Pencil size={16}/></button><button onClick={() => { if(confirm('Excluir livro?')) supabase.from('books').delete().eq('id', book.id).then(refreshBooks); }} className="p-2 text-slate-400 hover:text-red-600 bg-slate-50 rounded-lg"><Trash2 size={16}/></button></div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-3xl border shadow-sm"><Calendar className="text-blue-600 mb-2"/><p className="text-xs font-bold text-slate-400 uppercase mb-1">Lidos no Ano</p><p className="text-3xl font-black text-slate-900">{analytics.totalLidosAno}</p></div>
              <div className="bg-white p-6 rounded-3xl border shadow-sm"><Hash className="text-emerald-600 mb-2"/><p className="text-xs font-bold text-slate-400 uppercase mb-1">Páginas no Ano</p><p className="text-3xl font-black text-slate-900">{analytics.paginasLidasAno.toLocaleString()}</p></div>
              <div className="bg-white p-6 rounded-3xl border shadow-sm"><Timer className="text-orange-600 mb-2"/><p className="text-xs font-bold text-slate-400 uppercase mb-1">Média Dias/Livro</p><p className="text-3xl font-black text-slate-900">{analytics.tempoMedio}d</p></div>
              <div className="bg-white p-6 rounded-3xl border shadow-sm"><Book className="text-purple-600 mb-2"/><p className="text-xs font-bold text-slate-400 uppercase mb-1">Média Páginas</p><p className="text-3xl font-black text-slate-900">{analytics.mediaPaginas}</p></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm"><h2 className="text-sm font-black uppercase text-slate-900 mb-6 flex items-center gap-2"><User size={16} className="text-blue-600"/> Top Autores</h2>{analytics.topAuthors.map(([n, c]) => (<div key={n} className="flex justify-between items-center mb-4 font-bold text-sm bg-slate-50 p-3 rounded-2xl"><span>{n}</span><span className="bg-white px-2 py-1 rounded-lg shadow-sm text-xs font-black">{c} livros</span></div>))}</div>
              <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm"><h2 className="text-sm font-black uppercase text-slate-900 mb-6 flex items-center gap-2"><Globe size={16} className="text-emerald-600"/> Origens</h2>{analytics.topCountries.map(([n, c]) => (<div key={n} className="flex justify-between items-center mb-4 font-medium text-sm"><span>{countryFlags[n] || '🏳️'} {n.toUpperCase()}</span><span className="text-slate-400 font-bold">{c}</span></div>))}</div>
              <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm"><h2 className="text-sm font-black uppercase text-slate-900 mb-6 flex items-center gap-2"><Monitor size={16} className="text-orange-600"/> Formatos</h2>{Object.entries(analytics.formatos).map(([n, c]) => (<div key={n} className="mb-6"><div className="flex justify-between text-[10px] font-black uppercase mb-2"><span>{n}</span><span>{Math.round((c / (books.length || 1)) * 100)}%</span></div><div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden shadow-inner"><div className="bg-slate-800 h-full rounded-full transition-all duration-1000" style={{ width: `${(c / (books.length || 1)) * 100}%` }}></div></div></div>))}</div>
            </div>
          </div>
        )}
      </main>

      {/* 🎲 MODAL DE SORTEIO VISUAL */}
      {isShuffleOpen && shuffledBook && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 shadow-2xl text-center relative overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-blue-50 to-transparent"></div>
            <button onClick={() => setIsShuffleOpen(false)} className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full hover:bg-red-50 hover:text-red-500 transition-all"><X size={20}/></button>
            
            <div className="relative z-10 space-y-6">
              <div className="bg-blue-600 w-16 h-16 rounded-3xl mx-auto flex items-center justify-center shadow-xl shadow-blue-200 mb-2 rotate-12"><Sparkle className="text-white w-8 h-8" /></div>
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Sua Próxima Aventura</h2>
              <div className="w-40 h-60 bg-slate-100 rounded-[2rem] mx-auto shadow-2xl overflow-hidden border-4 border-white">
                {shuffledBook.cover_url ? <img src={shuffledBook.cover_url} className="w-full h-full object-cover" alt={shuffledBook.title}/> : <div className="w-full h-full flex items-center justify-center"><BookMarked size={40} className="text-slate-300"/></div>}
              </div>
              <div><h3 className="text-xl font-black text-slate-900 leading-tight mb-2">{shuffledBook.title}</h3><p className="text-sm font-bold text-slate-400">{shuffledBook.author}</p></div>
              <button onClick={startReadingShuffled} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-slate-900 transition-all">Começar Agora</button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-black text-slate-900">{editingBookId ? 'Editar BI' : 'Novo Registro'}</h2><button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors"><X/></button></div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2"><input className="flex-1 bg-slate-50 rounded-2xl px-5 py-4 font-bold outline-none border-2 border-transparent focus:border-blue-100" placeholder="Título do Livro" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required/><button type="button" onClick={searchGoogleBooks} className="bg-blue-600 text-white px-5 rounded-2xl hover:bg-blue-700 shadow-lg transition-colors"><Sparkles/></button></div>
              <div className="grid grid-cols-2 gap-4"><input className="bg-slate-50 rounded-2xl px-5 py-4 text-sm font-bold outline-none" placeholder="Autor" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})}/><input className="bg-slate-50 rounded-2xl px-5 py-4 text-sm font-bold outline-none" placeholder="País (Ex: Brasil)" value={formData.author_nationality} onChange={e => setFormData({...formData, author_nationality: e.target.value})}/></div>
              <div className="space-y-1"><label className="text-xs font-bold text-slate-400 ml-1 flex items-center gap-1"><ImageIcon size={12}/> URL da Capa</label><div className="relative"><LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" /><input className="w-full bg-slate-50 rounded-2xl pl-12 pr-4 py-4 text-xs font-bold outline-none border-2 border-transparent focus:border-blue-100" placeholder="Cole o link da imagem..." value={formData.cover_url} onChange={e => setFormData({...formData, cover_url: e.target.value})}/></div></div>
              <div className="space-y-1"><label className="text-xs font-bold text-slate-400 ml-1 flex items-center gap-1"><Tag size={12}/> Gênero Literário</label><select className="w-full bg-slate-50 rounded-2xl px-5 py-4 text-sm font-bold outline-none appearance-none cursor-pointer" value={formData.genre} onChange={e => setFormData({...formData, genre: e.target.value})}><optgroup label="Gestão & Negócios"><option>Gestão</option><option>Estratégia</option><option>Liderança</option><option>Vendas</option><option>Marketing</option></optgroup><optgroup label="Literatura"><option>Ficção</option><option>Romance</option><option>Fantasia</option><option>Sci-Fi</option><option>Clássicos</option><option>Biografia</option><option>Outros</option></optgroup></select></div>
              <div className="grid grid-cols-2 gap-4"><div className="space-y-1"><label className="text-xs font-bold text-slate-400 ml-1 flex items-center gap-1"><PlayCircle size={12}/> Início</label><input type="date" className="w-full bg-slate-50 rounded-2xl px-5 py-4 text-sm font-bold outline-none" value={formData.started_at} onChange={e => setFormData({...formData, started_at: e.target.value})}/></div><div className="space-y-1"><label className="text-xs font-bold text-slate-400 ml-1 flex items-center gap-1"><StopCircle size={12}/> Fim</label><input type="date" className="w-full bg-slate-50 rounded-2xl px-5 py-4 text-sm font-bold outline-none" value={formData.finished_at} onChange={e => setFormData({...formData, finished_at: e.target.value})}/></div></div>
              <div className="grid grid-cols-2 gap-4"><select className="bg-slate-50 rounded-2xl px-5 py-4 text-sm font-bold outline-none" value={formData.format} onChange={e => setFormData({...formData, format: e.target.value})}><option>Físico</option><option>E-book</option><option>Audiobook</option></select><select className="bg-slate-50 rounded-2xl px-5 py-4 text-sm font-bold outline-none" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as BookStatus})}><option value="Na Fila">Na Fila</option><option value="Lendo">Lendo</option><option value="Concluído">Concluído</option><option value="Abandonado">Abandonado</option></select></div>
              <div className="grid grid-cols-2 gap-4"><input type="number" className="bg-slate-50 rounded-2xl px-5 py-4 font-bold outline-none" placeholder="Páginas" value={formData.total_pages} onChange={e => setFormData({...formData, total_pages: Number(e.target.value)})}/><input type="number" className="bg-slate-50 rounded-2xl px-5 py-4 font-bold outline-none" placeholder="Lidas" value={formData.read_pages} onChange={e => setFormData({...formData, read_pages: Number(e.target.value)})}/></div>
              <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase shadow-xl hover:bg-blue-600 transition-all transform active:scale-95">SALVAR DADOS</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}