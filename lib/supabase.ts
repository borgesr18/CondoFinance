
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ccpoizyftzvbxdwdpkow.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjcG9penlmdHp2Ynhkd2Rwa293Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5ODg2OTksImV4cCI6MjA4MTU2NDY5OX0.8BkxvZvlRWWsetCPatv-YJw7niUPT_4JBbdbL4-N8yU';

export const isSupabaseConfigured = true;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
