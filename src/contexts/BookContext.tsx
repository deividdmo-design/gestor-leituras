import { createContext, useState, useEffect, useContext } from 'react'
import type { ReactNode } from 'react' // <--- A CORREÇÃO ESTÁ AQUI
import { supabase } from '../lib/supabase'

export interface Book {
  id: string
  title: string
  author: string
  status: string
}

interface BookContextData {
  books: Book[]
  loading: boolean
}

const BookContext = createContext<BookContextData>({} as BookContextData)

export function BookProvider({ children }: { children: ReactNode }) {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBooks() {
      try {
        setLoading(true)
        const { data, error } = await supabase.from('books').select('*')
        if (error) throw error
        if (data) setBooks(data)
      } catch (error) {
        console.error('Erro:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchBooks()
  }, [])

  return (
    <BookContext.Provider value={{ books, loading }}>
      {children}
    </BookContext.Provider>
  )
}

export function useBooks() {
  return useContext(BookContext)
}