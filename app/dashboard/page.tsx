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
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Bookmarks</h1>
        <button
          onClick={signOut}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {/* Add Bookmark */}
      <div className="flex gap-2 mb-6">
        <input
          className="border p-2 flex-1 rounded"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className="border p-2 flex-1 rounded"
          placeholder="URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          onClick={addBookmark}
          className="bg-black text-white px-4 rounded"
        >
          Add
        </button>
      </div>

      {/* Bookmark List */}
      <ul className="space-y-3">
        {bookmarks.map((bookmark) => (
          <li
            key={bookmark.id}
            className="flex justify-between items-center border p-3 rounded"
          >
            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              {bookmark.title}
            </a>
            <button
              onClick={() => deleteBookmark(bookmark.id)}
              className="text-red-500"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
