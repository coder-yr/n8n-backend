import AuthForm from "../../components/AuthForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="mx-auto mt-20 max-w-md p-4">
      <AuthForm mode="login" />
      <p className="mt-4 text-center text-slate-400">
        No account? <Link href="/signup" className="text-indigo-400">Sign up</Link>
      </p>
    </main>
  );
}
