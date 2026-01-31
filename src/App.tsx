import { useState, useMemo } from 'react'
import { useBooks } from './contexts/BookContext'
import { supabase } from './lib/supabase'
import { 
  Library, Plus, Trash2, CheckCircle2, 
  BookMarked, X, Pencil, Search, ArrowUpDown, Sparkles, Star, Trophy, Globe, Link as LinkIcon, Image as ImageIcon,
  Layers, Book, PlayCircle, StopCircle, Timer, Award, PieChart, LayoutGrid, Calendar, MapPin, User, Hash, AlertTriangle, TrendingUp, Tag
} from 'lucide-react'

// 🌍 MAPA-MÚNDI COMPLETO (RESTAURADO)
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
  'Ciência': 'bg-indigo-50 text-indigo-700 border-indigo-100',
  'Clássicos': 'bg-amber-100 text-amber-800 border-amber-200',
  'Gestão': 'bg-emerald-50 text-emerald-700 border-emerald-100',
  'Estratégia': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Liderança': 'bg-blue-50 text-blue-800 border-blue-200',
  'Filosofia': 'bg-green-50 text-green-700 border-green-100',
  'Autoajuda': 'bg-orange-50 text-orange-700 border-orange-100',
  'RH': 'bg-pink-50 text-pink-700 border-pink-100',
  'Sociologia': 'bg-slate-200 text-slate-700 border-slate-300',
  'Economia': 'bg-violet-50 text-violet-700 border-violet-100',
  'Finanças': 'bg-yellow-50 text-yellow-700 border-yellow-100',
  'Negociação': 'bg-red-50 text-red-700 border-red-100',
  'Tecnologia': 'bg-cyan-50 text-cyan-700 border-cyan-100',
  'Direito': 'bg-sky-50 text-sky-700 border-sky-100',
  'História': 'bg-stone-100 text-stone-700 border-stone-200',
  'Biografia': 'bg-gray-100 text-gray-700 border-gray-200',
  'Outros': 'bg-gray-50 text-gray-600 border-gray-100'
};

// TIPOS PARA O STATUS
type BookStatus = 'Lendo' | 'Na Fila' | 'Concluído' | 'Abandonado';
type FilterStatus = BookStatus | 'Todos';

// Função auxiliar para verificar se uma string é um BookStatus válido
function isBookStatus(status: string): status is BookStatus {
  return ['Lendo', 'Na Fila', 'Concluído', 'Abandonado'].includes(status);
}

