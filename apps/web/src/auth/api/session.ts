import { supabase } from './supabase'

export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession()

  if (error) throw error

  return data.session
}

export const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  })

  if (error) throw error
}

export const signInWithPassword = async (email: string, password: string) => {
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) throw error
}

export const signUp = async (name: string, email: string, password: string) => {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name } },
  })

  if (error) throw error
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()

  if (error) throw error
}

export const onUserChanged = (callback: (userId: string | null) => void) => {
  supabase.auth.onAuthStateChange((_event, session) => callback(session?.user.id ?? null))
}

export const onSignedOut = (callback: () => void) => {
  supabase.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_OUT') callback()
  })
}
