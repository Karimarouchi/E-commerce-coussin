import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AppearanceProvider } from './context/AppearanceContext'
import { CartProvider } from './context/CartContext'
import Layout from './components/layout/Layout'
import ScrollToTop from './components/ScrollToTop'
import Home from './pages/Home'
import Cart from './pages/Cart'
import Profile from './pages/Profile'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Login from './pages/Login'
import Signup from './pages/Signup'
import MixAndMatch from './pages/MixAndMatch'

export default function App() {
  return (
    <AppearanceProvider>
      <CartProvider>
      <BrowserRouter>
        <ScrollToTop />
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} theme="colored" />
        <Routes>
          {/* Auth pages — no header/footer */}
          <Route path="/login" element={<Login />} />
          <Route path="/inscription" element={<Signup />} />

          {/* Main layout with header/footer — Home is the default entry page */}
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="/" element={<Home />} />
            <Route path="/accueil" element={<Navigate to="/" replace />} />
            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route path="/panier" element={<Cart />} />
            <Route path="/profil" element={<Profile />} />
            <Route path="/produits" element={<Products />} />
            <Route path="/produits/:categorySlug" element={<Products />} />
            <Route path="/produits/:categorySlug/:subCategorySlug" element={<Products />} />
            <Route path="/collection/:collectionSlug" element={<Products />} />
            <Route path="/produit/:slug" element={<ProductDetail />} />
            <Route path="/mix-and-match/:rootSlug" element={<MixAndMatch />} />
            <Route path="/mix-and-match/:rootSlug/:subCategorySlug" element={<MixAndMatch />} />
            {/* Unknown URLs → Home (prod entry) */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
      </CartProvider>
    </AppearanceProvider>
  )
}
