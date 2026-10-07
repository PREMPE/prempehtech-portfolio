(() => {
  "use strict";

  const config = window.PREMPEHTECH_CLOUD_CONFIG || {};
  const STORAGE_KEY = "prempehtech-simulator-progress-v1";
  let client = null;
  let user = null;
  let authMode = "signin";

  const $ = (id) => document.getElementById(id);

  function configured() {
    return Boolean(
      config.enabled &&
      config.url &&
      config.anonKey &&
      window.supabase &&
      typeof window.supabase.createClient === "function"
    );
  }

  function localProgress() {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return {
        completed: value.completed || {},
        completedLevels: value.completedLevels || {},
        xp: Number(value.xp) || 0
      };
    } catch (_) {
      return { completed: {}, xp: 0 };
    }
  }

  function normalizeProgress(value) {
    return {
      completed: value && value.completed && typeof value.completed === "object" ? value.completed : {},
      completedLevels: value && value.completedLevels && typeof value.completedLevels === "object" ? value.completedLevels : {},
      xp: Number(value && value.xp) || 0
    };
  }

  function mergeProgress(local, remote) {
    const a = normalizeProgress(local);
    const b = normalizeProgress(remote);
    return {
      completed: { ...a.completed, ...b.completed },
      completedLevels: { ...a.completedLevels, ...b.completedLevels },
      xp: Math.max(a.xp, b.xp)
    };
  }

  function emitProgress(value) {
    window.dispatchEvent(new CustomEvent("prempeh-cloud-progress", {
      detail: normalizeProgress(value)
    }));
  }

  function setSaveStatus(text) {
    const el = $("saveStatus");
    if (el) el.textContent = text;
  }

  function setMessage(id, text, type) {
    const el = $(id);
    if (!el) return;
    el.textContent = text || "";
    el.className = "account-message" + (type ? " " + type : "");
  }

  function renderAuth() {
    if (!configured()) return;
    const accountBtn = $("accountBtn");
    if (accountBtn) {
      accountBtn.classList.remove("hidden");
      accountBtn.textContent = user ? "Account / Synced" : "Sign In / Save";
    }
    $("signedOutView")?.classList.toggle("hidden", Boolean(user));
    $("signedInView")?.classList.toggle("hidden", !user);
    if (user) {
      $("signedInEmail").textContent = user.email || "Player";
      setSaveStatus("Cloud synced");
    } else {
      setSaveStatus("This device");
    }
  }

  async function saveProgress(progress) {
    if (!client || !user) return;
    setSaveStatus("Syncing…");
    const payload = normalizeProgress(progress);
    const { error } = await client
      .from("simulator_progress")
      .upsert({
        user_id: user.id,
        progress: payload,
        updated_at: new Date().toISOString()
      }, { onConflict: "user_id" });
    if (error) {
      setSaveStatus("Saved locally");
      throw error;
    }
    setSaveStatus("Cloud synced");
  }

  async function syncFromCloud() {
    if (!client || !user) return;
    setSaveStatus("Syncing…");
    const { data, error } = await client
      .from("simulator_progress")
      .select("progress")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      setSaveStatus("Saved locally");
      throw error;
    }

    const merged = mergeProgress(localProgress(), data ? data.progress : {});
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    emitProgress(merged);
    await saveProgress(merged);
    return merged;
  }

  async function signIn(email, password) {
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    user = data.user;
    await syncFromCloud();
    renderAuth();
    return user;
  }

  async function signUp(email, password) {
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: "https://prempehtech.ca/simulator/" }
    });
    if (error) throw error;
    user = data.user;
    if (data.session && user) await syncFromCloud();
    renderAuth();
    return { user: data.user, session: data.session };
  }

  async function signOut() {
    if (!client) return;
    await client.auth.signOut();
    user = null;
    renderAuth();
  }

  function openDialog() {
    $("accountOverlay")?.classList.remove("hidden");
    setMessage("accountMessage", "");
    setMessage("syncMessage", "");
    setTimeout(() => $("accountEmail")?.focus(), 0);
  }

  function closeDialog() {
    $("accountOverlay")?.classList.add("hidden");
  }

  function setAuthMode(mode) {
    authMode = mode === "signup" ? "signup" : "signin";
    document.querySelectorAll(".auth-mode").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.authMode === authMode);
    });
    const submit = $("accountSubmit");
    const pass = $("accountPassword");
    if (submit) submit.textContent = authMode === "signup" ? "Create Account" : "Sign In";
    if (pass) pass.autocomplete = authMode === "signup" ? "new-password" : "current-password";
    setMessage("accountMessage", "");
  }

  async function init() {
    if (!configured()) {
      setSaveStatus("This device");
      return;
    }

    client = window.supabase.createClient(config.url, config.anonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });

    const { data } = await client.auth.getSession();
    user = data && data.session ? data.session.user : null;
    renderAuth();

    if (user) {
      try { await syncFromCloud(); } catch (_) {}
    }

    client.auth.onAuthStateChange(async (_event, session) => {
      user = session ? session.user : null;
      renderAuth();
      if (user) {
        try { await syncFromCloud(); } catch (_) {}
      }
    });

    $("accountBtn")?.addEventListener("click", openDialog);
    $("accountClose")?.addEventListener("click", closeDialog);
    $("accountOverlay")?.addEventListener("click", (event) => {
      if (event.target === $("accountOverlay")) closeDialog();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !$("accountOverlay")?.classList.contains("hidden")) closeDialog();
    });

    document.querySelectorAll(".auth-mode").forEach((btn) => {
      btn.addEventListener("click", () => setAuthMode(btn.dataset.authMode));
    });

    $("accountForm")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = $("accountEmail").value.trim();
      const password = $("accountPassword").value;
      const submit = $("accountSubmit");
      if (!email || password.length < 8) {
        setMessage("accountMessage", "Enter a valid email and a password of at least 8 characters.", "error");
        return;
      }
      submit.disabled = true;
      setMessage("accountMessage", authMode === "signup" ? "Creating your account…" : "Signing you in…");
      try {
        if (authMode === "signup") {
          const result = await signUp(email, password);
          if (result.session) {
            setMessage("accountMessage", "Account created and progress synced.", "success");
          } else {
            setMessage("accountMessage", "Account created. Check your email to confirm it, then sign in.", "success");
          }
        } else {
          await signIn(email, password);
          setMessage("accountMessage", "Signed in. Your progress is synced.", "success");
        }
      } catch (error) {
        setMessage("accountMessage", error && error.message ? error.message : "Account action failed. Try again.", "error");
      } finally {
        submit.disabled = false;
      }
    });

    $("syncNowBtn")?.addEventListener("click", async () => {
      setMessage("syncMessage", "Syncing…");
      try {
        await syncFromCloud();
        setMessage("syncMessage", "Progress synced successfully.", "success");
      } catch (error) {
        setMessage("syncMessage", "Cloud sync failed. Your progress is still saved on this device.", "error");
      }
    });

    $("signOutBtn")?.addEventListener("click", async () => {
      await signOut();
      setMessage("accountMessage", "Signed out. Guest progress will continue saving on this device.", "success");
    });
  }

  window.PrempehCloud = {
    isConfigured: configured,
    isSignedIn: () => Boolean(user),
    saveProgress,
    syncFromCloud
  };

  init().catch(() => setSaveStatus("This device"));
})();
