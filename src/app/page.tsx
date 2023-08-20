import AuthForm from '@/app/auth/components/AuthForm'

export default function Home() {
  return (
    <main className="prose">
      <div className="row">
      <div className="col-6">
        <h1 className="header">Login</h1>
      </div>
      <div className="col-6 auth-widget">
        <AuthForm />
      </div>
    </div>
    </main>
  )
}
