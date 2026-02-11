import { useAuth } from "../context/AuthContext";
import { LogOut, Shield, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

function Particles() {
    return (
        <div className="particles">
            {[...Array(10)].map((_, i) => (
                <div key={i} className="particle" />
            ))}
        </div>
    );
}

export default function Layout({ children }) {
    const { logout, currentUser } = useAuth();

    return (
        <div className="min-h-screen animated-bg text-gray-100 font-sans relative overflow-hidden">
            <Particles />
            <nav className="glass border-b border-gray-700/50 sticky top-0 z-50 fade-in">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <Link to="/" className="flex items-center group">
                                <Shield className="w-8 h-8 text-indigo-500 mr-2 shield-bounce group-hover:text-indigo-400 transition-colors" />
                                <span className="font-bold text-xl tracking-tight gradient-text">PassMan</span>
                            </Link>
                        </div>
                        <div className="flex items-center">
                            <span className="mr-4 text-sm text-gray-400 hidden sm:block">{currentUser?.email}</span>
                            <Link 
                                to="/2fa" 
                                className="p-2 mr-2 rounded-lg hover:bg-indigo-500/20 text-gray-400 hover:text-indigo-400 transition-all duration-300 hover:scale-110" 
                                title="2FA Settings"
                            >
                                <ShieldCheck className="w-5 h-5" />
                            </Link>
                            <button
                                onClick={() => logout()}
                                className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all duration-300 hover:scale-110"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 relative z-10">
                <div className="fade-in">
                    {children}
                </div>
            </main>
        </div>
    );
}
