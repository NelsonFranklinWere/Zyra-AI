import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <main className="flex flex-col items-center justify-center gap-8 p-8">
        <h1 className="text-4xl font-bold">Welcome to Zyra</h1>
        <p className="text-lg text-muted-foreground">
          AI-powered WhatsApp Sales Automation Platform
        </p>
        <div className="flex gap-4">
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/register">Register</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}

