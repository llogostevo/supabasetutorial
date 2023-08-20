'use client'
import { useCallback, useEffect, useState } from 'react'
import { Database } from '@/lib/schema'
import { Session, createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Avatar from './avatar'

import Toast, { ToastProps } from '@/components/Toast'


export default function AccountForm({ session }: { session: Session | null }) {
  const supabase = createClientComponentClient<Database>()
  const [loading, setLoading] = useState(true)
  const [fullname, setFullname] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [website, setWebsite] = useState<string | null>(null)
  const [avatar_url, setAvatarUrl] = useState<string | null>(null)
  const user = session?.user

  // Toast state variables
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<ToastProps['type']>('success');

  const getProfile = useCallback(async () => {
    try {
      setLoading(true)

      let { data, error, status } = await supabase
        .from('profiles')
        .select(`full_name, username, website, avatar_url`)
        .eq('id', user?.id)
        .single()

      if (error && status !== 406) {
        throw error
      }

      if (data) {
        setFullname(data.full_name)
        setUsername(data.username)
        setWebsite(data.website)
        setAvatarUrl(data.avatar_url)
      }
    } catch (error) {
      setToastMessage("Error loading user data!");
      setToastType("error");
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  // potentially remove
  useEffect(() => {
    getProfile()
  }, [user, getProfile])

  async function updateProfile({
    username,
    website,
    avatar_url,
  }: {
    username: string | null
    fullname: string | null
    website: string | null
    avatar_url: string | null
  }) {
    try {
      setLoading(true)

      let { error } = await supabase.from('profiles').upsert({
        id: user?.id as string,
        full_name: fullname,
        username,
        website,
        avatar_url,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      setToastMessage("Profile updated!");
      setToastType("success");
      setTimeout(() => setToastMessage(null), 4000);

    } catch (error) {
      setToastMessage("Error updating the data!");
      setToastType("error");
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setLoading(false)
    }
  }

  return (            
    <div className="form-widget prose w-full max-w-md mx-auto p-8 bg-white shadow-md rounded-lg">
    <Toast message={toastMessage} type={toastType} /> {/* Render the Toast component */}    

      <Avatar
        uid={user.id}
        url={avatar_url}
        size={150}
        onUpload={(url) => {
          setAvatarUrl(url)
          updateProfile({ fullname, username, website, avatar_url: url })
        }}
      />
      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-2">Email</label>
        <input className="w-full p-2 border rounded-md" id="email" type="text" value={session?.user.email} disabled />
      </div>
      <div className="mb-4">
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-600 mb-2">Full Name</label>
        <input
          className="w-full p-2 border rounded-md"
          id="fullName"
          type="text"
          value={fullname || ''}
          onChange={(e) => setFullname(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label htmlFor="username" className="block text-sm font-medium text-gray-600 mb-2">Username</label>
        <input
          className="w-full p-2 border rounded-md"
          id="username"
          type="text"
          value={username || ''}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label htmlFor="website" className="block text-sm font-medium text-gray-600 mb-2">Website</label>
        <input
          className="w-full p-2 border rounded-md"
          id="website"
          type="url"
          value={website || ''}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <button
          className="w-full p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          onClick={() => updateProfile({ fullname, username, website, avatar_url })}
          disabled={loading}
        >
          {loading ? 'Loading ...' : 'Update'}
        </button>
      </div>
      <div className="mb-4">
        <form action="/auth/signout" method="post">
          <button className="w-full p-2 bg-red-500 text-white rounded-md hover:bg-red-600" type="submit">
            Sign out
          </button>
        </form>
      </div>
    </div>
  )
}