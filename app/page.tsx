// app/page.tsx
import { redirect } from 'next/navigation';

export default function Home() {
    // Par défaut, on redirige vers le module Patient
    redirect('/patients');
}
