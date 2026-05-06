import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold text-emerald-400">StackSave</h1>
      <p className="mt-4 text-gray-400 text-lg text-center max-w-md">
        Find out if you're overspending on AI tools. Free audit in 2 minutes.
      </p>
      <Link
        href="/audit"
        className="mt-8 bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-8 py-4 rounded-xl text-lg transition"
      >
        Audit My AI Stack →
      </Link>
    </main>
  );
}