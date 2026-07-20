import { Link } from 'react-router-dom';
import { Compass, ShieldAlert } from 'lucide-react';
import { Button } from '@/shared/ui';

function CenteredMessage({
  code,
  title,
  description,
  icon,
  action,
}: {
  code: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: React.ReactNode;
}) {
  return (
    <div className="app-shell-bg flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-ink-900 text-gold-400">
        {icon}
      </div>
      <p className="font-display text-5xl font-semibold text-ink-900">{code}</p>
      <h1 className="mt-2 font-display text-xl font-semibold text-ink-800">{title}</h1>
      <p className="mt-2 max-w-sm text-sm text-ink-500">{description}</p>
      <div className="mt-6">{action}</div>
    </div>
  );
}

export function ForbiddenPage() {
  return (
    <CenteredMessage
      code="403"
      title="Access denied"
      description="You don't have permission to view this page. If you think this is a mistake, contact support."
      icon={<ShieldAlert className="h-8 w-8" aria-hidden />}
      action={
        <Link to="/">
          <Button>Back to home</Button>
        </Link>
      }
    />
  );
}

export function NotFoundPage() {
  return (
    <CenteredMessage
      code="404"
      title="Page not found"
      description="The page you're looking for doesn't exist or may have been moved."
      icon={<Compass className="h-8 w-8" aria-hidden />}
      action={
        <Link to="/">
          <Button>Back to home</Button>
        </Link>
      }
    />
  );
}
