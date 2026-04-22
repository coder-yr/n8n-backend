import AuthForm from "../../components/AuthForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AuthForm mode="login" />
        <p className="mt-8 text-center text-sm text-slate-500 font-medium">
          Don't have an account?{" "}
          <Link href="/signup" className="text-indigo-400 hover:text-indigo-300 transition-colors font-bold">
            Create one for free
          </Link>
        </p>
      </div>
    </main>
  );
}
