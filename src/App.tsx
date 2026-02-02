import { useState, useMemo } from 'react'
import { useBooks } from './contexts/BookContext'
import { supabase } from './lib/supabase'
import { 
  Library, Plus, Trash2, CheckCircle2, 
  BookMarked, X, Pencil, Search, ArrowUpDown, Sparkles, Star, Trophy, Globe, Link as LinkIcon, Image as ImageIcon,
  Book, Award, PieChart, LayoutGrid, Monitor, Tag, Shuffle, Sparkle
} from 'lucide-react'

// 🌍 MAPA-MÚNDI COMPLETO (120 BANDEIRAS)
const countryFlags: Record<string, string> = {
  'brasil': '🇧🇷', 'brasileira': '🇧🇷', 'argentina': '🇦🇷', 'chile': '🇨🇱', 'colombia': '🇨🇴', 'mexico': '🇲🇽', 'estados unidos': '🇺🇸', 'eua': '🇺🇸', 'canada': '🇨🇦', 'peru': '🇵🇪', 'uruguai': '🇺🇾', 'paraguai': '🇵🇾', 'bolivia': '🇧🇴', 'equador': '🇪🇨', 'venezuela': '🇻🇪', 'cuba': '🇨🇺', 'jamaica': '🇯🇲', 'haiti': '🇭🇹', 'republica dominicana': '🇩🇴', 'guatemala': '🇬🇹', 'honduras': '🇭🇳', 'el salvador': '🇸🇻', 'nicaragua': '🇳🇮', 'costa rica': '🇨🇷', 'panama': '🇵🇦', 'portugal': '🇵🇹', 'espanha': '🇪🇸', 'franca': '🇫🇷', 'italia': '🇮🇹', 'alemanha': '🇩🇪', 'reino unido': '🇬🇧', 'inglaterra': '🇬🇧', 'irlanda': '🇮🇪', 'russia': '🇷🇺', 'grecia': '🇬🇷', 'suica': '🇨🇭', 'austria': '🇦🇹', 'suecia': '🇸🇪', 'noruega': '🇳🇴', 'dinamarca': '🇩🇰', 'finlandia': '🇫🇮', 'polonia': '🇵🇱', 'belgica': '🇧🇪', 'holanda': '🇳🇱', 'paises baixos': '🇳🇱', 'ucrania': '🇺🇦', 'turquia': '🇹🇷', 'checa': '🇨🇿', 'hungria': '🇭🇺', 'romenia': '🇷🇴', 'bulgaria': '🇧🇬', 'croacia': '🇭🇷', 'servia': '🇷🇸', 'eslovaquia': '🇸🇰', 'eslovenia': '🇸🇮', 'estonia': '🇪🇪', 'letonia': '🇱🇻', 'lituania': '🇱🇹', 'islandia': '🇮🇸', 'luxemburgo': '🇱🇺', 'monaco': '🇲🇨', 'angola': '🇦🇴', 'mocambique': '🇲🇿', 'africa do sul': '🇿🇦', 'egito': '🇪🇬', 'nigeria': '🇳🇬', 'marrocos': '🇲🇦', 'argelia': '🇩🇿', 'quenia': '🇰🇪', 'etiopia': '🇪🇹', 'tanzania': '🇹🇿', 'mali': '🇲🇱', 'congo': '🇨🇩', 'gana': '🇬🇭', 'camaroes': '🇨🇲', 'costa do marfim': '🇨🇮', 'senegal': '🇸🇳', 'tunisia': '🇹🇳', 'madagascar': '🇲🇬', 'japao': '🇯🇵', 'china': '🇨🇳', 'coreia do sul': '🇰🇷', 'india': '🇮🇳', 'israel': '🇮🇱', 'palestina': '🇵🇸', 'iraque': '🇮🇶', 'ira': '🇮🇷', 'afeganistao': '🇦🇫', 'vietna': '🇻🇳', 'tailandia': '🇹🇭', 'indonesia': '🇮🇩', 'filipinas': '🇵🇭', 'malasia': '🇲🇾', 'singapura': '🇸🇬', 'paquistao': '🇵🇰', 'bangladesh': '🇧🇩', 'arabia saudita': '🇸🇦', 'emirados arabes': '🇦🇪', 'catar': '🇶🇦', 'libano': '🇱🇧', 'jordania': '🇯🇴', 'siria': '🇸🇾', 'australia': '🇦🇺', 'nova zelandia': '🇳🇿', 'timor leste': '🇹🇱', 'fiji': '🇫🇯', 'niger': '🇳🇪', 'chade': '🇹🇩', 'sudan': '🇸🇩', 'libia': '🇱🇾', 'somalia': '🇸🇴', 'zambia': '🇿🇲', 'zimbabue': '🇿🇼', 'namibia': '🇳🇦', 'botsuana': '🇧🇼', 'guiana': '🇬🇾', 'suriname': '🇸🇷'
};

