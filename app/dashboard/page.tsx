'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Bookmark = {
  id: string
  url: string
  title: string
  user_id: string
  created_at: string
}

export default function Dashboard() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        window.location.href = '/'
      } else {
        setUser(data.user)
      }
    }

    loadUser()
  }, [])

  const fetchBookmarks = async () => {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Fetch error:', error)
    } else if (data) {
      setBookmarks(data)
    }
  }

  useEffect(() => {
    if (user) {
      fetchBookmarks()
    }
  }, [user])

  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('bookmarks-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookmarks',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchBookmarks()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const addBookmark = async () => {
    if (!url || !title || !user) return

    const { error } = await supabase.from('bookmarks').insert({
      url,
      title,
      user_id: user.id,
    })

    if (error) {
      console.error('Insert error:', error)
    }

    setUrl('')
    setTitle('')
  }

  const deleteBookmark = async (id: string) => {
    if (!id) return

    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Delete error:', error)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
  <div className="min-h-screen bg-gray-100 py-10">
    <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-2xl p-8">

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold text-gray-800">
          My Bookmarks
        </h1>
        <button
          onClick={signOut}
          className="bg-red-500 hover:bg-red-600 transition text-white px-4 py-2 rounded-lg"
        >
          Logout
        </button>
      </div>

      {/* Add Bookmark */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <input 
          className="border text-black border-gray-300 focus:ring-2 focus:ring-black focus:outline-none p-3 flex-1 rounded-lg"
          placeholder="Bookmark Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className="border text-black border-gray-300 focus:ring-2 focus:ring-black focus:outline-none p-3 flex-1 rounded-lg"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          onClick={addBookmark}
          disabled={!title || !url}
          className={`px-5 py-3 rounded-lg text-white transition ${
            !title || !url
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-black hover:bg-gray-800'
          }`}
        >
          Add
        </button>
      </div>

      {/* Bookmark List */}
      {bookmarks.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          No bookmarks yet. Add your first one 🚀
        </div>
      ) : (
        <ul className="space-y-4">
          {bookmarks.map((bookmark) => (
            <li
              key={bookmark.id}
              className="flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition p-4 rounded-xl border"
            >
              <div>
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-medium text-blue-600 hover:underline"
                >
                  {bookmark.title}
                </a>
                <p className="text-sm text-gray-500 truncate">
                  {bookmark.url}
                </p>
              </div>

              <button
                onClick={() => deleteBookmark(bookmark.id)}
                className="text-red-500 hover:text-red-600 transition"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
)
}
