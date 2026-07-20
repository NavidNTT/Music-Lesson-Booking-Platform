import { Outlet } from 'react-router-dom';
import { Music4, Quote } from 'lucide-react';
import { Brand } from '@/shared/ui/Brand';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen">
      {/* Brand / artistic panel */}
      <div className="relative hidden w-1/2 overflow-hidden bg-ink-950 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(40rem 30rem at 20% 10%, rgba(227,171,51,0.25), transparent 60%), radial-gradient(30rem 30rem at 90% 90%, rgba(83,98,138,0.35), transparent 60%)',
          }}
          aria-hidden
        />
        <div className="relative">
          <Brand dark />
        </div>

        <div className="relative max-w-md">
          <Quote className="mb-4 h-10 w-10 text-gold-400/70" aria-hidden />
          <p className="font-display text-2xl font-medium leading-snug text-cream-50">
            Music is the space between the notes. Find the teacher who helps you hear it.
          </p>
          <div className="mt-8 flex items-center gap-3 text-ink-300">
            <Music4 className="h-5 w-5 text-gold-400" aria-hidden />
            <div className="h-1 flex-1 text-gold-500/50 waveform-accent" aria-hidden />
          </div>
        </div>

        <p className="relative text-sm text-ink-400">
          A premium marketplace for private music lessons.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-col items-center justify-center bg-cream-100 px-4 py-10 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Brand />
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
