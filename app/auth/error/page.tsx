export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <h1 className="font-space text-xl font-semibold text-black mb-2">
          Authentication error
        </h1>
        <p className="text-sm text-neutral-500 font-inter mb-6">
          Something went wrong. Please try again.
        </p>

        <a
          href="/auth/login"
          className="text-sm text-black font-medium underline underline-offset-2 font-inter"
        >
          Back to login
        </a>
      </div>
    </div>
  )
}