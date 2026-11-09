
(() => {
  "use strict";

  const supabase = window.prosperaSupabase;

  const $ = (id) => document.getElementById(id);

  const status = $("auth-status");
  const form = $("auth-form");
  const sessionArea = $("auth-session");
  const userLabel = $("auth-user");

  function showMessage(message) {
    if (status) status.textContent = message;
  }

  function renderSession(session) {
    const loggedIn = Boolean(session);

    if (form) form.hidden = loggedIn;
    if (sessionArea) sessionArea.hidden = !loggedIn;

    if (loggedIn && userLabel) {
      userLabel.textContent =
        "Conta conectada: " + session.user.email;
      showMessage("Você está conectado à sua conta PROSPERA.");
    } else {
      showMessage("Entre ou crie sua conta para acessar sua agenda.");
    }
  }

  async function login() {
    const email = $("auth-email").value.trim();
    const password = $("auth-password").value;

    if (!email || !password) {
      showMessage("Informe seu e-mail e sua senha.");
      return;
    }

    showMessage("Entrando...");

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password
      });

    if (error) {
      showMessage("Não foi possível entrar: " + error.message);
      return;
    }

    renderSession(data.session);
  }

  async function signup() {
    const email = $("auth-email").value.trim();
    const password = $("auth-password").value;

    if (!email || !password) {
      showMessage("Informe seu e-mail e sua senha.");
      return;
    }

    if (password.length < 6) {
      showMessage("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    showMessage("Criando sua conta...");

    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      showMessage("Não foi possível criar a conta: " + error.message);
      return;
    }

    if (data.session) {
      renderSession(data.session);
    } else {
      showMessage(
        "Cadastro iniciado! Confira seu e-mail e confirme a conta. Depois volte aqui para entrar."
      );
    }
  }

  async function logout() {
    showMessage("Saindo da conta...");

    const { error } = await supabase.auth.signOut();

    if (error) {
      showMessage("Erro ao sair: " + error.message);
      return;
    }

    renderSession(null);
  }

  if (!supabase) {
    showMessage("Não foi possível carregar a conexão com o Supabase.");
    return;
  }

  $("login-button").addEventListener("click", login);
  $("signup-button").addEventListener("click", signup);
  $("logout-button").addEventListener("click", logout);

  supabase.auth.onAuthStateChange((_event, session) => {
    renderSession(session);
  });

  supabase.auth.getSession().then(({ data, error }) => {
    if (error) {
      showMessage("Não foi possível verificar sua sessão.");
      return;
    }

    renderSession(data.session);
  });
})();