// 💎 PALETA DE CORES LUXUOSA (SÉRIA)
const genreColors: Record<string, string> = {
  'Ficção': 'bg-stone-100 text-stone-700 border-stone-200',
  'Suspense & Mistério': 'bg-slate-200 text-slate-800 border-slate-300',
  'Terror & Horror': 'bg-zinc-800 text-zinc-100 border-zinc-700',
  'Literatura Clássica': 'bg-amber-50 text-amber-800 border-amber-200',
  'Não Ficção': 'bg-slate-100 text-slate-700 border-slate-200',
  'Ciências Humanas': 'bg-stone-200 text-stone-900 border-stone-300',
  'Ciências Sociais Aplicadas': 'bg-slate-800 text-slate-50 border-slate-700',
  'Ciências Exatas': 'bg-blue-50 text-blue-900 border-blue-200',
  'Ciências da Natureza': 'bg-stone-50 text-stone-600 border-stone-200',
  'Ciências da Saúde': 'bg-zinc-100 text-zinc-800 border-zinc-300',
  'Tecnologia & Computação': 'bg-slate-900 text-white border-slate-700',
  'Religião & Espiritualidade': 'bg-amber-100 text-amber-900 border-amber-200',
  'Desenvolvimento Pessoal': 'bg-stone-800 text-stone-100 border-stone-600',
  'Infantojuvenil': 'bg-slate-50 text-slate-600 border-slate-200',
  'Outros': 'bg-gray-100 text-gray-500 border-gray-200'
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

  const currentYear = new Date().getFullYear();
  const emptyForm = { title: '', author: '', author_nationality: '', publisher: '', total_pages: 0, read_pages: 0, cover_url: '', format: 'Físico', status: 'Na Fila' as BookStatus, rating: 0, finished_at: '', started_at: '', genre: 'Outros', is_bestseller: false, platform: 'Físico', interruption_reason: '' };
  const [formData, setFormData] = useState(emptyForm);

  function handleShuffle() {
    const queue = books.filter(b => b.status === 'Na Fila');
    if (queue.length === 0) return alert('Sua fila está vazia!');
    setShuffledBook(queue[Math.floor(Math.random() * queue.length)]);
    setIsShuffleOpen(true);
  }

  async function startReadingShuffled() {
    if (!shuffledBook) return;
    try {
      await supabase.from('books').update({ status: 'Lendo', started_at: new Date().toISOString().split('T')[0] }).eq('id', shuffledBook.id);
      setIsShuffleOpen(false); refreshBooks();
    } catch (e: any) { alert(e.message); }
  }

  const stats = useMemo(() => ({
    totalBooks: books.length,
    totalReadPages: books.reduce((acc, b) => acc + (b.read_pages || 0), 0),
    completedBooks: books.filter(b => b.status === 'Concluído').length,
    queueBooks: books.filter(b => b.status === 'Na Fila').length,
  }), [books]);

  const analytics = useMemo(() => {
    const counters = { countries: {} as Record<string, number>, genres: {} as Record<string, number>, formats: {} as Record<string, number>, monthly: Array(12).fill(0) };
    let finishedThisYear = 0; let pagesThisYear = 0;

    books.forEach(b => {
      if (b.genre) counters.genres[b.genre] = (counters.genres[b.genre] || 0) + 1;
      if (b.format) counters.formats[b.format] = (counters.formats[b.format] || 0) + 1;
      if (b.author_nationality) {
        const nat = b.author_nationality.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        counters.countries[nat] = (counters.countries[nat] || 0) + 1;
      }
      if (b.status === 'Concluído' && b.finished_at) {
        const date = new Date(b.finished_at);
        if (date.getFullYear() === currentYear) {
            counters.monthly[date.getMonth()]++;
            finishedThisYear++;
            pagesThisYear += (b.total_pages || 0);
        }
      }
    });

    return {
      totalLidosAno: finishedThisYear, paginasLidasAno: pagesThisYear,
      formatos: counters.formats, mensal: counters.monthly,
      topGeneros: Object.entries(counters.genres).sort((a,b) => b[1] - a[1]).slice(0, 5),
      topPaises: Object.entries(counters.countries).sort((a,b) => b[1] - a[1]).slice(0, 5)
    };
  }, [books, currentYear]);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = { ...formData, rating: editingBookId ? formData.rating : 0, started_at: formData.started_at || null, finished_at: formData.finished_at || null };
      if (editingBookId) await supabase.from('books').update(payload).eq('id', editingBookId);
      else await supabase.from('books').insert([payload]);
      setFormData(emptyForm); setIsModalOpen(false); refreshBooks(); alert('✅ Registro salvo.');
    } catch (e: any) { alert('❌ Erro: ' + e.message); }
  }

  return (
    <div className="min-h-screen bg-[#F9F7F2] text-slate-900 font-sans tracking-tight">
      <header className="bg-white border-b border-stone-200 h-20 flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-stone-900 p-2.5 rounded-xl text-amber-500 shadow-lg shadow-stone-200"><Library /></div>
          <h1 className="text-xl font-black text-stone-900 tracking-widest uppercase hidden md:block">Estante Premium</h1>
        </div>
        <div className="flex bg-stone-100 p-1 rounded-xl">
          <button onClick={() => setCurrentView('library')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase transition-all ${currentView === 'library' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400'}`}><LayoutGrid className="w-4 h-4 inline mr-2"/> Biblioteca</button>
          <button onClick={() => setCurrentView('analytics')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase transition-all ${currentView === 'analytics' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400'}`}><PieChart className="w-4 h-4 inline mr-2"/> Relatórios</button>
        </div>
        <button onClick={() => { setEditingBookId(null); setFormData(emptyForm); setIsModalOpen(true); }} className="bg-stone-900 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-amber-700 transition-all shadow-xl shadow-stone-200"><Plus size={20}/> Novo</button>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {/* KPI DASHBOARD ESTILO MINIMALISTA */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-stone-100 shadow-sm"><Book className="text-stone-400 mb-2"/><p className="text-2xl font-black">{stats.totalBooks}</p><p className="text-[10px] text-stone-400 font-black uppercase tracking-widest">Total</p></div>
          <div className="bg-white p-5 rounded-3xl border border-stone-100 shadow-sm"><Trophy className="text-amber-600 mb-2"/><p className="text-2xl font-black">{stats.totalReadPages.toLocaleString()}</p><p className="text-[10px] text-stone-400 font-black uppercase tracking-widest">Páginas</p></div>
          <div className="bg-white p-5 rounded-3xl border border-stone-100 shadow-sm"><CheckCircle2 className="text-stone-900 mb-2"/><p className="text-2xl font-black">{stats.completedBooks}</p><p className="text-[10px] text-stone-400 font-black uppercase tracking-widest">Lidos</p></div>
          <div className="bg-white p-5 rounded-3xl border border-stone-100 shadow-sm flex flex-col justify-center items-center"><div className="w-8 h-8 flex items-center justify-center bg-amber-50 rounded-lg mb-1"><Star className="text-amber-600 w-5 h-5 fill-amber-600"/></div><p className="text-[10px] text-stone-400 font-black uppercase tracking-widest">Notas</p></div>
          <div className="bg-white p-5 rounded-3xl border border-stone-100 shadow-sm flex items-center justify-center"><Sparkle className="text-stone-300 w-8 h-8"/></div>
        </div>

        {currentView === 'library' ? (
          <>
            <div className="bg-white p-2 rounded-[1.5rem] border border-stone-200 flex flex-col lg:flex-row gap-2 shadow-sm">
              <div className="relative flex-1"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 w-5 h-5"/><input className="w-full pl-12 pr-4 font-bold outline-none text-stone-800 placeholder:text-stone-300" placeholder="Pesquisar na coleção..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/></div>
              <div className="flex gap-2 p-1">
                {['Todos', 'Na Fila', 'Lendo', 'Concluído'].map((s) => (<button key={s} onClick={() => setFilterStatus(s as any)} className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === s ? 'bg-stone-900 text-white' : 'text-stone-400 hover:text-stone-600'}`}>{s}</button>))}
                <button onClick={handleShuffle} className="p-3 bg-stone-50 text-stone-900 rounded-xl hover:bg-stone-900 hover:text-white transition-all shadow-sm border border-stone-100"><Shuffle size={18}/></button>
                <div className="relative ml-1"><select className="appearance-none bg-stone-50 pl-4 pr-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-stone-600 outline-none border border-stone-100" value={sortBy} onChange={e => setSortBy(e.target.value as any)}><option value="recent">Recentes</option><option value="rating">Melhores</option></select><ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-stone-400 pointer-events-none" /></div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-500">
              {books.filter(b => (b.title.toLowerCase().includes(searchTerm.toLowerCase()) || b.author.toLowerCase().includes(searchTerm.toLowerCase())) && (filterStatus === 'Todos' || b.status === filterStatus)).map(book => {
                const progress = Math.round(((book.read_pages || 0) / (book.total_pages || 1)) * 100);
                return (
                  <div key={book.id} className="bg-white p-5 rounded-[2rem] border border-stone-100 flex gap-6 relative group shadow-sm hover:shadow-xl transition-all duration-300">
                    <div className="w-24 h-36 bg-stone-50 rounded-xl overflow-hidden shrink-0 shadow-inner border border-stone-100">{book.cover_url ? <img src={book.cover_url} className="w-full h-full object-cover" alt={book.title}/> : <div className="w-full h-full flex items-center justify-center bg-stone-50"><BookMarked className="text-stone-200 w-8 h-8"/></div>}</div>
                    <div className="flex-1 py-1 min-w-0">
                      <span className={`text-[8px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-md border mb-2 block w-fit ${book.genre && genreColors[book.genre] ? genreColors[book.genre] : genreColors['Outros']}`}>{book.genre}</span>
                      <h3 className="font-black text-lg truncate text-stone-900 tracking-tight leading-tight">{book.title}</h3>
                      <p className="text-xs text-stone-400 font-bold flex items-center gap-2 mt-1 uppercase tracking-wider">
                          {book.author_nationality ? (countryFlags[book.author_nationality.toLowerCase().trim()] || <Globe size={10}/>) : <Globe size={10}/>} {book.author}
                      </p>
                      
                      <div className="mt-5">
                        <div className="flex justify-between text-[9px] font-black text-stone-400 mb-1 uppercase tracking-widest">
                          <span>Progresso</span>
                          <span className={`${book.status === 'Lendo' ? 'text-amber-700 font-black' : ''}`}>{progress}%</span>
                        </div>
                        <div className="w-full bg-stone-50 h-1 rounded-full overflow-hidden">
                          <div className={`h-full transition-all duration-700 ${book.status === 'Concluído' ? 'bg-stone-900' : 'bg-amber-600'}`} style={{ width: `${progress}%` }}></div>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4"><span className={`text-[9px] font-black px-2 py-1 rounded uppercase tracking-widest ${book.status === 'Concluído' ? 'bg-stone-900 text-white' : 'bg-stone-50 text-stone-500'}`}>{book.status}</span>{(book.rating || 0) > 0 && <div className="flex items-center gap-1 bg-amber-50 px-2 rounded text-amber-700 text-[9px] font-black"><Star size={10} className="fill-amber-500 text-amber-500"/> {book.rating}</div>}</div>
                    </div>
                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all"><button onClick={() => { setEditingBookId(book.id); setFormData(book as any); setIsModalOpen(true); }} className="p-2 text-stone-300 hover:text-stone-900 bg-stone-50 rounded-lg transition-colors"><Pencil size={14}/></button><button onClick={() => { if(confirm('Excluir da coleção?')) supabase.from('books').delete().eq('id', book.id).then(refreshBooks); }} className="p-2 text-stone-300 hover:text-red-800 bg-stone-50 rounded-lg transition-colors"><Trash2 size={14}/></button></div>
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm"><PieChart className="text-stone-400 mb-2"/><p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Ano {currentYear}</p><p className="text-3xl font-black text-stone-900">{analytics.totalLidosAno} Lidos</p></div>
              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm"><Award className="text-amber-600 mb-2"/><p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Produtividade</p><p className="text-3xl font-black text-stone-900">{analytics.paginasLidasAno.toLocaleString()}</p></div>
              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex flex-col justify-center"><p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Top País</p><p className="text-xl font-black uppercase text-stone-800 truncate">{analytics.topPaises[0]?.[0] || '-'}</p></div>
              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex flex-col justify-center"><p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Top Gênero</p><p className="text-xl font-black uppercase text-stone-800 truncate">{analytics.topGeneros[0]?.[0] || '-'}</p></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-stone-200 shadow-sm"><h2 className="text-[11px] font-black uppercase text-stone-900 mb-6 flex items-center gap-2 tracking-[0.2em]"><Tag size={16} className="text-stone-400"/> Gêneros</h2>{analytics.topGeneros.map(([n, c]) => (<div key={n} className="flex justify-between items-center mb-4 font-bold text-sm bg-stone-50 p-3 rounded-2xl border border-stone-100"><span>{n}</span><span className="bg-white px-2 py-1 rounded-lg shadow-sm text-xs font-black text-stone-900">{c}</span></div>))}</div>
              <div className="bg-white p-8 rounded-[2.5rem] border border-stone-200 shadow-sm"><h2 className="text-[11px] font-black uppercase text-stone-900 mb-6 flex items-center gap-2 tracking-[0.2em]"><Globe size={16} className="text-stone-400"/> Origens</h2>{analytics.topPaises.map(([n, c]) => (<div key={n} className="flex justify-between items-center mb-4 font-bold text-sm px-1"><span>{countryFlags[n] || '🏳️'} {n.toUpperCase()}</span><span className="text-stone-300 font-black">{c}</span></div>))}</div>
              <div className="bg-white p-8 rounded-[2.5rem] border border-stone-200 shadow-sm"><h2 className="text-[11px] font-black uppercase text-stone-900 mb-6 flex items-center gap-2 tracking-[0.2em]"><Monitor size={16} className="text-stone-400"/> Formatos</h2>{Object.entries(analytics.formatos).map(([n, c]) => (<div key={n} className="mb-6"><div className="flex justify-between text-[10px] font-black uppercase mb-2 tracking-widest"><span>{n}</span><span>{Math.round((c / (books.length || 1)) * 100)}%</span></div><div className="w-full bg-stone-50 h-1.5 rounded-full overflow-hidden shadow-inner"><div className="bg-stone-950 h-full rounded-full transition-all duration-1000" style={{ width: `${(c / (books.length || 1)) * 100}%` }}></div></div></div>))}</div>
            </div>
          </div>
        )}
      </main>

      {/* 🎲 SORTEADOR VISUAL PREMIUM (VERSÃO DARK LUXO) */}
      {isShuffleOpen && shuffledBook && (
        <div className="fixed inset-0 bg-stone-950/90 backdrop-blur-xl flex items-center justify-center z-50 p-4 animate-in fade-in duration-500">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 shadow-2xl text-center relative overflow-hidden border border-stone-200">
            <button onClick={() => setIsShuffleOpen(false)} className="absolute top-6 right-6 p-2 bg-stone-50 rounded-full hover:bg-stone-100 transition-all z-20"><X size={20}/></button>
            <div className="relative z-10 space-y-6">
              <div className="bg-stone-900 w-16 h-16 rounded-3xl mx-auto flex items-center justify-center shadow-xl mb-2 rotate-12"><Sparkle className="text-amber-500 w-8 h-8" /></div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">Leitura Recomendada</h2>
              <div className="w-40 h-60 bg-stone-100 rounded-[2rem] mx-auto shadow-2xl overflow-hidden border-4 border-white transform hover:scale-105 transition-transform duration-500">{shuffledBook.cover_url && <img src={shuffledBook.cover_url} className="w-full h-full object-cover" alt={shuffledBook.title}/>}</div>
              <div><h3 className="text-xl font-black text-stone-900 mb-2 leading-tight">{shuffledBook.title}</h3><p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{shuffledBook.author}</p></div>
              <button onClick={startReadingShuffled} className="w-full bg-stone-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-amber-700 transition-all">Iniciar Leitura</button>
            </div>
          </div>
        </div>
      )}

      {/* 🏛️ MODAL DE CADASTRO (DESIGN EXECUTIVO) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] p-8 max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-100">
            <div className="flex justify-between items-center mb-8 border-b border-stone-50 pb-6"><h2 className="text-lg font-black text-stone-900 uppercase tracking-[0.2em]">{editingBookId ? 'Editar Registro' : 'Novo Acervo'}</h2><button onClick={() => setIsModalOpen(false)} className="p-2 bg-stone-50 rounded-full text-stone-400 hover:text-stone-900 transition-colors"><X/></button></div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex gap-2"><input className="flex-1 bg-stone-50 rounded-2xl px-6 py-4 font-bold outline-none border-2 border-transparent focus:border-stone-200 transition-all" placeholder="Título do Livro" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required/><button type="button" onClick={searchGoogleBooks} className="bg-stone-900 text-amber-500 px-5 rounded-2xl hover:bg-stone-800 shadow-lg transition-colors"><Sparkles size={20}/></button></div>
              <div className="grid grid-cols-2 gap-4"><input className="bg-stone-50 rounded-2xl px-6 py-4 text-sm font-bold outline-none border-2 border-transparent focus:border-stone-200" placeholder="Autor" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})}/><input className="bg-stone-50 rounded-2xl px-6 py-4 text-sm font-bold outline-none border-2 border-transparent focus:border-stone-200" placeholder="Nacionalidade" value={formData.author_nationality} onChange={e => setFormData({...formData, author_nationality: e.target.value})}/></div>
              <div className="space-y-1"><label className="text-[10px] font-black text-stone-400 ml-2 uppercase tracking-widest flex items-center gap-1"><ImageIcon size={12}/> Link da Capa (Manual)</label><div className="relative"><LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300 w-4 h-4"/><input className="w-full bg-stone-50 rounded-2xl pl-12 pr-4 py-4 text-[11px] font-bold outline-none border-2 border-transparent focus:border-stone-200" placeholder="Cole a URL da imagem aqui..." value={formData.cover_url} onChange={e => setFormData({ ...formData, cover_url: e.target.value })}/></div></div>
              
              <div className="space-y-1"><label className="text-[10px] font-black text-stone-400 ml-2 uppercase tracking-widest flex items-center gap-1"><Tag size={12}/> Classificação Literária</label>
                <select className="w-full bg-stone-50 rounded-2xl px-6 py-4 text-sm font-bold outline-none appearance-none cursor-pointer border-2 border-transparent focus:border-stone-200" value={formData.genre} onChange={e => setFormData({...formData, genre: e.target.value})}>
                  <optgroup label="Ficção">
                    <option>Romance</option><option>Conto</option><option>Novela</option><option>Ficção Científica</option><option>Fantasia</option><option>Distopia</option><option>Utopia</option><option>Realismo Mágico</option>
                  </optgroup>
                  <optgroup label="Não Ficção">
                    <option>Biografia</option><option>Autobiografia</option><option>Ensaio</option><option>Reportagem Literária</option>
                  </optgroup>
                  <optgroup label="Ciências Humanas & Sociais">
                    <option>Filosofia</option><option>História</option><option>Direito</option><option>Sociologia</option><option>Economia</option><option>Psicologia</option>
                  </optgroup>
                  <optgroup label="Tecnologia & Carreira">
                    <option>Tecnologia & Computação</option><option>Ciência de Dados</option><option>Desenvolvimento Pessoal</option><option>Administração</option>
                  </optgroup>
                  <optgroup label="Outros">
                    <option>Religião & Espiritualidade</option><option>Infantojuvenil</option><option>Poesia</option><option>Outros</option>
                  </optgroup>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-[10px] font-black text-stone-400 ml-2 uppercase tracking-widest">Início</label><input type="date" className="w-full bg-stone-50 rounded-2xl px-6 py-4 text-xs font-bold outline-none border-2 border-transparent focus:border-stone-200" value={formData.started_at} onChange={e => setFormData({...formData, started_at: e.target.value})}/></div>
                <div className="space-y-1"><label className="text-[10px] font-black text-stone-400 ml-2 uppercase tracking-widest">Término</label><input type="date" className="w-full bg-stone-50 rounded-2xl px-6 py-4 text-xs font-bold outline-none border-2 border-transparent focus:border-stone-200" value={formData.finished_at} onChange={e => setFormData({...formData, finished_at: e.target.value})}/></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <select className="bg-stone-50 rounded-2xl px-6 py-4 text-sm font-bold outline-none appearance-none border-2 border-transparent focus:border-stone-200" value={formData.format} onChange={e => setFormData({...formData, format: e.target.value})}><option>Físico</option><option>E-book</option><option>Audiobook</option></select>
                <select className="bg-stone-50 rounded-2xl px-6 py-4 text-sm font-bold outline-none appearance-none border-2 border-transparent focus:border-stone-200" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as BookStatus})}><option value="Na Fila">Na Fila</option><option value="Lendo">Lendo</option><option value="Concluído">Concluído</option><option value="Abandonado">Abandonado</option></select>
              </div>
              <div className="grid grid-cols-2 gap-4"><input type="number" className="bg-stone-50 rounded-2xl px-6 py-4 font-bold outline-none border-2 border-transparent focus:border-stone-200" placeholder="Total Páginas" value={formData.total_pages} onChange={e => setFormData({...formData, total_pages: Number(e.target.value)})}/><input type="number" className="bg-stone-50 rounded-2xl px-6 py-4 font-bold outline-none border-2 border-transparent focus:border-stone-200" placeholder="Lidas" value={formData.read_pages} onChange={e => setFormData({...formData, read_pages: Number(e.target.value)})}/></div>
              <button type="submit" className="w-full bg-stone-950 text-white py-5 rounded-2xl font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-amber-700 transition-all transform active:scale-95">Catalogar Livro</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}