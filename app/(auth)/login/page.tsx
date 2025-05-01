'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function AuthPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Si ya está logueado, redirigir
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push("/");
      }
    });
  }, [supabase, router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) return;

    let result;
    if (isLogin) {
      result = await supabase.auth.signInWithPassword({ email, password });
    } else {
      result = await supabase.auth.signUp({ email, password });
    }

    if (result.error) {
      setError(result.error.message);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-16 p-6 border rounded shadow bg-white">
      <h2 className="text-2xl font-bold mb-4 text-center">
        {isLogin ? "Iniciar sesión" : "Crear cuenta"}
      </h2>

      <form onSubmit={handleAuth} className="space-y-4">
        <input
          type="email"
          placeholder="Correo electrónico"
          className="w-full border px-4 py-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          className="w-full border px-4 py-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {isLogin ? "Entrar" : "Registrarse"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm">
        {isLogin ? "¿No tenés cuenta?" : "¿Ya tenés una cuenta?"}{" "}
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-blue-600 underline"
        >
          {isLogin ? "Registrarse" : "Iniciar sesión"}
        </button>
      </p>
    </div>
  );
}
