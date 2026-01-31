import { useState, useMemo } from 'react'
import { useBooks } from './contexts/BookContext'
import { supabase } from './lib/supabase'
import { 
  Library, Plus, Trash2, CheckCircle2, 
  BookMarked, X, Pencil, Search, ArrowUpDown, Sparkles, Star, Trophy, Globe, Link as LinkIcon, Image as ImageIcon,
  Layers, Book, PieChart, LayoutGrid, Tag, Shuffle, Sparkle
} from 'lucide-react'

// 🌍 MAPA-MÚNDI COMPLETO (INTEGRAL)
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
    setShuffledBook(queue[Math.floor(Math.random() * queue.length)]);
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
      setIsShuffleOpen(false); refreshBooks();
    } catch (e: any) { alert(e.message); }
  }

  const stats = useMemo(() => ({
    totalBooks: books.length,
    totalReadPages: books.reduce((acc, b) => acc + (b.read_pages || 0), 0),
    completedBooks: books.filter(b => b.status === 'Concluído').length,
    queueBooks: books.filter(b => b.status === 'Na Fila').length,
  }), [books]);

  async function searchGoogleBooks() {
    const query = formData.title.trim();
    if (!query) return;
    const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_KEY;
    try {
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${API_KEY}&maxResults=1`);
      const data = await response.json();
      if (data.items?.[0]) {
        const info = data.items[0].volumeInfo;
        setFormData(prev => ({ ...prev, title: info.title || prev.title, author: info.authors?.join(', ') || '', publisher: info.publisher || '', total_pages: info.pageCount || 0, cover_url: info.imageLinks?.thumbnail?.replace('http:', 'https:') || '', }));
      }
    } catch (e) { console.error(e); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = { ...formData, rating: editingBookId ? formData.rating : 0, started_at: formData.started_at || null, finished_at: formData.finished_at || null };
      const { error } = editingBookId ? await supabase.from('books').update(payload).eq('id', editingBookId) : await supabase.from('books').insert([payload]);
      if (error) throw error;
      setIsModalOpen(false); refreshBooks();
    } catch (e: any) { alert(e.message); }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <header className="bg-white border-b border-slate-200 h-20 flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-lg"><Library /></div>
          <h1 className="text-xl font-bold text-slate-900 hidden md:block">Gestor de Leituras</h1>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button onClick={() => setCurrentView('library')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${currentView === 'library' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}><LayoutGrid className="w-4 h-4 inline mr-2"/> Biblioteca</button>
          <button onClick={() => setCurrentView('analytics')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${currentView === 'analytics' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}><PieChart className="w-4 h-4 inline mr-2"/> Relatórios</button>
        </div>
        <button onClick={() => { setEditingBookId(null); setIsModalOpen(true); }} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-600 transition-all"><Plus /> Novo</button>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm"><Book className="text-violet-600 mb-2"/><p className="text-2xl font-black">{stats.totalBooks}</p><p className="text-xs text-slate-400 font-bold uppercase">Total</p></div>
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm"><Trophy className="text-blue-600 mb-2"/><p className="text-2xl font-black">{stats.totalReadPages.toLocaleString()}</p><p className="text-xs text-slate-400 font-bold uppercase">Páginas</p></div>
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm"><CheckCircle2 className="text-emerald-600 mb-2"/><p className="text-2xl font-black">{stats.completedBooks}</p><p className="text-xs text-slate-400 font-bold uppercase">Lidos</p></div>
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm"><Layers className="text-slate-600 mb-2"/><p className="text-2xl font-black">{stats.queueBooks}</p><p className="text-xs text-slate-400 font-bold uppercase">Na Fila</p></div>
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-center"><Sparkle className="text-amber-400 w-8 h-8"/></div>
        </div>

        {currentView === 'library' ? (
          <>
            <div className="bg-white p-2 rounded-[1.5rem] border border-slate-200 flex flex-col lg:flex-row gap-2 shadow-sm">
              <div className="relative flex-1"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5"/><input className="w-full pl-12 pr-4 font-semibold outline-none text-slate-700" placeholder="Pesquisar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/></div>
              <div className="flex gap-2 p-1">
                {['Todos', 'Na Fila', 'Lendo', 'Concluído'].map((s) => (<button key={s} onClick={() => setFilterStatus(s as any)} className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase transition-all ${filterStatus === s ? 'bg-slate-900 text-white' : 'text-slate-500'}`}>{s}</button>))}
                <button onClick={handleShuffle} className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm group"><Shuffle size={18} className="group-hover:rotate-12 transition-transform" /></button>
                <div className="relative ml-1"><select className="appearance-none bg-slate-50 pl-4 pr-10 py-3 rounded-xl text-xs font-bold uppercase text-slate-600 outline-none" value={sortBy} onChange={e => setSortBy(e.target.value as any)}><option value="recent">Recentes</option><option value="rating">Notas</option></select><ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" /></div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-500">
              {books.filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase())).map(book => (
                <div key={book.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 flex gap-6 relative group shadow-sm hover:shadow-md transition-all">
                  <div className="w-24 h-36 bg-slate-100 rounded-xl overflow-hidden shrink-0 shadow-inner">{book.cover_url ? <img src={book.cover_url} className="w-full h-full object-cover" alt={book.title}/> : <div className="w-full h-full flex items-center justify-center bg-slate-100"><BookMarked className="text-slate-300 w-8 h-8"/></div>}</div>
                  <div className="flex-1 py-1 min-w-0">
                    <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-md border mb-1 block w-fit bg-slate-50 text-slate-600 border-slate-100">{book.genre}</span>
                    <h3 className="font-bold text-lg truncate text-slate-900">{book.title}</h3>
                    <p className="text-sm text-slate-500 flex items-center gap-2">
                        {book.author_nationality ? (countryFlags[book.author_nationality.toLowerCase().trim()] || <Globe size={12}/>) : <Globe size={12}/>} {book.author}
                    </p>
                    <div className="mt-4"><div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden"><div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${Math.round(((book.read_pages || 0) / (book.total_pages || 1)) * 100)}%` }}></div></div></div>
                    <div className="flex gap-2 mt-4"><span className={`text-[10px] font-black px-2 py-1 rounded uppercase ${book.status === 'Concluído' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>{book.status}</span>{(book.rating || 0) > 0 && <div className="flex items-center gap-1 bg-amber-50 px-2 rounded text-amber-600 text-[10px] font-bold"><Star size={10} className="fill-amber-400 text-amber-400"/> {book.rating}</div>}</div>
                  </div>
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all"><button onClick={() => { setEditingBookId(book.id); setFormData(book as any); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 rounded-lg"><Pencil size={16}/></button><button onClick={() => { if(confirm('Excluir?')) supabase.from('books').delete().eq('id', book.id).then(refreshBooks); }} className="p-2 text-slate-400 hover:text-red-600 bg-slate-50 rounded-lg"><Trash2 size={16}/></button></div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 text-center py-20">
             <PieChart size={64} className="mx-auto text-slate-200 mb-4" />
             <h2 className="text-xl font-black">Refinando relatórios...</h2>
          </div>
        )}
      </main>

      {/* 🎲 SORTEADOR VISUAL */}
      {isShuffleOpen && shuffledBook && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 shadow-2xl text-center relative overflow-hidden">
            <button onClick={() => setIsShuffleOpen(false)} className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full hover:bg-red-50 transition-all z-20"><X size={20}/></button>
            <div className="relative z-10 space-y-6">
              <div className="bg-blue-600 w-16 h-16 rounded-3xl mx-auto flex items-center justify-center shadow-xl mb-2 rotate-12"><Sparkle className="text-white w-8 h-8" /></div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">Sua Próxima Aventura</h2>
              <div className="w-40 h-60 bg-slate-50 rounded-[2rem] mx-auto shadow-2xl overflow-hidden border-4 border-white transform hover:scale-105 transition-transform duration-500">{shuffledBook.cover_url && <img src={shuffledBook.cover_url} className="w-full h-full object-cover" alt={shuffledBook.title}/>}</div>
              <div><h3 className="text-xl font-black text-slate-900 leading-tight mb-2">{shuffledBook.title}</h3><p className="text-sm font-bold text-slate-400">{shuffledBook.author}</p></div>
              <button onClick={startReadingShuffled} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase shadow-xl hover:bg-slate-900 transition-all">Começar Agora</button>
              <button onClick={handleShuffle} className="text-xs font-bold text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-colors">Sortear outro</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CADASTRO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-black text-slate-900">{editingBookId ? 'Editar BI' : 'Novo Registro'}</h2><button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors"><X/></button></div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2"><input className="flex-1 bg-slate-50 rounded-2xl px-5 py-4 font-bold outline-none border-2 border-transparent focus:border-blue-100" placeholder="Título" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required/><button type="button" onClick={searchGoogleBooks} className="bg-blue-600 text-white px-5 rounded-2xl hover:bg-blue-700 shadow-lg transition-colors"><Sparkles/></button></div>
              <div className="grid grid-cols-2 gap-4"><input className="bg-slate-50 rounded-2xl px-5 py-4 text-sm font-bold outline-none" placeholder="Autor" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})}/><input className="bg-slate-50 rounded-2xl px-5 py-4 text-sm font-bold outline-none" placeholder="País (Ex: Brasil)" value={formData.author_nationality} onChange={e => setFormData({...formData, author_nationality: e.target.value})}/></div>
              <div className="space-y-1"><label className="text-xs font-bold text-slate-400 ml-1 flex items-center gap-1"><ImageIcon size={12}/> URL da Capa (Manual)</label><div className="relative"><LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4"/><input className="w-full bg-slate-50 rounded-2xl pl-12 pr-4 py-4 text-xs font-bold outline-none border-2 border-transparent focus:border-blue-100" placeholder="Link da imagem..." value={formData.cover_url} onChange={e => setFormData({ ...formData, cover_url: e.target.value })}/></div></div>
              <div className="space-y-1"><label className="text-xs font-bold text-slate-400 ml-1 flex items-center gap-1"><Tag size={12}/> Gênero Literário / Área</label>
                <select className="w-full bg-slate-50 rounded-2xl px-5 py-4 text-sm font-bold outline-none appearance-none cursor-pointer border-2 border-transparent focus:border-blue-100" value={formData.genre} onChange={e => setFormData({...formData, genre: e.target.value})}>
                  <optgroup label="Ficção">
                    <option>Romance</option><option>Conto</option><option>Novela</option><option>Ficção Científica</option><option>Fantasia</option><option>Distopia</option><option>Utopia</option><option>Realismo Mágico</option>
                  </optgroup>
                  <optgroup label="Suspense & Mistério">
                    <option>Suspense</option><option>Policial</option><option>Thriller</option>
                  </optgroup>
                  <optgroup label="Ciências Humanas">
                    <option>Filosofia</option><option>História</option><option>Sociologia</option><option>Antropologia</option><option>Ciência Política</option><option>Economia</option>
                  </optgroup>
                  <optgroup label="Outros">
                    <option>Autoajuda</option><option>Outros</option>
                  </optgroup>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="date" className="w-full bg-slate-50 rounded-2xl px-5 py-4 text-sm font-bold outline-none" value={formData.started_at} onChange={e => setFormData({...formData, started_at: e.target.value})}/>
                <input type="date" className="w-full bg-slate-50 rounded-2xl px-5 py-4 text-sm font-bold outline-none" value={formData.finished_at} onChange={e => setFormData({...formData, finished_at: e.target.value})}/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <select className="bg-slate-50 rounded-2xl px-5 py-4 text-sm font-bold outline-none appearance-none" value={formData.format} onChange={e => setFormData({...formData, format: e.target.value})}><option>Físico</option><option>E-book</option><option>Audiobook</option></select>
                <select className="bg-slate-50 rounded-2xl px-5 py-4 text-sm font-bold outline-none appearance-none" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as BookStatus})}><option value="Na Fila">Na Fila</option><option value="Lendo">Lendo</option><option value="Concluído">Concluído</option><option value="Abandonado">Abandonado</option></select>
              </div>
              <div className="grid grid-cols-2 gap-4"><input type="number" className="bg-slate-50 rounded-2xl px-5 py-4 font-bold outline-none" placeholder="Páginas" value={formData.total_pages} onChange={e => setFormData({...formData, total_pages: Number(e.target.value)})}/><input type="number" className="bg-slate-50 rounded-2xl px-5 py-4 font-bold outline-none" placeholder="Lidas" value={formData.read_pages} onChange={e => setFormData({...formData, read_pages: Number(e.target.value)})}/></div>
              <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase shadow-xl hover:bg-blue-600 transition-all transform active:scale-95">SALVAR DADOS</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}