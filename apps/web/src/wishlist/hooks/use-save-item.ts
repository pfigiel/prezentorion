import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { removePhoto, uploadPhoto } from '@/wishlist/api/photos'
import { createItem, updateItem, wishlistQuery, type Item } from '@/wishlist/api/wishlist'
import { fieldsOf, type Draft } from '@/wishlist/utils/draft'

// A photo left behind in storage costs nothing anyone sees, so failing to delete one never fails a save.
const forgetPhoto = (path: string) => removePhoto(path).catch(() => undefined)

/** Uploads a picked photo first, so the item is saved pointing at a file that exists. */
export const useSaveItem = (item: Item | undefined) => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (draft: Draft) => {
      const uploaded = draft.photo.kind === 'picked' ? await uploadPhoto(draft.photo.file) : null
      const photoPath = uploaded ?? (draft.photo.kind === 'stored' ? draft.photo.path : null)
      const fields = fieldsOf(draft, photoPath)

      try {
        await (item === undefined ? createItem(fields) : updateItem(item.id, fields))
      } catch (error) {
        if (uploaded !== null) await forgetPhoto(uploaded)

        throw error
      }

      if (item?.photoPath && item.photoPath !== photoPath) await forgetPhoto(item.photoPath)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries(wishlistQuery)
      await navigate({ to: '/wishlist' })
    },
  })
}
