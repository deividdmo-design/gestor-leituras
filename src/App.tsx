import { useState, useMemo } from 'react'
import { useBooks } from './contexts/BookContext'
import { supabase } from './lib/supabase'
import { 
  Library, Plus, Trash2, CheckCircle2, 
  BookMarked, X, Pencil, Search, ArrowUpDown, Sparkles, Star, Trophy, Globe, Link as LinkIcon, Image as ImageIcon,
  Layers, Book, PlayCircle, StopCircle, Timer, Award, PieChart, LayoutGrid, Calendar, MapPin, User, Hash, AlertTriangle, Monitor, TrendingUp
} from 'lucide-react'

// 🌍 MAPA-MÚNDI
const countryFlags: Record<string, string> = {
  'brasil': '🇧🇷', 'argentina': '🇦🇷', 'estados unidos': '🇺🇸', 'eua': '🇺🇸', 'portugal': '🇵🇹', 'espanha': '🇪🇸', 'franca': '🇫🇷', 'alemanha': '🇩🇪', 'reino unido': '🇬🇧', 'japao': '🇯🇵', 'china': '🇨🇳', 'israel': '🇮🇱'
};

export default function App() {
  const { books, refreshBooks } = useBooks()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBookId, setEditingBookId] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<'library' | 'analytics'>('library')
  const [searchTerm, setSearchTerm] = useState('')

  const [formData, setFormData] = useState({
    title: '', author: '', author_nationality: '', publisher: '',
    total_pages: 0, read_pages: 0, cover_url: '', format: 'Físico',
    status: 'Na Fila' as const, rating: 0, finished_at: '', started_at: '',
    genre: 'Outros', is_bestseller: false, platform: 'Físico', interruption_reason: ''
  })

  // 📊 ENGINE DE ANALYTICS
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
          const nat = b.author_nationality.toLowerCase();
          counters.countries[nat] = (counters.countries[nat] || 0) + 1;
      }
      if (b.genre) counters.genres[b.genre] = (counters.genres[b.genre] || 0) + 1;
      if (b.format) counters.formats[b.format] = (counters.formats[b.format] || 0) + 1;
      if (b.status) counters.status[b.status] = (counters.status[b.status] || 0) + 1;

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
      mensal: counters.monthly
    };
  }, [books]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingBookId) await supabase.from('books').update(formData).eq('id', editingBookId);
      else await supabase.from('books').insert([formData]);
      setIsModalOpen(false);
      refreshBooks();
    } catch (e: any) { alert(e.message); }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-200"><Library className="text-white w-6 h-6" /></div>
            <h1 className="text-xl font-bold text-slate-900 hidden md:block">Gestor de Leituras</h1>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-xl">
             <button onClick={() => setCurrentView('library')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase flex items-center gap-2 transition-all ${currentView === 'library' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}><LayoutGrid className="w-4 h-4"/> Biblioteca</button>
             <button onClick={() => setCurrentView('analytics')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase flex items-center gap-2 transition-all ${currentView === 'analytics' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}><PieChart className="w-4 h-4"/> Relatórios</button>
          </div>

          <button onClick={() => { setEditingBookId(null); setFormData({ title: '', author: '', author_nationality: '', publisher: '', total_pages: 0, read_pages: 0, cover_url: '', format: 'Físico', status: 'Na Fila', rating: 0, finished_at: '', started_at: '', genre: 'Outros', is_bestseller: false, platform: 'Físico', interruption_reason: '' }); setIsModalOpen(true); }} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-600 transition-colors"><Plus className="w-5 h-5" /> <span className="hidden lg:inline">Novo Livro</span></button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {currentView === 'library' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-500">
            {books.filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase())).map(book => (
              <div key={book.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 flex gap-6 relative overflow-hidden group shadow-sm hover:shadow-md transition-all">
                {book.is_bestseller && <div className="absolute top-0 right-0 bg-amber-400 text-amber-900 text-[9px] font-black px-3 py-1 rounded-bl-xl flex items-center gap-1"><Award className="w-3 h-3"/> Best Seller</div>}
                <div className="w-24 h-36 bg-slate-100 rounded-xl overflow-hidden shrink-0 shadow-sm">
                   {book.cover_url ? <img src={book.cover_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><BookMarked className="text-slate-300 w-8 h-8"/></div>}
                </div>
                <div className="flex-1 py-1 min-w-0">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">{book.genre}</span>
                  <h3 className="font-bold text-lg mt-1 truncate">{book.title}</h3>
                  <p className="text-sm text-slate-500 flex items-center gap-1"><User className="w-3 h-3"/> {book.author}</p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className={`text-[10px] font-black px-2 py-1 rounded uppercase ${book.status === 'Concluído' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>{book.status}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-50 px-2 py-1 rounded border border-slate-100">{book.format}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingBookId(book.id); setFormData(book as any); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => { if(confirm('Excluir?')) supabase.from('books').delete().eq('id', book.id).then(refreshBooks) }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
               <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                  <div className="text-blue-600 mb-2"><Calendar className="w-5 h-5"/></div>
                  <p className="text-xs font-bold uppercase text-slate-400 mb-1">Lidos no Ano</p>
                  <p className="text-3xl font-black text-slate-900">{analytics.totalLidosAno}</p>
               </div>
               <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                  <div className="text-emerald-600 mb-2"><Hash className="w-5 h-5"/></div>
                  <p className="text-xs font-bold uppercase text-slate-400 mb-1">Páginas no Ano</p>
                  <p className="text-3xl font-black text-slate-900">{analytics.paginasLidasAno.toLocaleString()}</p>
               </div>
               <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                  <div className="text-orange-600 mb-2"><Timer className="w-5 h-5"/></div>
                  <p className="text-xs font-bold uppercase text-slate-400 mb-1">Média Dias/Livro</p>
                  <p className="text-3xl font-black text-slate-900">{analytics.tempoMedio}d</p>
               </div>
               <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                  <div className="text-purple-600 mb-2"><Book className="w-5 h-5"/></div>
                  <p className="text-xs font-bold uppercase text-slate-400 mb-1">Média Páginas</p>
                  <p className="text-3xl font-black text-slate-900">{analytics.mediaPaginas}</p>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                  <h2 className="text-sm font-black uppercase text-slate-900 mb-6 flex items-center gap-2"><User className="w-4 h-4 text-blue-600"/> Autores Favoritos</h2>
                  <div className="space-y-4">
                    {analytics.topAuthors.map(([name, count]) => (
                      <div key={name} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100"><span className="font-bold text-sm truncate pr-2">{name}</span><span className="bg-white px-2 py-1 rounded-md text-xs font-black shadow-sm">{count}</span></div>
                    ))}
                  </div>
               </div>

               <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                  <h2 className="text-sm font-black uppercase text-slate-900 mb-6 flex items-center gap-2"><Globe className="w-4 h-4 text-emerald-600"/> Países de Origem</h2>
                  <div className="space-y-4">
                    {analytics.topCountries.map(([name, count]) => (
                      <div key={name} className="flex justify-between items-center"><span className="text-sm font-medium flex items-center gap-2">{countryFlags[name] || '🏳️'} {name.toUpperCase()}</span><span className="font-bold text-slate-400">{count} livros</span></div>
                    ))}
                  </div>
               </div>

               <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                  <h2 className="text-sm font-black uppercase text-slate-900 mb-6 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-600"/> Status Geral</h2>
                  <div className="space-y-4">
                    {Object.entries(analytics.statusDist).map(([name, count]) => (
                      <div key={name} className="flex justify-between items-center text-sm"><span className="font-medium text-slate-500">{name}</span><span className="font-bold">{count}</span></div>
                    ))}
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <h2 className="text-sm font-black uppercase text-slate-900 mb-8 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-blue-600"/> Evolução Mensal</h2>
                    <div className="flex items-end justify-between h-32 gap-2">
                        {analytics.mensal.map((count, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                <div className="w-full bg-blue-100 rounded-t-lg transition-all hover:bg-blue-600 relative group" style={{ height: `${(count / (Math.max(...analytics.mensal) || 1)) * 100}%`, minHeight: '4px' }}>
                                   {count > 0 && <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-black opacity-0 group-hover:opacity-100 transition-opacity">{count}</span>}
                                </div>
                                <span className="text-[9px] font-bold text-slate-400 uppercase">{['J','F','M','A','M','J','J','A','S','O','N','D'][i]}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <h2 className="text-sm font-black uppercase text-slate-900 mb-6 flex items-center gap-2"><Monitor className="w-4 h-4 text-orange-600"/> Formatos</h2>
                    <div className="space-y-6">
                        {analytics.genres.slice(0, 4).map(([name, count]) => (
                            <div key={name}>
                                <div className="flex justify-between text-[10px] font-black uppercase mb-1"><span>{name}</span><span>{Math.round((count / books.length) * 100)}%</span></div>
                                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden"><div className="bg-slate-800 h-full rounded-full" style={{ width: `${(count / books.length) * 100}%` }}></div></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
          </div>
        )}
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
           <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl font-black text-slate-900">{editingBookId ? 'Editar BI' : 'Novo Livro'}</h2>
                 <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-50 rounded-full"><X className="w-5 h-5"/></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                 <input className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold" placeholder="Título do Livro" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                 <div className="grid grid-cols-2 gap-4">
                    <input className="bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold" placeholder="Autor" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} />
                    <input className="bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold" placeholder="País (Ex: Brasil)" value={formData.author_nationality} onChange={e => setFormData({...formData, author_nationality: e.target.value})} />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <select className="bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold appearance-none" value={formData.format} onChange={e => setFormData({...formData, format: e.target.value})}>
                       <option>Físico</option><option>E-book</option><option>Audiobook</option>
                    </select>
                    <select className="bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold appearance-none" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                       <option>Na Fila</option><option>Lendo</option><option>Concluído</option><option>Abandonado</option>
                    </select>
                 </div>
                 <input type="number" className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold" placeholder="Páginas" value={formData.total_pages} onChange={e => setFormData({...formData, total_pages: Number(e.target.value)})} />
                 {formData.status === 'Abandonado' && (
                    <input className="w-full bg-red-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-red-600" placeholder="Motivo da interrupção?" value={formData.interruption_reason} onChange={e => setFormData({...formData, interruption_reason: e.target.value})} />
                 )}
                 <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-slate-200">Salvar nos Dados</button>
              </form>
           </div>
        </div>
      )}
    </div>
  )
}