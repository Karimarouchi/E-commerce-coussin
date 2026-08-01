import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface">
      <Header />
      <main className="flex-1 pt-0 flex flex-col">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
