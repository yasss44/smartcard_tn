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
import Editor from './pages/EditorNew';
import CyberpunkLoginPage from './pages/CyberpunkLoginPage';

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
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/editor" element={<Editor />} />
              <Route path="/editor/:id" element={<Editor />} />
            </Routes>
          </Router>
        </DndProvider>
      </AuthProvider>
    </ToastContextProvider>
  );
}

export default App;
