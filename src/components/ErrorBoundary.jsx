import React from 'react';

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4 text-center">
                    <h1 className="text-3xl font-bold text-red-500 mb-4">Something went wrong</h1>
                    <p className="mb-4 text-gray-300">The application crashed. Here is the error:</p>
                    <div className="bg-gray-800 p-4 rounded text-left overflow-auto max-w-full">
                        <code className="text-red-400 font-mono block mb-2">{this.state.error && this.state.error.toString()}</code>
                        <pre className="text-gray-500 text-xs">{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
                    </div>
                    <p className="mt-8 text-sm text-gray-500">Check your Developer Console (F12) for more details.</p>
                </div>
            );
        }

        return this.props.children;
    }
}
