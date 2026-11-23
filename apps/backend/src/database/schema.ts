export type ProfileRow = {
  id: string
  email: string
  name: string
  picture_url: string | null
  created_at: string
}

export type DrawRow = {
  id: string
  name: string
  event_date: string
  budget: number | null
  drawn_at: string | null
  created_at: string
}

export type ParticipantRow = {
  id: string
  draw_id: string
  email: string
  user_id: string | null
  revealed_at: string | null
}

type AssignmentRow = {
  giver_id: string
  recipient_id: string
  draw_id: string
}

type ExcludedPairRow = {
  first_id: string
  second_id: string
  draw_id: string
}

type WishItemRow = {
  id: string
  owner_id: string
  name: string
  url: string | null
  price: number | null
  note: string | null
  priority: number
  photo_path: string | null
  created_at: string
}

type ListManagerRow = {
  id: string
  owner_id: string
  email: string
  created_at: string
}

type WishItemFields = Pick<
  WishItemRow,
  'name' | 'url' | 'price' | 'note' | 'priority' | 'photo_path'
>

type Relationship<Name extends string, Column extends string, Target extends string> = {
  foreignKeyName: Name
  columns: [Column]
  isOneToOne: false
  referencedRelation: Target
  referencedColumns: ['id']
}

/** The shape postgrest-js infers query results from; it mirrors `supabase/migrations`. */
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow
        Insert: never
        Update: never
        Relationships: []
      }
      draws: {
        Row: DrawRow
        Insert: never
        Update: never
        Relationships: []
      }
      excluded_pairs: {
        Row: ExcludedPairRow
        Insert: never
        Update: never
        Relationships: [
          Relationship<'excluded_pairs_first_id_fkey', 'first_id', 'participants'>,
          Relationship<'excluded_pairs_second_id_fkey', 'second_id', 'participants'>,
          Relationship<'excluded_pairs_draw_id_fkey', 'draw_id', 'draws'>,
        ]
      }
      participants: {
        Row: ParticipantRow
        Insert: never
        Update: never
        Relationships: [
          Relationship<'participants_draw_id_fkey', 'draw_id', 'draws'>,
          Relationship<'participants_user_id_fkey', 'user_id', 'profiles'>,
        ]
      }
      assignments: {
        Row: AssignmentRow
        Insert: never
        Update: never
        Relationships: [
          Relationship<'assignments_giver_id_fkey', 'giver_id', 'participants'>,
          Relationship<'assignments_recipient_id_fkey', 'recipient_id', 'participants'>,
          Relationship<'assignments_draw_id_fkey', 'draw_id', 'draws'>,
        ]
      }
      list_managers: {
        Row: ListManagerRow
        Insert: Pick<ListManagerRow, 'email'>
        Update: never
        Relationships: [Relationship<'list_managers_owner_id_fkey', 'owner_id', 'profiles'>]
      }
      wish_items: {
        Row: WishItemRow
        Insert: WishItemFields
        Update: Partial<WishItemFields>
        Relationships: [Relationship<'wish_items_owner_id_fkey', 'owner_id', 'profiles'>]
      }
    }
    Views: Record<never, never>
    Functions: {
      is_admin: { Args: never; Returns: boolean }
      ping: { Args: never; Returns: boolean }
      save_draw: {
        Args: {
          id: string | null
          name: string
          event_date: string
          budget: number | null
          emails: string[]
          excluded_pairs: [string, string][]
        }
        Returns: string
      }
      run_draw: { Args: { draw_id: string }; Returns: undefined }
      delete_draw: { Args: { draw_id: string }; Returns: undefined }
      finish_draw: { Args: { draw_id: string }; Returns: undefined }
      reveal_recipient: { Args: { draw_id: string }; Returns: undefined }
      my_wishlist: {
        Args: never
        Returns: (WishItemFields & { id: string; is_purchased: boolean })[]
      }
      mark_available: { Args: { item_id: string }; Returns: undefined }
      recipient_wishlist: {
        Args: { draw_id: string }
        Returns: (WishItemFields & { id: string; purchased_by: 'me' | 'other' | null })[]
      }
      set_purchased: {
        Args: { draw_id: string; item_id: string; purchased: boolean }
        Returns: undefined
      }
      managed_lists: {
        Args: never
        Returns: { id: string; name: string; picture_url: string | null }[]
      }
      managed_draws: {
        Args: { owner_id: string }
        Returns: { id: string; name: string; event_date: string }[]
      }
      managed_wishlist: {
        Args: { owner_id: string }
        Returns: (WishItemFields & { id: string; purchased_by: 'me' | 'other' | null })[]
      }
      set_managed_purchase: {
        Args: { item_id: string; draw_id: string | null; purchased: boolean }
        Returns: undefined
      }
      admin_users: {
        Args: never
        Returns: {
          id: string | null
          email: string
          name: string | null
          picture_url: string | null
          signs_in_with_password: boolean
          signs_in_with_google: boolean
          draw_count: number
        }[]
      }
      set_user_password: { Args: { user_id: string; password: string }; Returns: undefined }
    }
  }
}
