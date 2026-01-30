import { useState } from 'react'
import { useBooks } from './contexts/BookContext'
import type { Book } from './contexts/BookContext'
import { supabase } from './lib/supabase'
import { 
  Library, BookOpen, Plus, Trash2, CheckCircle2, 
  Clock, BookMarked, ChevronRight, X, Globe, Building2, Pencil 
} from 'lucide-react'

export default function App() {
  const { books, loading, refreshBooks } = useBooks()
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Controle de Edição (Passo A)
  const [editingBookId, setEditingBookId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    author_nationality: '',
    publisher: '',
    total_pages: 0,
    status: 'Na Fila' as Book['status']
  })

  // Função para abrir modal em modo edição (Passo B)
  function handleEdit(book: Book) {
    setEditingBookId(book.id)
    setFormData({
      title: book.title,
      author: book.author,
      author_nationality: book.author_nationality,
      publisher: book.publisher,
      total_pages: book.total_pages,
      status: book.status
    })
    setIsModalOpen(true)
  }

  // Função para fechar modal e limpar tudo
  function closeModal() {
    setIsModalOpen(false)
    setEditingBookId(null)
    setFormData({ 
      title: '', author: '', author_nationality: '', 
      publisher: '', total_pages: 0, status: 'Na Fila' 
    })
  }

  // Salvar ou Atualizar (Passo C)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      if (editingBookId) {
        const { error } = await supabase
          .from('books')
          .update(formData)
          .eq('id', editingBookId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('books').insert([formData])
        if (error) throw error
      }
      
      closeModal()
      refreshBooks()
    } catch (error) {
      alert('Erro ao processar operação no banco')
      console.error(error)
    }
  }

  async function deleteBook(id: string) {
    if (confirm('Deseja remover este livro da sua biblioteca?')) {
      await supabase.from('books').delete().eq('id', id)
      refreshBooks()
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
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all font-bold shadow-lg shadow-blue-100"
          >
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

        {/* LISTAGEM */}
        {loading ? (
          <div className="text-center py-20 font-bold text-slate-400 animate-pulse tracking-widest">SINCRONIZANDO COM SUPABASE...</div>
        ) : books.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <BookMarked className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700">Sua estante está vazia</h3>
            <p className="text-slate-500">Comece adicionando seus livros favoritos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {books.map(book => (
              <div key={book.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${
                      book.status === 'Lendo' ? 'bg-blue-100 text-blue-700' : 
                      book.status === 'Concluído' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {book.status}
                    </span>
                    <h3 className="text-xl font-black text-slate-800 leading-tight pt-1">{book.title}</h3>
                    <p className="text-blue-600 text-sm font-bold">{book.author}</p>
                  </div>
                  
                  {/* BOTÕES DE AÇÃO */}
                  <div className="flex gap-1">
                    <button 
                      onClick={() => handleEdit(book)}
                      className="text-slate-200 hover:text-blue-500 p-2 transition-colors rounded-lg hover:bg-blue-50"
                      title="Editar livro"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => deleteBook(book.id)} 
                      className="text-slate-200 hover:text-red-500 p-2 transition-colors rounded-lg hover:bg-red-50"
                      title="Excluir livro"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* INFO EXTRA COM BANDEIRA DO BRASIL */}
                <div className="flex flex-wrap gap-4 mb-5 text-slate-500">
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    {book.author_nationality?.toLowerCase() === 'brasileira' || 
                     book.author_nationality?.toLowerCase() === 'brasil' ? (
                      <span className="text-sm">🇧🇷</span>
                    ) : (
                      <Globe className="w-3.5 h-3.5 text-slate-300" />
                    )}
                    {book.author_nationality || 'N/A'}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    <Building2 className="w-3.5 h-3.5 text-slate-300" />
                    {book.publisher || 'N/A'}
                  </div>
                </div>
                
                <div className="flex items-center gap-4 pt-4 border-t border-slate-50">
                   <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-blue-600 h-full shadow-[0_0_8px_rgba(37,99,235,0.4)] transition-all duration-700" 
                        style={{ width: `${(book.read_pages / book.total_pages) * 100 || 0}%` }}
                      ></div>
                   </div>
                   <span className="text-xs font-black text-slate-400">{book.total_pages} PÁG.</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* MODAL (CADASTRO E EDIÇÃO) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-7 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-2xl font-black text-slate-800 italic">
                {editingBookId ? 'Corrigir Dados' : 'Novo Cadastro'}
              </h2>
              <button onClick={closeModal} className="bg-white p-2 rounded-full shadow-sm hover:text-red-500 transition-all"><X /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Título do Livro</label>
                  <input required className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none font-bold placeholder:text-slate-300" placeholder="Ex: Sapiens"
                    value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Autor</label>
                  <input required className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none font-bold placeholder:text-slate-300" placeholder="Ex: Yuval Noah Harari"
                    value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Nacionalidade</label>
                  <input className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none font-bold placeholder:text-slate-300" placeholder="Ex: Brasileira"
                    value={formData.author_nationality} onChange={e => setFormData({...formData, author_nationality: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Editora</label>
                  <input className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none font-bold placeholder:text-slate-300" placeholder="Ex: L&PM"
                    value={formData.publisher} onChange={e => setFormData({...formData, publisher: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Total Páginas</label>
                  <input type="number" className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                    value={formData.total_pages} onChange={e => setFormData({...formData, total_pages: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Status</label>
                  <select className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none font-bold appearance-none bg-white"
                    value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as Book['status']})}>
                    <option value="Na Fila">Na Fila</option>
                    <option value="Lendo">Lendo</option>
                    <option value="Concluído">Concluído</option>
                  </select>
                </div>
              </div>
              
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-3 mt-4 text-lg">
                {editingBookId ? 'SALVAR ALTERAÇÕES' : 'REGISTRAR LIVRO'} <ChevronRight className="w-6 h-6" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}