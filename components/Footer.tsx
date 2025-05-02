'use client';

import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@/lib/supabase-client';

export default function Footer() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <footer className="flex justify-end p-4 border-t dark:border-gray-700">
      <button
        onClick={handleLogout}
        className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 text-sm"
      >
        Cerrar sesión
      </button>
    </footer>
  );
}