export default function App() {
  const { books, refreshBooks } = useBooks()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBookId, setEditingBookId] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<'library' | 'analytics'>('library')
  
  // VARIÁVEIS VISUAIS
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('Todos')
  const [sortBy, setSortBy] = useState<'recent' | 'rating'>('recent')

  const [formData, setFormData] = useState({
    title: '', author: '', author_nationality: '', publisher: '',
    total_pages: 0, read_pages: 0, cover_url: '', format: 'Físico',
    status: 'Na Fila' as BookStatus,
    rating: 0, finished_at: '', started_at: '',
    genre: 'Outros', is_bestseller: false, platform: 'Físico', interruption_reason: ''
  })

  // 📊 DASHBOARD
  const stats = useMemo(() => ({
    totalBooks: books.length,
    totalReadPages: books.reduce((acc, b) => acc + (b.read_pages || 0), 0),
    completedBooks: books.filter(b => b.status === 'Concluído').length,
    readingBooks: books.filter(b => b.status === 'Lendo').length,
    queueBooks: books.filter(b => b.status === 'Na Fila').length,
    bestSellers: books.filter(b => b.is_bestseller).length
  }), [books]);

  // 📈 BI ENGINE (Relatórios)
  const analytics = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const finishedThisYear = books.filter(b => b.status === 'Concluído' && b.finished_at && new Date(b.finished_at).getFullYear() === currentYear);
    
    const counters = {
      authors: {} as Record<string, number>,
      countries: {} as Record<string, number>,
      genres: {} as Record<string, number>,
      formats: {} as Record<string, number>,
      status: { 'Na Fila': 0, 'Lendo': 0, 'Concluído': 0, 'Abandonado': 0 } as Record<string, number>,
      monthly: Array(12).fill(0)
    };

    let totalDuration = 0;
    let booksWithDuration = 0;

    books.forEach(b => {
      if (b.author) counters.authors[b.author] = (counters.authors[b.author] || 0) + 1;
      if (b.author_nationality) {
          const nat = b.author_nationality.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          counters.countries[nat] = (counters.countries[nat] || 0) + 1;
      }
      if (b.genre) counters.genres[b.genre] = (counters.genres[b.genre] || 0) + 1;
      if (b.format) counters.formats[b.format] = (counters.formats[b.format] || 0) + 1;
      
      // CORREÇÃO DO ERRO TS2367: Usar type assertion
      const s = b.status || 'Na Fila';
      if (isBookStatus(s) && counters.status[s] !== undefined) {
        counters.status[s]++;
      }

      if (b.status === 'Concluído' && b.finished_at) {
        const date = new Date(b.finished_at);
        if (date.getFullYear() === currentYear) counters.monthly[date.getMonth()]++;
        if (b.started_at) {
          const start = new Date(b.started_at);
          const diff = Math.ceil(Math.abs(date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
          totalDuration += diff;
          booksWithDuration++;
        }
      }
    });

    return {
      totalLidosAno: finishedThisYear.length,
      paginasLidasAno: finishedThisYear.reduce((acc, b) => acc + (b.total_pages || 0), 0),
      mediaPaginas: books.length > 0 ? Math.round(books.reduce((acc, b) => acc + b.total_pages, 0) / books.length) : 0,
      tempoMedio: booksWithDuration > 0 ? Math.round(totalDuration / booksWithDuration) : 0,
      topAuthors: Object.entries(counters.authors).sort((a,b) => b[1] - a[1]).slice(0, 3),
      topCountries: Object.entries(counters.countries).sort((a,b) => b[1] - a[1]).slice(0, 3),
      genres: Object.entries(counters.genres).sort((a,b) => b[1] - a[1]),
      statusDist: counters.status,
      mensal: counters.monthly,
      formatos: counters.formats
    };
  }, [books]);

  function calculateDays(start?: string | null, end?: string | null) {
    if (!start) return null;
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();
    return Math.ceil(Math.abs(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  // LISTAGEM FILTRADA
  const processedBooks = books
    .filter(b => 
      (b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
       b.author.toLowerCase().includes(searchTerm.toLowerCase())) && 
      (filterStatus === 'Todos' || b.status === filterStatus)
    )
    .sort((a, b) => {
      if (sortBy === 'rating') return (Number(b.rating) || 0) - (Number(a.rating) || 0);
      return 0; 
    });

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
          ...prev, 
          title: info.title || prev.title, 
          author: info.authors?.join(', ') || '',
          publisher: info.publisher || '', 
          total_pages: info.pageCount || 0,
          cover_url: info.imageLinks?.thumbnail?.replace('http:', 'https:') || '',
        }));
      }
    } catch (e) { alert('Erro na busca.'); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = { ...formData, rating: editingBookId ? formData.rating : 0 };
      if (editingBookId) {
        await supabase.from('books').update(payload).eq('id', editingBookId);
      } else {
        await supabase.from('books').insert([payload]);
      }
      setIsModalOpen(false);
      refreshBooks();
    } catch (e: any) { 
      alert(e.message); 
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-200">
              <Library className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 hidden md:block">Gestor de Leituras</h1>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setCurrentView('library')} 
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase flex items-center gap-2 transition-all ${currentView === 'library' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
            >
              <LayoutGrid className="w-4 h-4"/> Biblioteca
            </button>
            <button 
              onClick={() => setCurrentView('analytics')} 
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase flex items-center gap-2 transition-all ${currentView === 'analytics' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
            >
              <PieChart className="w-4 h-4"/> Relatórios
            </button>
          </div>

          <button 
            onClick={() => { 
              setEditingBookId(null); 
              setFormData({ 
                title: '', 
                author: '', 
                author_nationality: '', 
                publisher: '', 
                total_pages: 0, 
                read_pages: 0, 
                cover_url: '', 
                format: 'Físico', 
                status: 'Na Fila' as BookStatus,
                rating: 0, 
                finished_at: '', 
                started_at: '', 
                genre: 'Outros', 
                is_bestseller: false, 
                platform: 'Físico', 
                interruption_reason: '' 
              }); 
              setIsModalOpen(true); 
            }} 
            className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-5 h-5" /> 
            <span className="hidden lg:inline">Novo</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        
        {/* KPI DASHBOARD */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-100 flex flex-col justify-between">
            <div className="bg-violet-50 p-2.5 rounded-xl w-fit text-violet-600 mb-2">
              <Book className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-black">{stats.totalBooks}</p>
              <p className="text-xs font-bold text-slate-400">Total</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-slate-100 flex flex-col justify-between">
            <div className="bg-amber-50 p-2.5 rounded-xl w-fit text-amber-600 mb-2">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-black">{stats.bestSellers}</p>
              <p className="text-xs font-bold text-slate-400">Best Sellers</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-slate-100 flex flex-col justify-between">
            <div className="bg-blue-50 p-2.5 rounded-xl w-fit text-blue-600 mb-2">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-black">{stats.totalReadPages.toLocaleString()}</p>
              <p className="text-xs font-bold text-slate-400">Páginas</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-slate-100 flex flex-col justify-between">
            <div className="bg-slate-100 p-2.5 rounded-xl w-fit text-slate-600 mb-2">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-black">{stats.queueBooks}</p>
              <p className="text-xs font-bold text-slate-400">Na Fila</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-slate-100 flex flex-col justify-between">
            <div className="bg-emerald-50 p-2.5 rounded-xl w-fit text-emerald-600 mb-2">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-black">{stats.completedBooks}</p>
              <p className="text-xs font-bold text-slate-400">Concluídos</p>
            </div>
          </div>
        </div>

        {currentView === 'library' ? (
          <>
            {/* BIBLIOTECA */}
            <div className="bg-white p-2 rounded-[1.5rem] border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  className="w-full h-full bg-transparent pl-12 pr-4 font-semibold outline-none text-slate-700" 
                  placeholder="Pesquisar..." 
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)} 
                />
              </div>
              <div className="flex items-center gap-2 px-2">
                {(['Todos', 'Na Fila', 'Lendo', 'Concluído', 'Abandonado'] as FilterStatus[]).map((s) => (
                  <button 
                    key={s} 
                    onClick={() => setFilterStatus(s)} 
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase ${filterStatus === s ? 'bg-slate-900 text-white' : 'text-slate-500'}`}
                  >
                    {s}
                  </button>
                ))}
                <div className="relative">
                  <select 
                    className="appearance-none bg-slate-50 pl-4 pr-10 py-3 rounded-xl text-xs font-bold uppercase text-slate-600 outline-none" 
                    value={sortBy} 
                    onChange={e => setSortBy(e.target.value as 'recent' | 'rating')}
                  >
                    <option value="recent">Recentes</option>
                    <option value="rating">Melhores Notas</option>
                  </select>
                  <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-500">
              {processedBooks.map(book => {
                const daysCount = calculateDays(book.started_at, book.finished_at);
                return (
                  <div key={book.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 flex gap-6 relative overflow-hidden group shadow-sm hover:shadow-md transition-all">
                    {book.is_bestseller && (
                      <div className="absolute top-0 right-0 bg-amber-400 text-amber-900 text-[9px] font-black px-3 py-1 rounded-bl-xl flex items-center gap-1">
                        <Award className="w-3 h-3"/> Best Seller
                      </div>
                    )}
                    <div className="w-24 h-36 bg-slate-100 rounded-xl overflow-hidden shrink-0 shadow-sm">
                      {book.cover_url ? (
                        <img src={book.cover_url} className="w-full h-full object-cover" alt={book.title} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookMarked className="text-slate-300 w-8 h-8"/>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 py-1 min-w-0">
                      <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md border mb-1 block w-fit ${genreColors[book.genre || 'Outros'] || genreColors['Outros']}`}>
                        {book.genre}
                      </span>
                      <h3 className="font-bold text-lg leading-tight truncate">{book.title}</h3>
                      <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                        {(() => {
                          const nat = book.author_nationality?.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "") || '';
                          return countryFlags[nat] ? (
                            <span title={book.author_nationality}>{countryFlags[nat]}</span>
                          ) : (
                            <Globe className="w-3 h-3" />
                          );
                        })()}
                        {book.author}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-4 items-center">
                        <span className={`text-[10px] font-black px-2 py-1 rounded uppercase ${book.status === 'Concluído' ? 'bg-emerald-50 text-emerald-600' : book.status === 'Abandonado' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                          {book.status}
                        </span>
                        {(book.rating || 0) > 0 && (
                          <div className="flex gap-0.5 items-center bg-amber-50 px-2 rounded">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400"/>
                            <span className="text-[10px] font-bold text-amber-600">{book.rating}</span>
                          </div>
                        )}
                        {book.status === 'Concluído' && daysCount && (
                          <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3"/> {daysCount} dias
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { 
                          setEditingBookId(book.id); 
                          setFormData(book as any); 
                          setIsModalOpen(true); 
                        }} 
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => { 
                          if(confirm('Excluir?')) {
                            supabase.from('books').delete().eq('id', book.id).then(refreshBooks);
                          }
                        }} 
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            {/* ANALYTICS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="text-blue-600 mb-2">
                  <Calendar className="w-5 h-5"/>
                </div>
                <p className="text-xs font-bold uppercase text-slate-400 mb-1">Lidos no Ano</p>
                <p className="text-3xl font-black text-slate-900">{analytics.totalLidosAno}</p>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="text-emerald-600 mb-2">
                  <Hash className="w-5 h-5"/>
                </div>
                <p className="text-xs font-bold uppercase text-slate-400 mb-1">Páginas no Ano</p>
                <p className="text-3xl font-black text-slate-900">{analytics.paginasLidasAno.toLocaleString()}</p>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="text-orange-600 mb-2">
                  <Timer className="w-5 h-5"/>
                </div>
                <p className="text-xs font-bold uppercase text-slate-400 mb-1">Média Dias/Livro</p>
                <p className="text-3xl font-black text-slate-900">{analytics.tempoMedio}d</p>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="text-purple-600 mb-2">
                  <Book className="w-5 h-5"/>
                </div>
                <p className="text-xs font-bold uppercase text-slate-400 mb-1">Média Páginas</p>
                <p className="text-3xl font-black text-slate-900">{analytics.mediaPaginas}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <h2 className="text-sm font-black uppercase text-slate-900 mb-6 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600"/> Autores Favoritos
                </h2>
                <div className="space-y-4">
                  {analytics.topAuthors.map(([name, count]) => (
                    <div key={name} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="font-bold text-sm truncate pr-2">{name}</span>
                      <span className="bg-white px-2 py-1 rounded-md text-xs font-black shadow-sm">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <h2 className="text-sm font-black uppercase text-slate-900 mb-6 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600"/> Países de Origem
                </h2>
                <div className="space-y-4">
                  {analytics.topCountries.map(([name, count]) => (
                    <div key={name} className="flex justify-between items-center">
                      <span className="text-sm font-medium flex items-center gap-2">
                        {countryFlags[name] || '🏳️'} {name.toUpperCase()}
                      </span>
                      <span className="font-bold text-slate-400">{count} livros</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <h2 className="text-sm font-black uppercase text-slate-900 mb-6 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600"/> Status Geral
                </h2>
                <div className="space-y-4">
                  {Object.entries(analytics.statusDist).map(([name, count]) => (
                    <div key={name} className="flex justify-between items-center text-sm">
                      <span className="font-medium text-slate-500">{name}</span>
                      <span className="font-bold">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <h2 className="text-sm font-black uppercase text-slate-900 mb-8 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600"/> Evolução Mensal
                </h2>
                <div className="flex items-end justify-between h-32 gap-2">
                  {analytics.mensal.map((count, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div 
                        className="w-full bg-blue-100 rounded-t-lg transition-all hover:bg-blue-600 relative group" 
                        style={{ 
                          height: `${(count / (Math.max(...analytics.mensal) || 1)) * 100}%`, 
                          minHeight: '4px' 
                        }}
                      >
                        {count > 0 && (
                          <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-black opacity-0 group-hover:opacity-100 transition-opacity">
                            {count}
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">
                        {['J','F','M','A','M','J','J','A','S','O','N','D'][i]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <h2 className="text-sm font-black uppercase text-slate-900 mb-6 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-emerald-600"/> Gêneros
                </h2>
                <div className="space-y-6">
                  {analytics.genres.slice(0, 4).map(([name, count]) => (
                    <div key={name}>
                      <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                        <span>{name}</span>
                        <span>{Math.round((count / books.length) * 100)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-slate-800 h-full rounded-full" 
                          style={{ width: `${(count / books.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-slate-900">{editingBookId ? 'Editar Livro' : 'Novo Livro'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-50 rounded-full">
                <X className="w-5 h-5"/>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2">
                <input 
                  className="flex-1 bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold outline-none" 
                  placeholder="Título do Livro" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  required 
                />
                {!editingBookId && (
                  <button 
                    type="button" 
                    onClick={searchGoogleBooks} 
                    className="bg-blue-600 text-white px-4 rounded-2xl"
                  >
                    <Sparkles className="w-5 h-5"/>
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input 
                  className="bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold outline-none" 
                  placeholder="Autor" 
                  value={formData.author} 
                  onChange={e => setFormData({...formData, author: e.target.value})} 
                />
                <input 
                  className="bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold outline-none" 
                  placeholder="País (Ex: Brasil)" 
                  value={formData.author_nationality} 
                  onChange={e => setFormData({...formData, author_nationality: e.target.value})} 
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 ml-1 flex items-center gap-1">
                  <ImageIcon className="w-3 h-3"/> Capa
                </label>
                <div className="flex gap-4">
                  {formData.cover_url && (
                    <img src={formData.cover_url} className="w-12 h-16 rounded-md object-cover border border-slate-200 shadow-sm" alt="Preview" />
                  )}
                  <div className="relative flex-1">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                      className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl pl-10 pr-4 py-3 text-xs font-medium text-slate-600 outline-none transition-all" 
                      value={formData.cover_url} 
                      onChange={e => setFormData({...formData, cover_url: e.target.value})} 
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 ml-1 flex items-center gap-1">
                    <PlayCircle className="w-3 h-3"/> Início
                  </label>
                  <input 
                    type="date" 
                    className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-bold outline-none" 
                    value={formData.started_at} 
                    onChange={e => setFormData({...formData, started_at: e.target.value})} 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 ml-1 flex items-center gap-1">
                    <StopCircle className="w-3 h-3"/> Fim
                  </label>
                  <input 
                    type="date" 
                    className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-bold outline-none" 
                    value={formData.finished_at} 
                    onChange={e => setFormData({...formData, finished_at: e.target.value})} 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 ml-1 block mb-1">Formato</label>
                  <select 
                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold appearance-none outline-none" 
                    value={formData.format} 
                    onChange={e => setFormData({...formData, format: e.target.value})}
                  >
                    <option value="Físico">Físico</option>
                    <option value="E-book">E-book</option>
                    <option value="Audiobook">Audiobook</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 ml-1 block mb-1">Status</label>
                  <select 
                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold appearance-none outline-none" 
                    value={formData.status} 
                    onChange={e => setFormData({...formData, status: e.target.value as BookStatus})}
                  >
                    <option value="Na Fila">Na Fila</option>
                    <option value="Lendo">Lendo</option>
                    <option value="Concluído">Concluído</option>
                    <option value="Abandonado">Abandonado</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 ml-1 block mb-1">Gênero</label>
                  <select 
                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold appearance-none outline-none" 
                    value={formData.genre} 
                    onChange={e => setFormData({...formData, genre: e.target.value})}
                  >
                    <option value="Outros">Outros</option>
                    <option value="Ficção">Ficção</option>
                    <option value="Romance">Romance</option>
                    <option value="Fantasia">Fantasia</option>
                    <option value="Ciência">Ciência</option>
                    <option value="Clássicos">Clássicos</option>
                    <option value="Gestão">Gestão</option>
                    <option value="Estratégia">Estratégia</option>
                    <option value="Liderança">Liderança</option>
                    <option value="Filosofia">Filosofia</option>
                    <option value="Autoajuda">Autoajuda</option>
                    <option value="RH">RH</option>
                    <option value="Sociologia">Sociologia</option>
                    <option value="Economia">Economia</option>
                    <option value="Finanças">Finanças</option>
                    <option value="Negociação">Negociação</option>
                    <option value="Tecnologia">Tecnologia</option>
                    <option value="Direito">Direito</option>
                    <option value="História">História</option>
                    <option value="Biografia">Biografia</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 ml-1 block mb-1">Best Seller?</label>
                  <select 
                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold appearance-none outline-none" 
                    value={formData.is_bestseller ? 'sim' : 'não'} 
                    onChange={e => setFormData({...formData, is_bestseller: e.target.value === 'sim'})}
                  >
                    <option value="não">Não</option>
                    <option value="sim">Sim</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="number" 
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold outline-none" 
                  placeholder="Total Páginas" 
                  value={formData.total_pages} 
                  onChange={e => setFormData({...formData, total_pages: Number(e.target.value)})} 
                />
                <input 
                  type="number" 
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold outline-none" 
                  placeholder="Lidas" 
                  value={formData.read_pages} 
                  onChange={e => setFormData({...formData, read_pages: Number(e.target.value)})} 
                />
              </div>
              {formData.status === 'Abandonado' && (
                <input 
                  className="w-full bg-red-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-red-600 outline-none" 
                  placeholder="Motivo da interrupção?" 
                  value={formData.interruption_reason} 
                  onChange={e => setFormData({...formData, interruption_reason: e.target.value})} 
                />
              )}
              <button 
                type="submit" 
                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-blue-600 transition-colors"
              >
                Salvar Dados
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}