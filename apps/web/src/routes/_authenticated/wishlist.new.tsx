import { createFileRoute } from '@tanstack/react-router'
import { ItemForm } from '@/wishlist/components/ItemForm'

export const Route = createFileRoute('/_authenticated/wishlist/new')({
  component: ItemForm,
})
