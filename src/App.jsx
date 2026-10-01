import React from 'react';
import ChatInterface from './ChatInterface';

function App() {
  return (
    <div 
      className="min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=2400')" }}
    >
      {/* Mock website content to make the floating widget stand out */}
      <div className="p-12 max-w-4xl">
        <h1 className="text-5xl font-bold text-gray-900 mb-6 drop-shadow-sm">Welcome to Acme Corp</h1>
        <p className="text-xl text-gray-800 drop-shadow-sm max-w-2xl leading-relaxed">
          We are committed to providing the best workplace environment. Our core values drive innovation, integrity, and employee satisfaction across all global offices.
        </p>
      </div>

      <ChatInterface />
    </div>
  );
}

export default App;
