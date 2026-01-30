import { useState, useMemo } from 'react'
import { useBooks } from './contexts/BookContext'
import { supabase } from './lib/supabase'
import { 
  Library, Plus, Trash2, CheckCircle2, 
  BookMarked, X, Pencil, Search, ArrowUpDown, Sparkles, Star, Trophy, Globe, Link as LinkIcon, Image as ImageIcon,
  BookOpen, Layers, Book, PlayCircle, StopCircle, Timer
} from 'lucide-react'

// 🌍 MAPA-MÚNDI
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

// 🏷️ CORES DAS CATEGORIAS
const genreColors: Record<string, string> = {
  'Ficção': 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100',
  'Romance': 'bg-rose-50 text-rose-700 border-rose-100',
  'Fantasia': 'bg-purple-50 text-purple-700 border-purple-100',
  'Sci-Fi': 'bg-indigo-50 text-indigo-700 border-indigo-100',
  'Terror': 'bg-slate-900 text-slate-50 border-slate-700',
  'Clássicos': 'bg-amber-100 text-amber-800 border-amber-200',
  'HQ/Mangá': 'bg-pink-50 text-pink-700 border-pink-100',
  'Tecnologia': 'bg-cyan-50 text-cyan-700 border-cyan-100',
  'Programação': 'bg-blue-50 text-blue-700 border-blue-100',
  'Data Science': 'bg-sky-50 text-sky-700 border-sky-100',
  'Design': 'bg-violet-50 text-violet-700 border-violet-100',
  'Ciência': 'bg-teal-50 text-teal-700 border-teal-100',
  'Finanças': 'bg-emerald-50 text-emerald-700 border-emerald-100',
  'Economia': 'bg-green-50 text-green-700 border-green-100',
  'Gestão': 'bg-lime-50 text-lime-700 border-lime-100',
  'Marketing': 'bg-orange-50 text-orange-700 border-orange-100',
  'Empreendedorismo': 'bg-yellow-50 text-yellow-700 border-yellow-100',
  'Liderança': 'bg-blue-50 text-blue-800 border-blue-200',
  'Produtividade': 'bg-red-50 text-red-700 border-red-100',
  'Filosofia': 'bg-amber-50 text-amber-700 border-amber-100',
  'História': 'bg-stone-100 text-stone-700 border-stone-200',
  'Psicologia': 'bg-rose-100 text-rose-800 border-rose-200',
  'Política': 'bg-slate-200 text-slate-700 border-slate-300',
  'Direito': 'bg-slate-100 text-slate-800 border-slate-200',
  'Educação': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Espiritualidade': 'bg-violet-100 text-violet-800 border-violet-200',
  'Biografia': 'bg-gray-100 text-gray-700 border-gray-200',
  'Autoajuda': 'bg-orange-100 text-orange-800 border-orange-200',
  'Saúde': 'bg-green-100 text-green-800 border-green-200',
  'Esportes': 'bg-blue-100 text-blue-800 border-blue-200',
  'Viagem': 'bg-sky-100 text-sky-800 border-sky-200',
  'Arte': 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200',
  'Outros': 'bg-gray-50 text-gray-600 border-gray-100'
};

