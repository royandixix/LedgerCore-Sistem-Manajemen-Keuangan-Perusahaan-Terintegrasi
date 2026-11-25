"use server";

import { createClient } from "../../../lib/supabase/server";

type LoginInput = { email: string; password: string };
type LoginResult = { ok: boolean; message: string };

export async function loginWithPassword(input: LoginInput): Promise<LoginResult> {
  const email = typeof input?.email === "string" ? input.email.trim() : "";
  const password = typeof input?.password === "string" ? input.password : "";
  if (!email || !password || email.length > 254 || password.length > 4096) {
    return { ok: false, message: "Masukkan email dan password yang valid." };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session?.access_token) {
      return {
        ok: false,
        message: "Login ditolak Supabase. Periksa email, password, atau status akun.",
      };
    }

    const { data: verified, error: verifyError } = await supabase.auth.getClaims();
    if (verifyError || !verified?.claims) {
      return {
        ok: false,
        message: "Login berhasil, tetapi session belum dapat diverifikasi di server. Periksa konfigurasi cookie Supabase.",
      };
    }

    const base = (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000/api/v1").replace(/\/+$/, "");
    let response: Response;
    try {
      response = await fetch(`${base}/auth/dashboard-access`, {
        method: "GET",
        headers: { Authorization: `Bearer ${data.session.access_token}` },
        cache: "no-store",
      });
    } catch {
      return { ok: false, message: "Session valid, tetapi backend NestJS tidak bisa dihubungi." };
    }

    if (response.status === 401) {
      return { ok: false, message: "Session valid di Supabase, tetapi NestJS menolak token (HTTP 401). Periksa kesesuaian project Supabase pada frontend dan backend." };
    }
    if (response.status === 403) {
      return { ok: false, message: "Login berhasil, tetapi akun belum mempunyai role global untuk akses dashboard (HTTP 403)." };
    }
    if (!response.ok) {
      return { ok: false, message: `Login berhasil, tetapi pemeriksaan akses backend gagal (HTTP ${response.status}).` };
    }

    let payload: unknown;
    try { payload = await response.json(); }
    catch { return { ok: false, message: "Respons akses backend tidak dapat dibaca." }; }
    if (!payload || typeof payload !== "object" || (payload as { status?: unknown }).status !== "authorized") {
      return { ok: false, message: "Login berhasil, tetapi backend tidak mengonfirmasi akses dashboard." };
    }
    return { ok: true, message: "" };
  } catch {
    return { ok: false, message: "Gagal memproses login melalui server. Periksa Terminal Next.js." };
  }
}
