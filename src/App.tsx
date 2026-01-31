import { useState, useMemo } from 'react'
import { useBooks } from './contexts/BookContext'
import { supabase } from './lib/supabase'
import { 
  Library, Plus, Trash2, CheckCircle2, 
  BookMarked, X, Pencil, Search, ArrowUpDown, Sparkles, Star, Trophy, Globe, Link as LinkIcon, Image as ImageIcon,
  Layers, Book, PlayCircle, StopCircle, Timer, Award, PieChart, LayoutGrid, Calendar, MapPin, User, Hash, AlertTriangle, Monitor, TrendingUp, Tag
} from 'lucide-react'

// 🌍 MAPA-MÚNDI COMPLETO (TODAS AS NACIONALIDADES)
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

type BookStatus = 'Lendo' | 'Na Fila' | 'Concluído' | 'Abandonado';
type FilterStatus = BookStatus | 'Todos';

function isBookStatus(status: string): status is BookStatus {
  return ['Lendo', 'Na Fila', 'Concluído', 'Abandonado'].includes(status);
}

export default function App() {
  const { books, refreshBooks } = useBooks()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBookId, setEditingBookId] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<'library' | 'analytics'>('library')
  
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
    const finishedThisYear = books.filter(b => b.status === 'Concluído' && b.finished_at && new Date(b.finished_at).getFullYear() === currentYear);
    
    const counters = {
      authors: {} as Record<string, number>,
      countries: {} as Record<string, number>,
      genres: {} as Record<string, number>,
      formats: {} as Record<string, number>,
      status: { 'Na Fila': 0, 'Lendo': 0, 'Concluído': 0, 'Abandonado': 0 } as Record<string, number>,
      monthly: Array(12).fill(0)
    };

    books.forEach(b => {
      if (b.author) counters.authors[b.author] = (counters.authors[b.author] || 0) + 1;
      if (b.author_nationality) {
          const nat = b.author_nationality.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          counters.countries[nat] = (counters.countries[nat] || 0) + 1;
      }
      if (b.genre) counters.genres[b.genre] = (counters.genres[b.genre] || 0) + 1;
      if (b.format) counters.formats[b.format] = (counters.formats[b.format] || 0) + 1;
      
      const s = b.status || 'Na Fila';
      if (isBookStatus(s) && counters.status[s] !== undefined) counters.status[s]++;

      if (b.status === 'Concluído' && b.finished_at) {
        const date = new Date(b.finished_at);
        if (date.getFullYear() === currentYear) counters.monthly[date.getMonth()]++;
      }
    });

    let totalDuration = 0;
    let booksWithDuration = 0;
    books.forEach(b => {
        if (b.status === 'Concluído' && b.finished_at && b.started_at) {
            const start = new Date(b.started_at);
            const end = new Date(b.finished_at);
            const diff = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
            totalDuration += diff;
            booksWithDuration++;
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

  function calculateReadPercentage(totalPages: number, readPages: number): number {
    if (totalPages <= 0) return 0;
    return Math.min(100, Math.round((readPages / totalPages) * 100));
  }

  const processedBooks = books
    .filter(b => (b.title.toLowerCase().includes(searchTerm.toLowerCase()) || b.author.toLowerCase().includes(searchTerm.toLowerCase())) && (filterStatus === 'Todos' || b.status === filterStatus))
    .sort((a, b) => sortBy === 'rating' ? (Number(b.rating) || 0) - (Number(a.rating) || 0) : 0);

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
      let result;
      if (editingBookId) result = await supabase.from('books').update(payload).eq('id', editingBookId);
      else result = await supabase.from('books').insert([payload]);
      if (result.error) throw result.error;
      setIsModalOpen(false); refreshBooks(); alert('Livro salvo!');
    } catch (e: any) { alert('Erro ao salvar: ' + e.message); }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <header className="bg-white border-b border-slate-200 h-20 flex items-center justify-between px-6 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white"><Library /></div>
          <h1 className="text-xl font-bold">Gestor de Leituras</h1>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button onClick={() => setCurrentView('library')} className={`px-4 py-2 rounded-lg text-xs font-bold ${currentView === 'library' ? 'bg-white shadow-sm' : 'text-slate-500'}`}>BIBLIOTECA</button>
          <button onClick={() => setCurrentView('analytics')} className={`px-4 py-2 rounded-lg text-xs font-bold ${currentView === 'analytics' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>RELATÓRIOS</button>
        </div>
        <button onClick={() => { setEditingBookId(null); setIsModalOpen(true); }} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-600 transition-all"><Plus /> Novo</button>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-100"><Book className="text-violet-600 mb-2"/><p className="text-2xl font-black">{stats.totalBooks}</p><p className="text-xs text-slate-400 font-bold">Total</p></div>
          <div className="bg-white p-5 rounded-3xl border border-slate-100"><Award className="text-amber-600 mb-2"/><p className="text-2xl font-black">{stats.bestSellers}</p><p className="text-xs text-slate-400 font-bold">Best Sellers</p></div>
          <div className="bg-white p-5 rounded-3xl border border-slate-100"><Trophy className="text-blue-600 mb-2"/><p className="text-2xl font-black">{stats.totalReadPages}</p><p className="text-xs text-slate-400 font-bold">Páginas</p></div>
          <div className="bg-white p-5 rounded-3xl border border-slate-100"><Layers className="text-slate-600 mb-2"/><p className="text-2xl font-black">{stats.queueBooks}</p><p className="text-xs text-slate-400 font-bold">Na Fila</p></div>
          <div className="bg-white p-5 rounded-3xl border border-slate-100"><CheckCircle2 className="text-emerald-600 mb-2"/><p className="text-2xl font-black">{stats.completedBooks}</p><p className="text-xs text-slate-400 font-bold">Concluídos</p></div>
        </div>

        {currentView === 'library' ? (
          <>
            <div className="bg-white p-2 rounded-[1.5rem] border border-slate-200 flex flex-col lg:flex-row gap-2">
              <div className="relative flex-1"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5"/><input className="w-full pl-12 pr-4 font-semibold outline-none" placeholder="Pesquisar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/></div>
              <div className="flex gap-2">
                {['Todos', 'Na Fila', 'Lendo', 'Concluído', 'Abandonado'].map((s) => (<button key={s} onClick={() => setFilterStatus(s as any)} className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase ${filterStatus === s ? 'bg-slate-900 text-white' : 'text-slate-500'}`}>{s}</button>))}
                <select className="bg-slate-50 px-4 rounded-xl text-xs font-bold uppercase outline-none" value={sortBy} onChange={e => setSortBy(e.target.value as any)}><option value="recent">Recentes</option><option value="rating">Melhores Notas</option></select>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {processedBooks.map(book => {
                const perc = calculateReadPercentage(book.total_pages, book.read_pages);
                return (
                  <div key={book.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 flex gap-6 relative group shadow-sm hover:shadow-md transition-all">
                    <div className="w-24 h-36 bg-slate-100 rounded-xl overflow-hidden shrink-0">{book.cover_url && <img src={book.cover_url} className="w-full h-full object-cover" />}</div>
                    <div className="flex-1 py-1">
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md border mb-1 block w-fit ${genreColors[book.genre || 'Outros'] || genreColors['Outros']}`}>{book.genre}</span>
                      <h3 className="font-bold text-lg truncate">{book.title}</h3>
                      <p className="text-sm text-slate-500">{countryFlags[book.author_nationality?.toLowerCase()] || '🏳️'} {book.author}</p>
                      <div className="mt-4"><div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1"><span>Progresso</span><span>{perc}%</span></div><div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden"><div className="h-full bg-blue-500" style={{ width: `${perc}%` }}></div></div></div>
                    </div>
                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all"><button onClick={() => { setEditingBookId(book.id); setFormData(book as any); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:text-blue-600"><Pencil size={16}/></button><button onClick={() => { if(confirm('Excluir?')) supabase.from('books').delete().eq('id', book.id).then(refreshBooks); }} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={16}/></button></div>
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-3xl border shadow-sm"><Calendar className="text-blue-600 mb-2"/><p className="text-xs font-bold text-slate-400 uppercase">Lidos no Ano</p><p className="text-3xl font-black">{analytics.totalLidosAno}</p></div>
              <div className="bg-white p-6 rounded-3xl border shadow-sm"><Hash className="text-emerald-600 mb-2"/><p className="text-xs font-bold text-slate-400 uppercase">Páginas no Ano</p><p className="text-3xl font-black">{analytics.paginasLidasAno}</p></div>
              <div className="bg-white p-6 rounded-3xl border shadow-sm"><Timer className="text-orange-600 mb-2"/><p className="text-xs font-bold text-slate-400 uppercase">Média Dias/Livro</p><p className="text-3xl font-black">{analytics.tempoMedio}d</p></div>
              <div className="bg-white p-6 rounded-3xl border shadow-sm"><Book className="text-purple-600 mb-2"/><p className="text-xs font-bold text-slate-400 uppercase">Média Páginas</p><p className="text-3xl font-black">{analytics.mediaPaginas}</p></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm"><h2 className="text-sm font-black uppercase mb-6 flex items-center gap-2"><User size={16} className="text-blue-600"/> Autores</h2>{analytics.topAuthors.map(([name, count]) => (<div key={name} className="flex justify-between items-center mb-4"><span className="text-sm font-bold">{name}</span><span className="bg-slate-50 px-2 py-1 rounded text-xs font-black">{count}</span></div>))}</div>
              <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm"><h2 className="text-sm font-black uppercase mb-6 flex items-center gap-2"><Globe size={16} className="text-emerald-600"/> Países</h2>{analytics.topCountries.map(([name, count]) => (<div key={name} className="flex justify-between items-center mb-4"><span className="text-sm font-medium">{countryFlags[name] || '🏳️'} {name.toUpperCase()}</span><span className="font-bold text-slate-400">{count}</span></div>))}</div>
              <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm"><h2 className="text-sm font-black uppercase mb-6 flex items-center gap-2"><Monitor size={16} className="text-orange-600"/> Formatos</h2>{Object.entries(analytics.formatos).map(([name, count]) => (<div key={name} className="mb-4"><div className="flex justify-between text-[10px] font-black uppercase mb-1"><span>{name}</span><span>{count}</span></div><div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden"><div className="bg-slate-800 h-full" style={{ width: `${(count / books.length) * 100}%` }}></div></div></div>))}</div>
            </div>
          </div>
        )}
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-black">{editingBookId ? 'Editar Livro' : 'Novo Livro'}</h2><button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-50 rounded-full"><X/></button></div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2"><input className="flex-1 bg-slate-50 rounded-2xl px-5 py-4 font-bold outline-none" placeholder="Título" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required/><button type="button" onClick={searchGoogleBooks} className="bg-blue-600 text-white px-4 rounded-2xl"><Sparkles/></button></div>
              <div className="grid grid-cols-2 gap-4"><input className="bg-slate-50 rounded-2xl px-5 py-4 text-sm font-bold outline-none" placeholder="Autor" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})}/><input className="bg-slate-50 rounded-2xl px-5 py-4 text-sm font-bold outline-none" placeholder="País (Ex: Brasil)" value={formData.author_nationality} onChange={e => setFormData({...formData, author_nationality: e.target.value})}/></div>
              <div className="space-y-1"><label className="text-xs font-bold text-slate-500 ml-1 flex items-center gap-1"><Tag size={12}/> Gênero</label><select className="w-full bg-slate-50 rounded-2xl px-5 py-4 text-sm font-bold outline-none appearance-none" value={formData.genre} onChange={e => setFormData({...formData, genre: e.target.value})}><optgroup label="Negócios"><option>Gestão</option><option>Estratégia</option><option>Vendas</option><option>Finanças</option></optgroup><optgroup label="Literatura"><option>Ficção</option><option>Romance</option><option>História</option><option>Outros</option></optgroup></select></div>
              <div className="grid grid-cols-2 gap-4"><div className="space-y-1"><label className="text-xs font-bold text-slate-500 ml-1 flex items-center gap-1"><PlayCircle size={12}/> Início</label><input type="date" className="w-full bg-slate-50 rounded-2xl px-4 py-3 text-sm font-bold outline-none" value={formData.started_at} onChange={e => setFormData({...formData, started_at: e.target.value})}/></div><div className="space-y-1"><label className="text-xs font-bold text-slate-500 ml-1 flex items-center gap-1"><StopCircle size={12}/> Fim</label><input type="date" className="w-full bg-slate-50 rounded-2xl px-4 py-3 text-sm font-bold outline-none" value={formData.finished_at} onChange={e => setFormData({...formData, finished_at: e.target.value})}/></div></div>
              <div className="grid grid-cols-2 gap-4"><select className="bg-slate-50 rounded-2xl px-5 py-4 text-sm font-bold outline-none" value={formData.format} onChange={e => setFormData({...formData, format: e.target.value})}><option>Físico</option><option>E-book</option><option>Audiobook</option></select><select className="bg-slate-50 rounded-2xl px-5 py-4 text-sm font-bold outline-none" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}><option>Na Fila</option><option>Lendo</option><option>Concluído</option><option>Abandonado</option></select></div>
              <div className="grid grid-cols-2 gap-4"><input type="number" className="bg-slate-50 rounded-2xl px-5 py-4 font-bold outline-none" placeholder="Páginas" value={formData.total_pages} onChange={e => setFormData({...formData, total_pages: Number(e.target.value)})}/><input type="number" className="bg-slate-50 rounded-2xl px-5 py-4 font-bold outline-none" placeholder="Lidas" value={formData.read_pages} onChange={e => setFormData({...formData, read_pages: Number(e.target.value)})}/></div>
              {formData.status === 'Abandonado' && <input className="w-full bg-red-50 text-red-600 rounded-2xl px-5 py-4 text-sm font-bold outline-none" placeholder="Motivo?" value={formData.interruption_reason} onChange={e => setFormData({...formData, interruption_reason: e.target.value})}/>}
              <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase shadow-xl hover:bg-blue-600 transition-all">Salvar Dados</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}