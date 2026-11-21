import type { User } from '@/admin/api/admin'

export const signInLabelKeyOf = ({ signsInWithGoogle, signsInWithPassword }: User) => {
  if (signsInWithGoogle && signsInWithPassword) return 'admin.users.googleAndPassword'

  return signsInWithGoogle ? 'admin.users.google' : 'admin.users.password'
}
