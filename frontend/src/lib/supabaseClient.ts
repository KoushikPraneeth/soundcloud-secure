import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://jwzfesynriagnyejmlyr.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3emZlc3lucmlhZ255ZWptbHlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk2Mjc2NDcsImV4cCI6MjA1NTIwMzY0N30.tuGJ6kGeQDHEhrtALmb_kH941uvHG-LbxJi9S9Lj38A";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
