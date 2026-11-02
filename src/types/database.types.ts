export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          headline: string | null;
          avatar_url: string | null;
          phone: string | null;
          location: string | null;
          linkedin_url: string | null;
          github_url: string | null;
          portfolio_url: string | null;
          tier: 'free' | 'pro' | 'premium';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          headline?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          location?: string | null;
          linkedin_url?: string | null;
          github_url?: string | null;
          portfolio_url?: string | null;
          tier?: 'free' | 'pro' | 'premium';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          headline?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          location?: string | null;
          linkedin_url?: string | null;
          github_url?: string | null;
          portfolio_url?: string | null;
          tier?: 'free' | 'pro' | 'premium';
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
