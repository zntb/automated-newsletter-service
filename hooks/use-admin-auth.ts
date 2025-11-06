'use client';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useAdminAuth() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoading, setIsLoading] = useState(true);

  // useEffect(() => {
  //   const token = localStorage.getItem("admin_token")
  //   setIsAuthenticated(!!token)
  //   setIsLoading(false)

  //   if (!token) {
  //     router.push("/admin/login")
  //   }
  // }, [router])

  const login = (token: string) => {
    localStorage.setItem('admin_token', token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setIsAuthenticated(false);
    router.push('/admin/login');
  };

  return { isAuthenticated, isLoading, login, logout };
}
