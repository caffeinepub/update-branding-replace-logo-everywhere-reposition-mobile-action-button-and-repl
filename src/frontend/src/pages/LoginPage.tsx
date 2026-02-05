import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetSiteLogo } from '../hooks/useSiteLogo';
import { Button } from '@/components/ui/button';
import { SiCaffeine } from 'react-icons/si';
import { Heart } from 'lucide-react';

export default function LoginPage() {
  const { login, isLoggingIn } = useInternetIdentity();
  const { data: logoUrl } = useGetSiteLogo();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black via-black to-purple-950 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-900/30 border-2 border-purple-500/50 mb-6 shadow-lg shadow-purple-500/20">
            {logoUrl ? (
              <img 
                src={logoUrl}
                alt="Site Logo" 
                className="w-12 h-12"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-purple-800/20" />
            )}
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Welcome</h1>
          <p className="text-purple-300">Connect with Internet Identity to start chatting</p>
        </div>

        <div className="bg-black/40 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8 shadow-2xl shadow-purple-900/20">
          <Button
            onClick={login}
            disabled={isLoggingIn}
            className="w-full h-12 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/30 transition-all duration-200"
          >
            {isLoggingIn ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Connecting...
              </span>
            ) : (
              'Login with Internet Identity'
            )}
          </Button>

          <p className="text-sm text-purple-300/60 text-center mt-6">
            Secure authentication powered by Internet Computer
          </p>
        </div>

        <footer className="text-center mt-8 text-purple-300/40 text-sm">
          © 2026. Built with <Heart className="inline w-3 h-3 text-purple-400 fill-purple-400" /> using{' '}
          <a 
            href="https://caffeine.ai" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-purple-300 transition-colors inline-flex items-center gap-1"
          >
            <SiCaffeine className="inline w-3 h-3" />
            caffeine.ai
          </a>
        </footer>
      </div>
    </div>
  );
}
