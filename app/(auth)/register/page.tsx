"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { createClientComponentClient } from "@/lib/supabase-client";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: undefined }, // Sin confirmación
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess("¡Registro exitoso! Ahora puedes iniciar sesión.");
      setTimeout(() => router.push("/login"), 1500);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black">
      <Image
        src="/images/hero_gym.jpg"
        alt="Register Hero"
        fill
        className="object-cover object-top absolute inset-0 z-0 grayscale"
        priority
      />
      <div className="absolute inset-0 bg-black/80 z-10" />
      <div className="relative z-20 w-full max-w-md px-6 py-10 flex flex-col items-center justify-center">
        <Image
          src="/images/logo_gym2.png"
          alt="Logo Gym Track Lnausan"
          width={320}
          height={120}
          className="drop-shadow-lg w-72 max-w-xs object-contain filter mix-blend-lighten mb-6"
          priority
        />
        <span className="inline-block bg-blue-500 text-black font-bold px-4 py-1 rounded-lg mb-6 text-lg shadow">
          DO IT NOW
        </span>
        <form
          onSubmit={handleRegister}
          className="w-full bg-black/70 rounded-2xl p-8 shadow-2xl flex flex-col gap-4"
        >
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white/10 text-white border-2 border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-300 font-medium"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white/10 text-white border-2 border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-300 font-medium"
          />
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          {success && <p className="text-green-400 text-sm text-center">{success}</p>}
          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-2 bg-blue-500 text-black font-bold py-3 rounded-full text-lg shadow-lg hover:bg-blue-600 transition flex items-center justify-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Registrando...
              </span>
            ) : (
              'REGISTRARME'
            )}
          </button>
        </form>
        <div className="mt-6 text-center">
          <span className="text-gray-300">¿Ya tienes cuenta? </span>
          <a href="/login" className="text-blue-400 font-bold hover:underline transition">Entrar</a>
        </div>
      </div>
    </div>
  );
} 