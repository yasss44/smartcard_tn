import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Pages
import Home from './pages/Home';
import Preview from './pages/Preview';
import Checkout from './pages/Checkout';
import CardView from './pages/CardView';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';
import CyberpunkLoginPage from './pages/CyberpunkLoginPage';
import Plans from './pages/Plans';
import AdminDashboard from './pages/AdminDashboard';
import AdminOrderDetails from './pages/AdminOrderDetails';
import OrderForm from './pages/OrderForm';
import AdminTest from './pages/AdminTest';

// Components
import ProtectedRoute from './components/ProtectedRoute';

// Context
import { AuthProvider } from './context/AuthContext';
import { ToastContextProvider } from './components/ui/ToastContext';



function App() {
  return (
    <ToastContextProvider>
      <AuthProvider>
        <DndProvider backend={HTML5Backend}>
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/preview/:id" element={<Preview />} />
              <Route path="/checkout/:id" element={<Checkout />} />
              <Route path="/card/:uniqueUrl" element={<CardView />} />
              <Route path="/login" element={<Login />} />
              <Route path="/cyberpunk-login" element={<CyberpunkLoginPage />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/plans" element={<Plans />} />
              <Route path="/order" element={<ProtectedRoute><OrderForm /></ProtectedRoute>} />
              <Route path="/editor" element={<ProtectedRoute><Editor /></ProtectedRoute>} />
              <Route path="/editor/:id" element={<ProtectedRoute><Editor /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/orders/:id" element={<ProtectedRoute adminOnly={true}><AdminOrderDetails /></ProtectedRoute>} />
              <Route path="/admin-test" element={<AdminTest />} />
            </Routes>
          </Router>
        </DndProvider>
      </AuthProvider>
    </ToastContextProvider>
  );
}

export default App;
