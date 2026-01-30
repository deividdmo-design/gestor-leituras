import { useBooks } from './contexts/BookContext'
import { Library } from 'lucide-react'

export default function App() {
  const { books, loading } = useBooks()

  return (
    <div className="min-h-screen bg-slate-50 p-10">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center gap-3 mb-10">
          <Library className="w-10 h-10 text-blue-600" />
          <h1 className="text-3xl font-bold text-slate-800">Minha Biblioteca</h1>
        </header>

        {loading ? (
          <p>Carregando livros...</p>
        ) : books.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-700">Nenhum livro encontrado</h2>
            <p className="text-slate-500 mt-2">Sua conexão com o Supabase está funcionando!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {books.map(book => (
              <div key={book.id} className="bg-white p-4 rounded shadow">
                <h3 className="font-bold">{book.title}</h3>
                <p className="text-sm text-gray-600">{book.author}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}