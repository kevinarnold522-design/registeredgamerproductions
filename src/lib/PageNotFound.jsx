import { Link, useLocation } from 'react-router-dom';
import { Gamepad2, Home, ArrowLeft } from 'lucide-react';

export default function PageNotFound() {
    const location = useLocation();
    const pageName = location.pathname.substring(1);

    return (
        <div className="min-h-screen flex items-center justify-center p-6"
            style={{ background: "radial-gradient(ellipse at center, #0f0f2e 0%, #000000 100%)" }}>
            <div className="text-center space-y-6 max-w-md w-full">
                <div className="flex items-center justify-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                        <Gamepad2 className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-black text-white">
                        GAMER<span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> Productions</span>
                    </span>
                </div>

                <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-pink-500">404</h1>
                <h2 className="text-2xl font-bold text-white">Page Not Found</h2>
                <p className="text-gray-400">
                    {pageName ? `"/${pageName}"` : "This page"} doesn't exist or may have moved.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                    <Link to="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:opacity-90 transition-opacity">
                        <Home className="w-4 h-4" /> Go Home
                    </Link>
                    <button onClick={() => window.history.back()}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-700 text-gray-300 font-bold hover:bg-gray-900 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Go Back
                    </button>
                </div>
            </div>
        </div>
    );
}