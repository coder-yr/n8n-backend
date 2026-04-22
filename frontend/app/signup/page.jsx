import AuthForm from "../../components/AuthForm";
import Link from "next/link";

export default function SignupPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AuthForm mode="signup" />
        <p className="mt-8 text-center text-sm text-slate-500 font-medium">
          Already a member?{" "}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors font-bold">
            Sign in to your account
          </Link>
        </p>
      </div>
    </main>
  );
}
