import { useState } from 'react'
import { useBooks } from './contexts/BookContext'
import type { Book } from './contexts/BookContext'
import { supabase } from './lib/supabase'
import { 
  Library, BookOpen, Plus, Trash2, CheckCircle2, 
  Clock, BookMarked, ChevronRight, X, Globe, Building2, Pencil, Link as LinkIcon 
} from 'lucide-react'

export default function App() {
  const { books, loading, refreshBooks } = useBooks()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBookId, setEditingBookId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    author_nationality: '',
    publisher: '',
    total_pages: 0,
    read_pages: 0,
    cover_url: '',
    format: 'Físico',
    status: 'Na Fila' as Book['status']
  })

  function handleEdit(book: Book) {
    setEditingBookId(book.id)
    setFormData({
      title: book.title,
      author: book.author,
      author_nationality: book.author_nationality || '',
      publisher: book.publisher || '',
      total_pages: book.total_pages,
      read_pages: book.read_pages || 0,
      cover_url: book.cover_url || '',
      format: book.format || 'Físico',
      status: book.status
    })
    setIsModalOpen(true)
  }

  function closeModal() {
    setIsModalOpen(false)
    setEditingBookId(null)
    setFormData({ 
      title: '', author: '', author_nationality: '', publisher: '', 
      total_pages: 0, read_pages: 0, cover_url: '', format: 'Físico', status: 'Na Fila' 
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      if (editingBookId) {
        const { error } = await supabase.from('books').update(formData).eq('id', editingBookId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('books').insert([formData])
        if (error) throw error
      }
      closeModal()
      refreshBooks()
    } catch (error) {
      alert('Erro ao salvar no Supabase')
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1e293b]">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-100">
              <Library className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Gestor de Leituras</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Analista Deivid Matos</p>
            </div>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-blue-100">
            <Plus className="w-5 h-5" /> Novo Livro
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {/* DASHBOARD */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5">
            <div className="bg-amber-50 p-3.5 rounded-xl text-amber-500"><Clock className="w-7 h-7" /></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Na Fila</p>
              <p className="text-3xl font-black text-slate-700">{books.filter(b => b.status === 'Na Fila').length}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5">
            <div className="bg-blue-50 p-3.5 rounded-xl text-blue-500"><BookOpen className="w-7 h-7" /></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lendo</p>
              <p className="text-3xl font-black text-slate-700">{books.filter(b => b.status === 'Lendo').length}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5">
            <div className="bg-emerald-50 p-3.5 rounded-xl text-emerald-500"><CheckCircle2 className="w-7 h-7" /></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Concluídos</p>
              <p className="text-3xl font-black text-slate-700">{books.filter(b => b.status === 'Concluído').length}</p>
            </div>
          </div>
        </div>

        {/* LISTAGEM COM CAPA E PROGRESSO */}
        {loading ? (
          <div className="text-center py-20 font-bold text-slate-400 animate-pulse uppercase tracking-widest">Sincronizando...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {books.map(book => {
              const progress = Math.min(Math.round((book.read_pages / book.total_pages) * 100) || 0, 100);
              return (
                <div key={book.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex gap-5">
                  {/* Espaço da Capa */}
                  <div className="w-24 h-32 bg-slate-50 rounded-lg flex-shrink-0 overflow-hidden border border-slate-100 flex items-center justify-center">
                    {book.cover_url ? (
                      <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                    ) : (
                      <BookMarked className="w-8 h-8 text-slate-200" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="truncate">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                          book.status === 'Lendo' ? 'bg-blue-100 text-blue-700' : 
                          book.status === 'Concluído' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {book.status} • {book.format}
                        </span>
                        <h3 className="text-lg font-black text-slate-800 leading-tight mt-1 truncate">{book.title}</h3>
                        <p className="text-blue-600 text-xs font-bold truncate">{book.author}</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => handleEdit(book)} className="text-slate-200 hover:text-blue-500 p-1 transition-colors"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => { if(confirm('Excluir?')) supabase.from('books').delete().eq('id', book.id).then(() => refreshBooks()) }} className="text-slate-200 hover:text-red-500 p-1 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 mb-3 text-slate-500">
                      <div className="flex items-center gap-1 text-[10px] font-bold">
                        {book.author_nationality?.toLowerCase().includes('brasil') ? '🇧🇷 ' : <Globe className="w-3 h-3" />}
                        {book.author_nationality || 'N/A'}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold">
                        <Building2 className="w-3 h-3" /> {book.publisher || 'N/A'}
                      </div>
                    </div>
                    
                    {/* Barra de Progresso Real */}
                    <div className="pt-2 border-t border-slate-50">
                      <div className="flex justify-between text-[9px] font-black text-slate-400 mb-1">
                        <span>{progress}% LIDO</span>
                        <span>{book.read_pages}/{book.total_pages} PÁG</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full transition-all duration-700" style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* MODAL COMPLETO (EDIÇÃO E CADASTRO) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-black text-slate-800 italic">{editingBookId ? 'Corrigir Dados' : 'Novo Cadastro'}</h2>
              <button onClick={closeModal} className="bg-white p-2 rounded-full shadow-sm hover:text-red-500 transition-all"><X className="w-5 h-5"/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Título</label>
                  <input required className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none font-bold" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Autor</label>
                  <input required className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none font-bold" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Formato</label>
                  <select className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none font-bold" value={formData.format} onChange={e => setFormData({...formData, format: e.target.value})}>
                    <option value="Físico">Físico</option>
                    <option value="PDF">PDF</option>
                    <option value="Ebook/Kindle">Ebook/Kindle</option>
                    <option value="Audiobook">Audiobook</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1"><LinkIcon className="w-3 h-3"/> Link da Capa (URL)</label>
                  <input className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-xs" placeholder="https://..." value={formData.cover_url} onChange={e => setFormData({...formData, cover_url: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Páginas Totais</label>
                  <input type="number" className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none font-bold" value={formData.total_pages} onChange={e => setFormData({...formData, total_pages: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Páginas Lidas</label>
                  <input type="number" className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-blue-600" value={formData.read_pages} onChange={e => setFormData({...formData, read_pages: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nacionalidade</label>
                  <input className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none font-bold" value={formData.author_nationality} onChange={e => setFormData({...formData, author_nationality: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Editora</label>
                  <input className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none font-bold" value={formData.publisher} onChange={e => setFormData({...formData, publisher: e.target.value})} />
                </div>
              </div>
              
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-3 mt-4">
                {editingBookId ? 'SALVAR ALTERAÇÕES' : 'CADASTRAR LIVRO'} <ChevronRight className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}