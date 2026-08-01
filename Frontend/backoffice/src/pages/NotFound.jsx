import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center px-4">
      <p className="text-8xl font-extrabold text-blue-600">404</p>
      <h1 className="mt-4 text-2xl font-bold text-gray-800">Page introuvable</h1>
      <p className="mt-2 text-gray-500">La page que vous cherchez n&apos;existe pas.</p>
      <Link
        to="/dashboard"
        className="mt-6 px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
      >
        Retour au Dashboard
      </Link>
    </div>
  )
}

export default NotFound
