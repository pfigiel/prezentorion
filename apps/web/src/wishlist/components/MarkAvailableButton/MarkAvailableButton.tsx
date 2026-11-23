import { IconRefresh } from '@tabler/icons-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Button } from '@/ui/components/Button'
import { markAvailable, wishlistQuery, type Item } from '@/wishlist/api/wishlist'

type Props = {
  item: Item
}

export const MarkAvailableButton = ({ item }: Props) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const restore = useMutation({
    mutationFn: () => markAvailable(item.id),
    onSuccess: () => queryClient.invalidateQueries(wishlistQuery),
  })

  return (
    <Button
      variant="secondary"
      icon={<IconRefresh stroke={1.8} aria-hidden />}
      loading={restore.isPending}
      onClick={() => restore.mutate()}
    >
      {t('wishlist.form.markAvailable')}
    </Button>
  )
}
