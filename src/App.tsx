import { useState } from 'react'
import { useBooks } from './contexts/BookContext'
import type { Book } from './contexts/BookContext'
import { supabase } from './lib/supabase'
import { 
  Library, BookOpen, Plus, Trash2, CheckCircle2, 
  Clock, BookMarked, ChevronRight, X 
} from 'lucide-react'

export default function App() {
  const { books, loading, refreshBooks } = useBooks()
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Estado do Formulário
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    total_pages: 0,
    status: 'Na Fila' as Book['status']
  })

  // Função para salvar no Banco de Dados
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const { error } = await supabase.from('books').insert([formData])
      if (error) throw error
      
      setIsModalOpen(false)
      setFormData({ title: '', author: '', total_pages: 0, status: 'Na Fila' })
      refreshBooks() // Atualiza a lista na hora
    } catch (error) {
      alert('Erro ao salvar livro')
      console.error(error)
    }
  }

  // Função para excluir
  async function deleteBook(id: string) {
    if (confirm('Deseja remover este livro da sua biblioteca?')) {
      await supabase.from('books').delete().eq('id', id)
      refreshBooks()
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1e293b]">
      {/* HEADER PROFISSIONAL */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Library className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Gestor de Leituras</h1>
              <p className="text-xs text-slate-500 font-medium">ANALISTA DEIVID MATOS</p>
            </div>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4" /> Novo Livro
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {/* DASHBOARD DE STATUS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="bg-amber-100 p-3 rounded-full text-amber-600"><Clock /></div>
            <div>
              <p className="text-sm text-slate-500">Na Fila</p>
              <p className="text-2xl font-bold">{books.filter(b => b.status === 'Na Fila').length}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-full text-blue-600"><BookOpen /></div>
            <div>
              <p className="text-sm text-slate-500">Lendo Agora</p>
              <p className="text-2xl font-bold">{books.filter(b => b.status === 'Lendo').length}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="bg-emerald-100 p-3 rounded-full text-emerald-600"><CheckCircle2 /></div>
            <div>
              <p className="text-sm text-slate-500">Concluídos</p>
              <p className="text-2xl font-bold">{books.filter(b => b.status === 'Concluído').length}</p>
            </div>
          </div>
        </div>

        {/* LISTAGEM DE LIVROS */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="font-medium">Sincronizando com o Supabase...</p>
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
            <BookMarked className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700">Sua estante está vazia</h3>
            <p className="text-slate-500 mb-6">Comece adicionando os livros que você pretende ler em 2026.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {books.map(book => (
              <div key={book.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors group">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md mb-2 inline-block ${
                      book.status === 'Lendo' ? 'bg-blue-50 text-blue-600' : 
                      book.status === 'Concluído' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {book.status}
                    </span>
                    <h3 className="text-lg font-bold text-slate-800 leading-tight">{book.title}</h3>
                    <p className="text-slate-500 text-sm font-medium">{book.author}</p>
                  </div>
                  <button 
                    onClick={() => deleteBook(book.id)}
                    className="text-slate-300 hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-50">
                   <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-blue-600 h-full transition-all" 
                        style={{ width: `${(book.read_pages / book.total_pages) * 100 || 0}%` }}
                      ></div>
                   </div>
                   <span className="text-xs font-bold text-slate-500">{book.total_pages} pág.</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* MODAL DE CADASTRO (POP-UP) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">Novo Livro</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Título do Livro</label>
                <input 
                  required
                  className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ex: Sapiens"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Autor</label>
                <input 
                  required
                  className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ex: Yuval Noah Harari"
                  value={formData.author}
                  onChange={e => setFormData({...formData, author: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Total de Páginas</label>
                  <input 
                    type="number"
                    className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.total_pages}
                    onChange={e => setFormData({...formData, total_pages: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Status Inicial</label>
                  <select 
                    className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value as Book['status']})}
                  >
                    <option value="Na Fila">Na Fila</option>
                    <option value="Lendo">Lendo</option>
                    <option value="Concluído">Concluído</option>
                  </select>
                </div>
              </div>
              
              <button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all mt-4 flex items-center justify-center gap-2"
              >
                Salvar na Estante <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}