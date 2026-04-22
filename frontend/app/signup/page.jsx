import AuthForm from "../../components/AuthForm";
import Link from "next/link";

export default function SignupPage() {
  return (
    <main className="mx-auto mt-20 max-w-md p-4">
      <AuthForm mode="signup" />
      <p className="mt-4 text-center text-slate-400">
        Already have an account? <Link href="/login" className="text-indigo-400">Login</Link>
      </p>
    </main>
  );
}
