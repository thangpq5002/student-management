import React, { createContext, useContext, useState, useEffect } from 'react';

interface RouterContextType {
  pathname: string;
  push: (href: string) => void;
  replace: (href: string) => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

export const RouterProvider: React.FC<{ children: React.ReactNode; initialPath?: string }> = ({
  children,
  initialPath = '/dashboard',
}) => {
  const [pathname, setPathname] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (hash) return hash.startsWith('/') ? hash : `/${hash}`;
      const path = window.location.pathname;
      return path && path !== '/' ? path : initialPath;
    }
    return initialPath;
  });

  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        setPathname(hash.startsWith('/') ? hash : `/${hash}`);
      } else {
        setPathname(window.location.pathname || initialPath);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [initialPath]);

  const push = (href: string) => {
    setPathname(href);
    window.history.pushState({}, '', href);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const replace = (href: string) => {
    setPathname(href);
    window.history.replaceState({}, '', href);
  };

  return (
    <RouterContext.Provider value={{ pathname, push, replace }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = () => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return {
    push: context.push,
    replace: context.replace,
  };
};

export const usePathname = () => {
  const context = useContext(RouterContext);
  if (!context) {
    return '/dashboard';
  }
  return context.pathname;
};

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
}

export const Link: React.FC<LinkProps> = ({ href, children, className, onClick, ...rest }) => {
  const { push } = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e);
    if (!e.defaultPrevented && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
      e.preventDefault();
      push(href);
    }
  };

  return (
    <a href={href} className={className} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
};
