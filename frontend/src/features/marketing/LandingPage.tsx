import { Link } from 'react-router-dom';
import { CalendarCheck, GraduationCap, Music4, Sparkles, Star, Wallet } from 'lucide-react';
import { Button, Card } from '@/shared/ui';
import { useInstruments } from '@/features/instruments/hooks';
import { useTeachers } from '@/features/teachers/hooks';
import { TeacherCard } from '@/features/teachers/components/TeacherCard';
import { CardSkeleton } from '@/shared/ui/Skeleton';

const steps = [
  {
    icon: GraduationCap,
    title: 'Discover teachers',
    description: 'Browse profiles, instruments, and real student ratings.',
  },
  {
    icon: CalendarCheck,
    title: 'Book a time',
    description: 'Pick an available slot that fits your week.',
  },
  {
    icon: Wallet,
    title: 'Pay from your wallet',
    description: 'Top up once, then book lessons in a tap.',
  },
  {
    icon: Star,
    title: 'Review & grow',
    description: 'Share feedback after each completed lesson.',
  },
];

export function LandingPage() {
  const instrumentsQuery = useInstruments(1);
  const teachersQuery = useTeachers({ page: 1 });

  const instruments = instrumentsQuery.data?.data.filter((i) => i.is_active).slice(0, 8) ?? [];
  const teachers = teachersQuery.data?.data.slice(0, 3) ?? [];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink-950">
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              'radial-gradient(45rem 35rem at 15% 0%, rgba(227,171,51,0.22), transparent 60%), radial-gradient(40rem 40rem at 95% 100%, rgba(83,98,138,0.4), transparent 55%)',
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-ink-800/70 px-3 py-1 text-xs font-medium text-gold-300">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Learn music from teachers you'll love
            </span>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-tight text-cream-50 sm:text-5xl">
              Private music lessons, <span className="text-gold-400">beautifully</span> booked.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-ink-200">
              Cadenza connects students with expert music teachers. Discover the right teacher,
              book a slot, and start playing.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/teachers">
                <Button size="lg">Find a teacher</Button>
              </Link>
              <Link to="/register">
                <Button size="lg" variant="outline" className="border-ink-600 text-cream-50 hover:bg-ink-800">
                  Become a teacher
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="relative h-1.5 w-full text-gold-500/40 waveform-accent" aria-hidden />
      </section>

      {/* Instruments strip */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold text-ink-900">Popular instruments</h2>
            <p className="mt-1 text-sm text-ink-500">Find a teacher for the instrument you love.</p>
          </div>
          <Link to="/instruments" className="text-sm font-medium text-gold-700 hover:underline">
            View all →
          </Link>
        </div>
        {instrumentsQuery.isLoading ? (
          <div className="flex flex-wrap gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-11 w-28 rounded-full" />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {instruments.map((instrument) => (
              <Link
                key={instrument.id}
                to={`/teachers?instrument=${instrument.slug}`}
                className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white px-4 py-2.5 text-sm font-medium text-ink-800 transition hover:border-gold-400 hover:bg-gold-50"
              >
                <Music4 className="h-4 w-4 text-gold-500" aria-hidden />
                {instrument.name}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="bg-cream-50 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center font-display text-2xl font-semibold text-ink-900">
            How Cadenza works
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Card key={step.title} className="p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-900 text-gold-400">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-gold-600">
                    Step {index + 1}
                  </p>
                  <h3 className="mt-1 font-display text-lg font-semibold text-ink-900">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-sm text-ink-500">{step.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured teachers */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-display text-2xl font-semibold text-ink-900">Featured teachers</h2>
          <Link to="/teachers" className="text-sm font-medium text-gold-700 hover:underline">
            Browse all →
          </Link>
        </div>
        {teachersQuery.isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : teachers.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {teachers.map((teacher) => (
              <TeacherCard key={teacher.id} teacher={teacher} />
            ))}
          </div>
        ) : (
          <Card className="p-10 text-center">
            <p className="text-ink-500">
              No teachers have joined yet. Be the first —{' '}
              <Link to="/register" className="font-medium text-gold-700 hover:underline">
                create a teacher account
              </Link>
              .
            </p>
          </Card>
        )}
      </section>
    </div>
  );
}
