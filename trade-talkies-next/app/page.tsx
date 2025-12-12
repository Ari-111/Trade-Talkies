import Link from "next/link"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Trade Talkies</h1>
      <p className="text-xl mb-8">Real-time chat for traders</p>
      <div className="flex gap-4">
        <Link 
          href="/sign-in" 
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Sign In
        </Link>
        <Link 
          href="/sign-up"
          className="px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md"
        >
          Sign Up
        </Link>
      </div>
    </div>
  )
}
