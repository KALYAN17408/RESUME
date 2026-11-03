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
        Relationships: [];
      };
      resume_templates: {
        Row: {
          id: string;
          name: string;
          category: 'tech' | 'academic' | 'executive' | 'modern';
          description: string | null;
          thumbnail_url: string | null;
          is_pro_only: boolean;
          config: Json;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          category: 'tech' | 'academic' | 'executive' | 'modern';
          description?: string | null;
          thumbnail_url?: string | null;
          is_pro_only?: boolean;
          config?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: 'tech' | 'academic' | 'executive' | 'modern';
          description?: string | null;
          thumbnail_url?: string | null;
          is_pro_only?: boolean;
          config?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      resumes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          target_role: string | null;
          summary: string | null;
          template_id: string;
          customization: Json;
          personal_info: Json;
          sections_order: string[];
          enabled_sections: Json;
          is_primary: boolean;
          ats_score: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string;
          target_role?: string | null;
          summary?: string | null;
          template_id?: string;
          customization?: Json;
          personal_info?: Json;
          sections_order?: string[];
          enabled_sections?: Json;
          is_primary?: boolean;
          ats_score?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          target_role?: string | null;
          summary?: string | null;
          template_id?: string;
          customization?: Json;
          personal_info?: Json;
          sections_order?: string[];
          enabled_sections?: Json;
          is_primary?: boolean;
          ats_score?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      resume_sections: {
        Row: {
          id: string;
          resume_id: string;
          section_type: string;
          section_title: string;
          display_order: number;
          content: Json;
          is_visible: boolean;
          updated_at: string;
        };
        Insert: {
          id?: string;
          resume_id: string;
          section_type: string;
          section_title: string;
          display_order?: number;
          content?: Json;
          is_visible?: boolean;
          updated_at?: string;
        };
        Update: {
          id?: string;
          resume_id?: string;
          section_type?: string;
          section_title?: string;
          display_order?: number;
          content?: Json;
          is_visible?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      resume_versions: {
        Row: {
          id: string;
          resume_id: string;
          created_by: string;
          version_number: number;
          change_summary: string | null;
          snapshot: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          resume_id: string;
          created_by: string;
          version_number: number;
          change_summary?: string | null;
          snapshot: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          resume_id?: string;
          created_by?: string;
          version_number?: number;
          change_summary?: string | null;
          snapshot?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      ats_reports: {
        Row: {
          id: string;
          user_id: string;
          resume_id: string | null;
          resume_title: string | null;
          file_name: string | null;
          job_title: string | null;
          company_name: string | null;
          job_description: string;
          overall_score: number;
          keyword_score: number;
          skills_score: number;
          section_score: number;
          formatting_score: number;
          scores: Json;
          matched_keywords: Json;
          missing_keywords: Json;
          sections: Json;
          formatting: Json;
          recommendations: Json;
          raw_extracted_text: string | null;
          word_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          resume_id?: string | null;
          resume_title?: string | null;
          file_name?: string | null;
          job_title?: string | null;
          company_name?: string | null;
          job_description: string;
          overall_score: number;
          keyword_score: number;
          skills_score: number;
          section_score: number;
          formatting_score: number;
          scores?: Json;
          matched_keywords?: Json;
          missing_keywords?: Json;
          sections?: Json;
          formatting?: Json;
          recommendations?: Json;
          raw_extracted_text?: string | null;
          word_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          resume_id?: string | null;
          resume_title?: string | null;
          file_name?: string | null;
          job_title?: string | null;
          company_name?: string | null;
          job_description?: string;
          overall_score?: number;
          keyword_score?: number;
          skills_score?: number;
          section_score?: number;
          formatting_score?: number;
          scores?: Json;
          matched_keywords?: Json;
          missing_keywords?: Json;
          sections?: Json;
          formatting?: Json;
          recommendations?: Json;
          raw_extracted_text?: string | null;
          word_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
  };
}
