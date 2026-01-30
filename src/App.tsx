import { useState } from 'react'
import { useBooks } from './contexts/BookContext'
import type { Book } from './contexts/BookContext'
import { supabase } from './lib/supabase'
import { 
  Library, BookOpen, Plus, Trash2, CheckCircle2, 
  Clock, BookMarked, ChevronRight, X, Globe, Building2, 
  Pencil, Link as LinkIcon, Search, ArrowUpDown, Sparkles, Loader2 
} from 'lucide-react'

// MAPEADOR DE BANDEIRAS - BASEADO NO EL PAÍS
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

export default function App() {
  const { books, loading, refreshBooks } = useBooks()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBookId, setEditingBookId] = useState<string | null>(null)
  const [isSearchingAPI, setIsSearchingAPI] = useState(false)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('Todos')
  const [sortBy, setSortBy] = useState<'recent' | 'title' | 'progress'>('recent')

  const [formData, setFormData] = useState({
    title: '', author: '', author_nationality: '', publisher: '',
    total_pages: 0, read_pages: 0, cover_url: '', format: 'Físico',
    status: 'Na Fila' as Book['status']
  })

  // BUSCA NO GOOGLE BOOKS
  async function searchGoogleBooks() {
    const query = formData.title.trim();
    if (!query) return alert('Digite o título para buscar!');
    
    const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_KEY;
    setIsSearchingAPI(true);

    try {
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${API_KEY}&maxResults=1`);
      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        const info = data.items[0].volumeInfo;
        setFormData(prev => ({
          ...prev,
          title: info.title || prev.title,
          author: info.authors ? info.authors.join(', ') : '',
          publisher: info.publisher || '',
          total_pages: info.pageCount || 0,
          cover_url: info.imageLinks?.thumbnail?.replace('http:', 'https:') || '',
        }));
      } else {
        alert('Livro não encontrado no Google.');
      }
    } catch (error) {
      alert('Erro na API. Verifique sua chave no .env.local');
    } finally {
      setIsSearchingAPI(false);
    }
  }

  // PROCESSAMENTO (FILTRO + ORDEM)
  const processedBooks = books
    .filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           book.author.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus === 'Todos' || book.status === filterStatus
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title)
      if (sortBy === 'progress') {
        const progA = (a.read_pages / a.total_pages) || 0
        const progB = (b.read_pages / b.total_pages) || 0
        return progB - progA
      }
      return 0
    })

  function handleEdit(book: Book) {
    setEditingBookId(book.id)
    setFormData({
      title: book.title, author: book.author, author_nationality: book.author_nationality || '',
      publisher: book.publisher || '', total_pages: book.total_pages,
      read_pages: book.read_pages || 0, cover_url: book.cover_url || '',
      format: book.format || 'Físico', status: book.status
    })
    setIsModalOpen(true)
  }

  function closeModal() {
    setIsModalOpen(false)
    setEditingBookId(null)
    setFormData({ title: '', author: '', author_nationality: '', publisher: '', total_pages: 0, read_pages: 0, cover_url: '', format: 'Físico', status: 'Na Fila' })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      if (editingBookId) {
        await supabase.from('books').update(formData).eq('id', editingBookId)
      } else {
        await supabase.from('books').insert([formData])
      }
      closeModal(); refreshBooks();
    } catch (error) { alert('Erro ao salvar.'); }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1e293b]">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-100"><Library className="w-6 h-6 text-white" /></div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Gestor de Leituras</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">Analista Deivid Matos</p>
            </div>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold shadow-lg transition-all active:scale-95">
            <Plus className="w-5 h-5" /> Novo Livro
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {/* BUSCA E FILTROS */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input type="text" placeholder="Pesquisar na biblioteca..." className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="relative flex items-center bg-white border border-slate-200 rounded-2xl px-4 shadow-sm">
              <ArrowUpDown className="text-slate-400 w-4 h-4 mr-2" />
              <select className="bg-transparent py-4 pr-4 outline-none font-black text-[10px] uppercase tracking-widest text-slate-600 cursor-pointer" value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
                <option value="recent">Recentes</option>
                <option value="title">A - Z</option>
                <option value="progress">Progresso</option>
              </select>
            </div>
            <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto no-scrollbar">
              {['Todos', 'Na Fila', 'Lendo', 'Concluído'].map((status) => (
                <button key={status} onClick={() => setFilterStatus(status)} className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === status ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>{status}</button>
              ))}
            </div>
          </div>
        </div>

        {/* LISTAGEM */}
        {loading ? (
          <div className="text-center py-20 font-black text-slate-300 text-xs tracking-[0.3em] animate-pulse">CARREGANDO ACERVO...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {processedBooks.map(book => {
              const progress = Math.min(Math.round((book.read_pages / book.total_pages) * 100) || 0, 100);
              return (
                <div key={book.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all flex gap-6 group">
                  <div className="w-24 h-36 bg-slate-50 rounded-2xl flex-shrink-0 overflow-hidden border border-slate-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                    {book.cover_url ? <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover shadow-inner" /> : <BookMarked className="w-8 h-8 text-slate-200" />}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <div className="truncate pr-2">
                          <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg ${book.status === 'Lendo' ? 'bg-blue-600 text-white' : book.status === 'Concluído' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'}`}>{book.status}</span>
                          <h3 className="text-lg font-black text-slate-800 leading-tight mt-2 truncate">{book.title}</h3>
                          <p className="text-blue-600 text-xs font-bold truncate">{book.author}</p>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => handleEdit(book)} className="text-slate-200 hover:text-blue-600 p-2 rounded-xl hover:bg-blue-50 transition-all"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => { if(confirm('Excluir?')) supabase.from('books').delete().eq('id', book.id).then(() => refreshBooks()) }} className="text-slate-200 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 transition-all"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                      <div className="flex gap-4 mt-3">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {(() => {
                            const nation = book.author_nationality?.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "") || '';
                            const flag = countryFlags[nation];
                            return flag ? <span className="text-sm">{flag}</span> : <Globe className="w-3 h-3" />;
                          })()}
                          {book.author_nationality || 'N/A'}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><Building2 className="w-3 h-3" /> {book.publisher || 'N/A'}</div>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-slate-50 mt-2">
                      <div className="flex justify-between text-[9px] font-black text-slate-400 mb-2 tracking-widest">
                        <span>{book.format?.toUpperCase() || 'FÍSICO'}</span>
                        <span className="text-blue-600">{progress}% LIDO</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden shadow-inner">
                        <div className="bg-blue-600 h-full transition-all duration-1000 shadow-[0_0_10px_rgba(37,99,235,0.4)]" style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden my-auto border border-white/20 animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                 <h2 className="text-2xl font-black text-slate-800 italic">{editingBookId ? 'Ficha Técnica' : 'Novo Registro'}</h2>
                 <p className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] mt-1 italic">Inteligência Literária Ativa</p>
              </div>
              <button onClick={closeModal} className="bg-white p-3 rounded-2xl shadow-sm hover:text-red-500 transition-all border border-slate-50 active:scale-90"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 relative">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Título da Obra</label>
                  <div className="flex gap-2">
                    <input required className="flex-1 bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none font-bold" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                    {!editingBookId && (
                      <button type="button" onClick={searchGoogleBooks} disabled={isSearchingAPI} className="bg-blue-600 text-white px-5 rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center min-w-[56px] disabled:bg-slate-300">
                        {isSearchingAPI ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Autor</label>
                  <input required className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none font-bold" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Formato</label>
                  <select className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none font-bold appearance-none bg-white cursor-pointer" value={formData.format} onChange={e => setFormData({...formData, format: e.target.value})}>
                    <option value="Físico">Físico</option><option value="PDF">PDF</option><option value="Ebook/Kindle">Ebook/Kindle</option><option value="Audiobook">Audiobook</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block flex items-center gap-1"><LinkIcon className="w-3 h-3"/> URL da Capa</label>
                  <input className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-xs" value={formData.cover_url} onChange={e => setFormData({...formData, cover_url: e.target.value})} />
                </div>
                <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Páginas Totais</label><input type="number" className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none font-bold" value={formData.total_pages} onChange={e => setFormData({...formData, total_pages: Number(e.target.value)})} /></div>
                <div><label className="text-[10px] font-black text-blue-500 uppercase tracking-widest ml-1 mb-2 block">Páginas Lidas</label><input type="number" className="w-full bg-blue-50/50 border-blue-100 border rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none font-bold" value={formData.read_pages} onChange={e => setFormData({...formData, read_pages: Number(e.target.value)})} /></div>
                <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">País do Autor</label><input className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none font-bold placeholder:text-slate-300" placeholder="Ex: Brasil" value={formData.author_nationality} onChange={e => setFormData({...formData, author_nationality: e.target.value})} /></div>
                <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Editora</label><input className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none font-bold" value={formData.publisher} onChange={e => setFormData({...formData, publisher: e.target.value})} /></div>
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-3 mt-4 active:scale-95">{editingBookId ? 'SALVAR ALTERAÇÕES' : 'CONFIRMAR CADASTRO'} <ChevronRight className="w-6 h-6" /></button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}