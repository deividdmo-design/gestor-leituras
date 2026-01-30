import { createContext, useState, useEffect, useContext } from 'react'
import type { ReactNode } from 'react'
import { supabase } from '../lib/supabase'

export interface Book {
  id: string
  title: string
  author: string
  author_nationality: string
  publisher: string
  total_pages: number
  read_pages: number // Você confirmou que esta já existe!
  cover_url: string  // Adicionando agora
  format: string     // Adicionando agora
  status: 'Lendo' | 'Na Fila' | 'Concluído'
}

interface BookContextData {
  books: Book[]
  loading: boolean
  refreshBooks: () => Promise<void>
}

const BookContext = createContext<BookContextData>({} as BookContextData)

export function BookProvider({ children }: { children: ReactNode }) {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  async function refreshBooks() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      if (data) setBooks(data as Book[])
    } catch (error) {
      console.error('Erro ao buscar livros:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshBooks()
  }, [])

  return (
    <BookContext.Provider value={{ books, loading, refreshBooks }}>
      {children}
    </BookContext.Provider>
  )
}

export function useBooks() {
  return useContext(BookContext)
}