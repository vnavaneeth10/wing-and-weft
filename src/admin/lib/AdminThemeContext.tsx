// src/admin/lib/AdminThemeContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

type AdminTheme = 'dark' | 'light';

interface AdminThemeCtx {
  adminTheme: AdminTheme;
  toggleAdminTheme: () => void;
  isDarkAdmin: boolean;
}

const AdminThemeContext = createContext<AdminThemeCtx>({
  adminTheme: 'dark',
  toggleAdminTheme: () => {},
  isDarkAdmin: true,
});

export const AdminThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminTheme, setAdminTheme] = useState<AdminTheme>(() => {
    try { return (localStorage.getItem('admin-theme') as AdminTheme) || 'dark'; }
    catch { return 'dark'; }
  });

  useEffect(() => {
    localStorage.setItem('admin-theme', adminTheme);
  }, [adminTheme]);

  const toggleAdminTheme = () => setAdminTheme(t => t === 'dark' ? 'light' : 'dark');

  return (
    <AdminThemeContext.Provider value={{ adminTheme, toggleAdminTheme, isDarkAdmin: adminTheme === 'dark' }}>
      {children}
    </AdminThemeContext.Provider>
  );
};

export const useAdminTheme = () => useContext(AdminThemeContext);