export default function App() {
  const { books, refreshBooks } = useBooks()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBookId, setEditingBookId] = useState<string | null>(null)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('Todos')
  const [sortBy, setSortBy] = useState<'recent' | 'rating'>('recent')

  const [formData, setFormData] = useState({
    title: '', author: '', author_nationality: '', publisher: '',
    total_pages: 0, read_pages: 0, cover_url: '', format: 'Físico',
    status: 'Na Fila' as const, rating: 0, finished_at: '', started_at: '',
    genre: 'Outros'
  })

  // 📊 DASHBOARD
  const stats = useMemo(() => ({
    totalBooks: books.length,
    totalReadPages: books.reduce((acc, b) => acc + (b.read_pages || 0), 0),
    completedBooks: books.filter(b => b.status === 'Concluído').length,
    readingBooks: books.filter(b => b.status === 'Lendo').length,
    queueBooks: books.filter(b => b.status === 'Na Fila').length
  }), [books]);

  function calculateDays(start?: string | null, end?: string | null) {
    if (!start) return null;
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  }

  async function searchGoogleBooks() {
    const query = formData.title.trim();
    if (!query) return alert('Digite o título!');
    
    const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_KEY;
    if (!API_KEY || API_KEY.includes('COLE_AQUI')) return alert('Chave do Google não configurada no .env.local');

    try {
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${API_KEY}&maxResults=1`);
      const data = await response.json();
      if (data.items?.[0]) {
        const info = data.items[0].volumeInfo;
        
        let detectedGenre = 'Outros';
        const cats = info.categories ? info.categories[0].toLowerCase() : '';
        if (cats.includes('fiction')) detectedGenre = 'Ficção';
        if (cats.includes('business') || cats.includes('economics')) detectedGenre = 'Finanças';
        if (cats.includes('history')) detectedGenre = 'História';
        if (cats.includes('biography')) detectedGenre = 'Biografia';
        if (cats.includes('psychology')) detectedGenre = 'Psicologia';
        if (cats.includes('computer') || cats.includes('technology')) detectedGenre = 'Tecnologia';

        setFormData(prev => ({
          ...prev, 
          title: info.title || prev.title, 
          author: info.authors?.join(', ') || '',
          publisher: info.publisher || '', 
          total_pages: info.pageCount || 0,
          genre: detectedGenre,
          cover_url: info.imageLinks?.thumbnail?.replace('http:', 'https:') || '',
        }));
      } else {
        alert('Livro não encontrado. Tente ser mais específico (Título + Autor).');
      }
    } catch (e) { console.error(e); alert('Erro na conexão com o Google.'); }
  }

  const processedBooks = books
    .filter(b => (b.title.toLowerCase().includes(searchTerm.toLowerCase()) || b.author.toLowerCase().includes(searchTerm.toLowerCase())) && (filterStatus === 'Todos' || b.status === filterStatus))
    .sort((a, b) => {
      if (sortBy === 'rating') return (Number(b.rating) || 0) - (Number(a.rating) || 0);
      return 0; 
    });

  function handleEdit(book: any) {
    setEditingBookId(book.id);
    setFormData({ 
      title: book.title, author: book.author, author_nationality: book.author_nationality || '', 
      publisher: book.publisher || '', total_pages: book.total_pages, 
      read_pages: book.read_pages || 0, cover_url: book.cover_url || '', 
      format: book.format || 'Físico', status: book.status, 
      rating: Number(book.rating) || 0, finished_at: book.finished_at || '', started_at: book.started_at || '',
      genre: book.genre || 'Outros'
    });
    setIsModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
        ...formData,
        finished_at: formData.finished_at ? formData.finished_at : null,
        started_at: formData.started_at ? formData.started_at : null,
        rating: editingBookId ? formData.rating : 0
    };
    
    try {
      if (editingBookId) {
        await supabase.from('books').update(payload).eq('id', editingBookId);
      } else {
        await supabase.from('books').insert([payload]);
      }
      setIsModalOpen(false); 
      setEditingBookId(null); 
      setFormData({ title: '', author: '', author_nationality: '', publisher: '', total_pages: 0, read_pages: 0, cover_url: '', format: 'Físico', status: 'Na Fila', rating: 0, finished_at: '', started_at: '', genre: 'Outros' });
      refreshBooks();
    } catch (e: any) { alert(`Erro ao salvar: ${e.message}`); }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30/bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-600/20"><Library className="text-white w-6 h-6" /></div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">Gestor de Leituras</h1>
              <div className="flex items-center gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Online • Deivid Matos</p>
              </div>
            </div>
          </div>
          <button onClick={() => { setEditingBookId(null); setIsModalOpen(true); }} className="group bg-slate-900 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-xl shadow-slate-900/10 hover:shadow-blue-600/20 active:scale-95">
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> <span className="hidden sm:inline">Novo Livro</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        
        {/* DASHBOARD */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between hover:border-violet-100 transition-colors group">
            <div className="flex justify-between items-start mb-2"><div className="bg-violet-50 p-2.5 rounded-xl text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition-colors"><Book className="w-5 h-5" /></div></div>
            <div><p className="text-2xl font-black text-slate-800 tracking-tight">{stats.totalBooks}</p><p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Acervo Total</p></div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between hover:border-blue-100 transition-colors group">
            <div className="flex justify-between items-start mb-2"><div className="bg-blue-50 p-2.5 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors"><Trophy className="w-5 h-5" /></div></div>
            <div><p className="text-2xl font-black text-slate-800 tracking-tight">{stats.totalReadPages.toLocaleString()}</p><p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Páginas Lidas</p></div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between hover:border-amber-100 transition-colors group">
            <div className="flex justify-between items-start mb-2"><div className="bg-amber-50 p-2.5 rounded-xl text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors"><BookOpen className="w-5 h-5" /></div></div>
            <div><p className="text-2xl font-black text-slate-800 tracking-tight">{stats.readingBooks}</p><p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Lendo Agora</p></div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-colors group">
            <div className="flex justify-between items-start mb-2"><div className="bg-slate-100 p-2.5 rounded-xl text-slate-600 group-hover:bg-slate-600 group-hover:text-white transition-colors"><Layers className="w-5 h-5" /></div></div>
            <div><p className="text-2xl font-black text-slate-800 tracking-tight">{stats.queueBooks}</p><p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Na Fila</p></div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between hover:border-emerald-100 transition-colors group">
            <div className="flex justify-between items-start mb-2"><div className="bg-emerald-50 p-2.5 rounded-xl text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors"><CheckCircle2 className="w-5 h-5" /></div></div>
            <div><p className="text-2xl font-black text-slate-800 tracking-tight">{stats.completedBooks}</p><p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Concluídos</p></div>
          </div>
        </div>

        {/* FERRAMENTAS */}
        <div className="bg-white p-2 rounded-[1.5rem] border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input className="w-full h-full bg-transparent pl-12 pr-4 font-semibold text-slate-700 outline-none placeholder:text-slate-400 rounded-xl hover:bg-slate-50 transition-colors" placeholder="Pesquisar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar px-2 lg:px-0">
             <div className="h-8 w-px bg-slate-200 hidden lg:block mx-2"></div>
             {['Todos', 'Na Fila', 'Lendo', 'Concluído'].map((s) => (
                <button key={s} onClick={() => setFilterStatus(s)} className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${filterStatus === s ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}>{s}</button>
              ))}
              <div className="h-8 w-px bg-slate-200 hidden lg:block mx-2"></div>
              <div className="relative group">
                <select className="appearance-none bg-slate-50 hover:bg-slate-100 pl-4 pr-10 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-600 outline-none cursor-pointer transition-colors" value={sortBy} onChange={e => setSortBy(e.target.value as any)}>
                    <option value="recent">Recentes</option><option value="rating">Melhores Notas</option>
                </select>
                <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
          </div>
        </div>

        {/* LISTAGEM DE LIVROS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {processedBooks.map(book => {
              const progress = Math.min(Math.round((book.read_pages / book.total_pages) * 100) || 0, 100);
              const daysCount = calculateDays(book.started_at, book.finished_at);
              const genre = book.genre || 'Outros';
              
              return (
                <div key={book.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300 flex gap-6 group">
                  <div className="w-28 h-40 rounded-xl shadow-lg shadow-slate-200 overflow-hidden shrink-0 transform group-hover:-translate-y-1 transition-transform duration-300 relative bg-slate-100">
                    {book.cover_url ? <img src={book.cover_url} className="w-full h-full object-cover" alt={book.title} /> : <div className="w-full h-full flex items-center justify-center bg-slate-50"><BookMarked className="text-slate-200 w-8 h-8" /></div>}
                  </div>

                  <div className="flex-1 flex flex-col justify-between min-w-0 py-1">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                         <div className="flex flex-col gap-1 min-w-0">
                            {/* TAG DE GÊNERO */}
                            <span className={`w-fit px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border mb-1 ${genreColors[genre] || genreColors['Outros']}`}>{genre}</span>
                            <h3 className="text-lg font-bold text-slate-900 leading-tight truncate pr-2" title={book.title}>{book.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                {(() => {
                                    const nation = book.author_nationality?.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "") || '';
                                    return countryFlags[nation] ? <span title={book.author_nationality}>{countryFlags[nation]}</span> : <Globe className="w-3 h-3" />;
                                })()}
                                <span className="truncate">{book.author}</span>
                            </div>
                         </div>
                         <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(book)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Pencil className="w-4 h-4" /></button>
                            <button onClick={() => { if(confirm('Excluir?')) supabase.from('books').delete().eq('id', book.id).then(refreshBooks) }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                         </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                         <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${book.status === 'Concluído' ? 'bg-emerald-100 text-emerald-700' : book.status === 'Lendo' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>{book.status}</span>
                         {(book.rating ?? 0) > 0 && <div className="flex gap-0.5">{[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < (book.rating ?? 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />)}</div>}
                         
                         {book.status === 'Lendo' && daysCount !== null && (
                            <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-wider border border-amber-100"><Timer className="w-3 h-3" /> Há {daysCount} dias</span>
                         )}
                         {book.status === 'Concluído' && daysCount !== null && (
                            <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider border border-emerald-100"><CheckCircle2 className="w-3 h-3" /> em {daysCount} dias</span>
                         )}
                      </div>
                    </div>

                    <div className="mt-4">
                        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                           <span>{book.format}</span>
                           <span>{progress}% Lido</span>
                        </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-1000 ${book.status === 'Concluído' ? 'bg-emerald-500' : 'bg-blue-600'}`} style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )
          })}
        </div>
      </main>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-[2rem] shadow-2xl overflow-hidden border border-white/20 max-h-[90vh] overflow-y-auto scrollbar-hide">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <h2 className="text-xl font-bold text-slate-800">{editingBookId ? 'Editar Livro' : 'Adicionar Livro'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 hover:text-red-500 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              {editingBookId && (
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                  <div className="flex items-center gap-3">
                     <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><PlayCircle className="w-4 h-4" /></div>
                     <div className="flex-1"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Início</label><input type="date" className="w-full bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-lg px-3 py-2 outline-none focus:border-blue-500" value={formData.started_at} onChange={e => setFormData({...formData, started_at: e.target.value})} /></div>
                  </div>
                  <div className="flex items-center gap-3">
                     <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600"><StopCircle className="w-4 h-4" /></div>
                     <div className="flex-1"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Fim</label><input type="date" className="w-full bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-lg px-3 py-2 outline-none focus:border-blue-500" value={formData.finished_at} onChange={e => setFormData({...formData, finished_at: e.target.value})} /></div>
                  </div>
                  <div className="pt-2 border-t border-slate-200/50 flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avaliação</label>
                    <div className="flex gap-1">{[1,2,3,4,5].map(s => (<button key={s} type="button" onClick={() => setFormData({...formData, rating: s})} className="hover:scale-110 transition-transform p-1"><Star className={`w-6 h-6 ${formData.rating >= s ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} /></button>))}</div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-slate-500 ml-1">Título</label>
                    <div className="flex gap-2">
                      <input required className="flex-1 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white transition-all rounded-xl px-4 py-3 font-semibold text-slate-700 outline-none" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                      {!editingBookId && <button type="button" onClick={searchGoogleBooks} className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-xl transition-all shadow-lg active:scale-95"><Sparkles className="w-5 h-5" /></button>}
                    </div>
                 </div>
                 <div className="space-y-1"><label className="text-xs font-bold text-slate-500 ml-1">Autor</label><input required className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white transition-all rounded-xl px-4 py-3 font-semibold text-slate-700 outline-none" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} /></div>
                 <div className="space-y-1"><label className="text-xs font-bold text-slate-500 ml-1">País</label><input className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white transition-all rounded-xl px-4 py-3 font-semibold text-slate-700 outline-none" value={formData.author_nationality} onChange={e => setFormData({...formData, author_nationality: e.target.value})} /></div>
              </div>

              <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 ml-1 flex items-center gap-1"><ImageIcon className="w-3 h-3"/> Capa</label>
                  <div className="flex gap-4">
                    {formData.cover_url && <img src={formData.cover_url} className="w-12 h-16 rounded-md object-cover border border-slate-200 shadow-sm" alt="Preview" />}
                    <div className="relative flex-1">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl pl-10 pr-4 py-3 text-xs font-medium text-slate-600 outline-none transition-all" value={formData.cover_url} onChange={e => setFormData({...formData, cover_url: e.target.value})} />
                    </div>
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1"><label className="text-xs font-bold text-slate-500 ml-1">Páginas</label><input type="number" className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none" value={formData.total_pages} onChange={e => setFormData({...formData, total_pages: Number(e.target.value)})} /></div>
                 <div className="space-y-1"><label className="text-xs font-bold text-blue-500 ml-1">Lidas</label><input type="number" className="w-full bg-blue-50 border border-blue-100 focus:border-blue-500 rounded-xl px-4 py-3 font-bold text-blue-700 outline-none" value={formData.read_pages} onChange={e => setFormData({...formData, read_pages: Number(e.target.value)})} /></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 ml-1">Gênero</label>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-700 outline-none cursor-pointer" value={formData.genre} onChange={e => setFormData({...formData, genre: e.target.value})}>
                        <optgroup label="Literatura">
                            <option>Ficção</option><option>Romance</option><option>Fantasia</option><option>Sci-Fi</option><option>Terror</option><option>Clássicos</option><option>HQ/Mangá</option>
                        </optgroup>
                        <optgroup label="Técnico & Tech">
                            <option>Tecnologia</option><option>Programação</option><option>Data Science</option><option>Design</option><option>Ciência</option>
                        </optgroup>
                        <optgroup label="Negócios">
                            <option>Finanças</option><option>Economia</option><option>Gestão</option><option>Marketing</option><option>Empreendedorismo</option><option>Liderança</option><option>Produtividade</option>
                        </optgroup>
                        <optgroup label="Humanas">
                            <option>Filosofia</option><option>História</option><option>Psicologia</option><option>Política</option><option>Direito</option><option>Educação</option><option>Espiritualidade</option>
                        </optgroup>
                        <optgroup label="Vida & Outros">
                            <option>Biografia</option><option>Autoajuda</option><option>Saúde</option><option>Esportes</option><option>Viagem</option><option>Arte</option><option>Outros</option>
                        </optgroup>
                    </select>
                 </div>
                 <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 ml-1">Status</label>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-700 outline-none cursor-pointer" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                        <option value="Na Fila">Na Fila</option><option value="Lendo">Lendo</option><option value="Concluído">Concluído</option>
                    </select>
                 </div>
              </div>

              <button type="submit" className="w-full bg-slate-900 hover:bg-blue-600 text-white py-4 rounded-xl font-bold text-sm tracking-wide shadow-xl shadow-slate-900/20 hover:shadow-blue-600/30 transition-all active:scale-[0.98]">{editingBookId ? 'SALVAR ALTERAÇÕES' : 'ADICIONAR À BIBLIOTECA'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}