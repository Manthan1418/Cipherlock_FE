import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddPassword from './pages/AddPassword';
import Layout from './components/Layout';

const ProtectedRoute = ({ children }) => {
    const { currentUser } = useAuth();
    if (!currentUser) return <Navigate to="/login" />;
    return children;
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    <Route path="/" element={
                        <ProtectedRoute>
                            <Layout>
                                <Dashboard />
                            </Layout>
                        </ProtectedRoute>
                    } />

                    <Route path="/add" element={
                        <ProtectedRoute>
                            <Layout>
                                <AddPassword />
                            </Layout>
                        </ProtectedRoute>
                    } />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
