'use client';

// import { User } from '@supabase/supabase-js';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { createContext, use, useEffect, useState } from 'react';

// import { jwtDecode } from "jwt-decode";

// import { useGetBusinessProfileQuery } from '@/store/redux/slices/business/profile';
import { useLogOutMutation } from '@/store/redux/slices/user/auth';
import { Profile } from '@/store/redux/slices/user/profile';
import { useGetProfileAltQuery } from '@/store/redux/slices/user/profile';
import isAuthenticated from '@/utils/supabase/authorization';

export const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/register',
  '/auth/callbackv1',
  '/auth/forgot-password',
  '/',
  '/experiences/',
];

export type AuthContextType = {
  user: Profile | null;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const authKey = 'buddy-user';

export const useAuth = () => {
  const context = use(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const params = useParams();
  const experienceId = params?.['experienceId'];
  const router = useRouter();
  const [user, setUser] = useState<Profile | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [roleTracker, setRoleTracker] = useState<string | null>(null);
  // const [hash, setHash] = useState<string>("");
  const [logOut] = useLogOutMutation();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hash', window.location.hash);
    }
  }, []);

  const logout = async () => {
    localStorage.clear();
    sessionStorage.clear();
    await logOut();
    router.replace('/auth/login');
    return;
  };

  useEffect(() => {
    const checkUserAuth = async () => {
      try {
        const jwt = localStorage.getItem('jwt') || '';
        const role = localStorage.getItem('role') || '';
        const isValidJwt = await isAuthenticated(jwt);

        // Redirect to role-based dashboard if on root path with valid JWT and role
        if (pathname === '/auth/login' && isValidJwt && role) {
          router.replace(`/`);
          return;
        }

        // Allow access to public routes
        if (
          PUBLIC_ROUTES.includes(pathname!) ||
          pathname!.includes(experienceId as string)
        ) {
          setIsCheckingAuth(false);
          return;
        }

        // Redirect to login if no JWT OR if JWT is invalid
        if (!isValidJwt) {
          localStorage.clear();
          sessionStorage.clear();
          if (pathname === '/auth/register/business') {
            return;
          } else if (
            pathname?.includes('business') &&
            pathname !== '/auth/register/business'
          ) {
            router.replace('/auth/login/business');
            return;
          } else {
            router.replace('/');
            return;
          }
        }

        // If the role is 'user'
        if (
          role === 'user' &&
          (pathname!.includes('business') ||
            (pathname!.includes('experiences') && pathname!.includes('edit')) ||
            (pathname!.includes('experiences') &&
              pathname!.includes('create')) ||
            (pathname!.includes('activities') && pathname!.includes('create')))
        ) {
          router.replace('/'); // Redirect to a login
          return;
        }

        // Allow access to valid role-based or general routes
        const isRoleBasedPath = pathname!.includes(role);
        const isGeneralPath =
          !pathname!.includes('/business') && !pathname!.includes('/user');

        if (isRoleBasedPath || isGeneralPath) {
          setIsCheckingAuth(false);
          return;
        }

        // Redirect to role-based dashboard if accessing invalid role-specific path
        if (!pathname!.includes(role)) {
          router.replace(role === 'user' ? `/` : `/dashboard/business`);
        }
      } catch (error) {
        console.error('Error during authentication check:', error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkUserAuth();
  }, [pathname]);

  const {
    data: profile,
    error: profileErr,
    refetch,
  } = useGetProfileAltQuery(
    {
      role: 'user',
    },
    {
      skip: !roleTracker,
    },
  );

  useEffect(() => {
    const jwt = localStorage.getItem('jwt') || '';
    const role = localStorage.getItem('role') || null;
    setRoleTracker(role);
    isAuthenticated(jwt).then((isValidJwt) => {
      if (isValidJwt !== undefined && !user && profileErr) {
        refetch();
      }
      return;
    });

    if (profile && profile?.data) {
      setUser(profile?.data);
    }
  }, [profile, pathname, logout, profileErr, roleTracker]);

  // Show a loading state while checking authentication
  if (isCheckingAuth) {
    return null; // Optionally, replace with a loader component
  }

  return (
    <AuthContext
      value={{
        user,
        logout,
      }}
    >
      {children}
    </AuthContext>
  );
};

export default AuthProvider;
