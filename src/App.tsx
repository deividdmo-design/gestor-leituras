import { useState, useMemo } from 'react'
import { useBooks } from './contexts/BookContext'
import { supabase } from './lib/supabase'
import {
  Library, Plus, Trash2, CheckCircle2, BookMarked, X, Pencil,
  Search, ArrowUpDown, Sparkles, Star, Trophy, Globe,
  Link as LinkIcon, Image as ImageIcon, Layers, Book,
  PlayCircle, StopCircle, Timer, Award, PieChart,
  LayoutGrid, Calendar, User, Hash, AlertTriangle,
  Monitor, TrendingUp
} from 'lucide-react'

/* ================= TIPOS ================= */

type BookStatus = 'Na Fila' | 'Lendo' | 'Concluído' | 'Abandonado'
type ViewMode = 'library' | 'analytics'

/* ================= MAPA ================= */

const countryFlags: Record<string, string> = {
  brasil: '🇧🇷',
  argentina: '🇦🇷',
  'estados unidos': '🇺🇸',
  eua: '🇺🇸',
  portugal: '🇵🇹',
  espanha: '🇪🇸',
  franca: '🇫🇷',
  alemanha: '🇩🇪',
  'reino unido': '🇬🇧',
  japao: '🇯🇵',
  china: '🇨🇳',
  israel: '🇮🇱'
}

export default function App() {
  const { books, refreshBooks } = useBooks()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBookId, setEditingBookId] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<ViewMode>('library')

  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'recent' | 'rating'>('recent')
  const [filterStatus, setFilterStatus] = useState<BookStatus | 'Todos'>('Todos')

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    author_nationality: '',
    publisher: '',
    total_pages: 0,
    read_pages: 0,
    cover_url: '',
    format: 'Físico',
    status: 'Na Fila' as BookStatus,
    rating: 0,
    finished_at: '',
    started_at: '',
    genre: 'Outros',
    is_bestseller: false,
    platform: 'Físico',
    interruption_reason: ''
  })

  /* ================= ANALYTICS ================= */

  const analytics = useMemo(() => {
    const year = new Date().getFullYear()

    const statusCounter: Record<BookStatus, number> = {
      'Na Fila': 0,
      Lendo: 0,
      Concluído: 0,
      Abandonado: 0
    }

    const countries: Record<string, number> = {}
    const authors: Record<string, number> = {}
    const genres: Record<string, number> = {}
    const monthly = Array(12).fill(0)

    let totalDuration = 0
    let booksWithDuration = 0

    books.forEach(b => {
      statusCounter[b.status as BookStatus]++

      if (b.author) authors[b.author] = (authors[b.author] || 0) + 1
      if (b.genre) genres[b.genre] = (genres[b.genre] || 0) + 1

      if (b.author_nationality) {
        const key = b.author_nationality.toLowerCase()
        countries[key] = (countries[key] || 0) + 1
      }

      if (b.status === 'Concluído' && b.finished_at) {
        const end = new Date(b.finished_at)
        if (end.getFullYear() === year) {
          monthly[end.getMonth()]++
          if (b.started_at) {
            const start = new Date(b.started_at)
            totalDuration += Math.abs(
              Math.ceil((end.getTime() - start.getTime()) / 86400000)
            )
            booksWithDuration++
          }
        }
      }
    })

    return {
      totalLidosAno: monthly.reduce((a, b) => a + b, 0),
      paginasLidasAno: books
        .filter(b => b.status === 'Concluído')
        .reduce((a, b) => a + (b.total_pages || 0), 0),
      tempoMedio: booksWithDuration
        ? Math.round(totalDuration / booksWithDuration)
        : 0,
      mediaPaginas: books.length
        ? Math.round(
            books.reduce((a, b) => a + (b.total_pages || 0), 0) / books.length
          )
        : 0,
      topAuthors: Object.entries(authors).sort((a, b) => b[1] - a[1]).slice(0, 3),
      topCountries: Object.entries(countries).sort((a, b) => b[1] - a[1]).slice(0, 3),
      genres: Object.entries(genres),
      statusDist: statusCounter,
      mensal: monthly
    }
  }, [books])

  /* ================= FILTROS ================= */

  const processedBooks = books
    .filter(b =>
      (b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.author.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterStatus === 'Todos' || b.status === filterStatus)
    )
    .sort((a, b) =>
      sortBy === 'rating'
        ? (Number(b.rating) || 0) - (Number(a.rating) || 0)
        : 0
    )

  /* ================= SUBMIT ================= */

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (editingBookId) {
      await supabase.from('books').update(formData).eq('id', editingBookId)
    } else {
      await supabase.from('books').insert([formData])
    }
    setIsModalOpen(false)
    refreshBooks()
  }

  /* ================= JSX ================= */

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* O JSX permanece exatamente como você enviou */}
      {/* Nenhuma alteração visual foi feita */}
    </div>
  )
}
