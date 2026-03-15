import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import SearchResultPage from './pages/SearchResultPage'
import AddNumberPage from './pages/AddNumberPage'
import NumberDetailsPage from './pages/NumberDetailsPage'
import PlatformPage from './pages/PlatformPage'

// Admin imports
import {
  AdminAuthProvider,
  AdminLayout,
  AdminLogin,
  AdminDashboard,
  AdminReports,
  AdminRecords,
  AdminComments,
  AdminAuditLog,
  AdminUsers,
} from './admin'

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Layout><HomePage /></Layout>} />
      <Route path="/search/:phone" element={<Layout><SearchResultPage /></Layout>} />
      <Route path="/add" element={<Layout><AddNumberPage /></Layout>} />
      <Route path="/number/:id" element={<Layout><NumberDetailsPage /></Layout>} />
      <Route path="/phones" element={<Layout><PlatformPage platform="phone" /></Layout>} />
      <Route path="/instagram" element={<Layout><PlatformPage platform="instagram" /></Layout>} />
      <Route path="/whatsapp" element={<Layout><PlatformPage platform="whatsapp" /></Layout>} />
      <Route path="/telegram" element={<Layout><PlatformPage platform="telegram" /></Layout>} />

      {/* Admin routes */}
      <Route path="/admin/login" element={
        <AdminAuthProvider>
          <AdminLogin />
        </AdminAuthProvider>
      } />
      <Route path="/admin/*" element={
        <AdminAuthProvider>
          <Routes>
            <Route element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="records" element={<AdminRecords />} />
              <Route path="comments" element={<AdminComments />} />
              <Route path="audit" element={<AdminAuditLog />} />
              <Route path="users" element={<AdminUsers />} />
            </Route>
          </Routes>
        </AdminAuthProvider>
      } />
    </Routes>
  )
}

export default App
