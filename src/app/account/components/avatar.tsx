'use client'
import React, { useEffect, useState } from 'react'
import { Database } from '@/lib/schema'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Image from 'next/image'

import Toast, {ToastProps} from '@/components/Toast' 

type Profiles = Database['public']['Tables']['profiles']['Row']

export default function Avatar({
  uid,
  url,
  size,
  onUpload,
}: {
  uid: string
  url: Profiles['avatar_url']
  size: number
  onUpload: (url: string) => void
}) {
  const supabase = createClientComponentClient<Database>()
  const [avatarUrl, setAvatarUrl] = useState<Profiles['avatar_url']>(url)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    async function downloadImage(path: string) {
      try {
        const { data, error } = await supabase.storage.from('avatars').download(path)
        if (error) {
          throw error
        }

        const url = URL.createObjectURL(data)
        setAvatarUrl(url)
      } catch (error) {
        console.log('Error downloading image: ', error)
      }
    }

    if (url) downloadImage(url)
  }, [url, supabase])

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<ToastProps['type']>('success');


  const uploadAvatar: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const filePath = `${uid}-${Math.random()}.${fileExt}`

      let { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      onUpload(filePath)

      // Show success toast
      setToastMessage("Avatar uploaded successfully!");
      setToastType("success");

      // Hide toast after 3 seconds
      setTimeout(() => setToastMessage(null), 2000);

    } catch (error) {
        setToastMessage("Error uploading avatar!");
        setToastType("error");
        // Hide toast after 3 seconds
        setTimeout(() => setToastMessage(null), 2000);
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center mt-6">
    <Toast message={toastMessage} type={toastType} />

    {avatarUrl ? (
        <Image
            width={size}
            height={size}
            src={avatarUrl}
            alt="Avatar"
            className="avatar image rounded-full object-cover"
            style={{ height: size, width: size }}
        />
    ) : (
        <div
            className="avatar no-image bg-gray-200 rounded-full"
            style={{ height: size, width: size }}
        />
    )}
    <div className="mt-4" style={{ width: size }}>
        <label
            className={`button hover:cursor-pointer primary block w-full text-center p-1 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-100 ${uploading ? 'border-gray-300 text-gray-300' : ''}`}
            htmlFor="single"
        >
            {uploading ? 'Uploading ...' : 'Upload'}
        </label>
        <input
            className="hidden"
            type="file"
            id="single"
            accept="image/*"
            onChange={uploadAvatar}
            disabled={uploading}
        />
    </div>
</div>

  )
}