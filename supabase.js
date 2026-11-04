
// ========================================
// PROSPERA — CONEXÃO COM SUPABASE
// ========================================

const SUPABASE_URL =
  "https://fwcfuxsvwexpuxozpkuj.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_Ba1XXaQ7tFaZg7ebr78rYg_uQas1i7D";

// Inicializar conexão
window.prosperaSupabase =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    }
  );

console.log("PROSPERA: conexão inicializada.");
