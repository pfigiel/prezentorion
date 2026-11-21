import { queryOptions } from '@tanstack/react-query'
import { getSession } from '@/auth/api/session'
import { supabase } from '@/auth/api/supabase'

const bucket = 'wish-photos'

/** Long enough to outlive a screen, short enough that a leaked link stops working the same day. */
const signedUrlLifetimeSeconds = 60 * 60

/** Uploads under the owner's folder, which is what the bucket's policies scope access by. */
export const uploadPhoto = async (file: File) => {
  const session = await getSession()

  if (session === null) throw new Error('Uploading a photo needs a signed-in user')

  const path = `${session.user.id}/${crypto.randomUUID()}`
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: file.type,
  })

  if (error) throw error

  return path
}

export const removePhoto = async (path: string) => {
  const { error } = await supabase.storage.from(bucket).remove([path])

  if (error) throw error
}

export const photoUrlQuery = (path: string) =>
  queryOptions({
    queryKey: ['photos', path],
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, signedUrlLifetimeSeconds)

      if (error) throw error

      return data.signedUrl
    },
    staleTime: (signedUrlLifetimeSeconds / 2) * 1000,
  })
