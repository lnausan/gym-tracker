'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@/lib/supabase-client';
import { Moon } from 'lucide-react';

export default function UserMenu() {
  const supabase = createClientComponentClient();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserEmail(user?.email ?? null);
    };

    fetchUser();
  }, [supabase]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark', !darkMode);
  };

  if (!userEmail) return null;

  return (
    <header className="flex justify-between items-center p-4 border-b dark:border-gray-700">
      <span className="text-sm text-gray-700 dark:text-gray-200">🏋️ {userEmail}</span>
      <button
        onClick={toggleDarkMode}
        className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
        aria-label="Toggle dark mode"
      >
        <Moon size={18} />
      </button>
    </header>
  );
}
