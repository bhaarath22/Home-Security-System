import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// 1. -------- SUPABASE CLIENT SETUP --------
// Replace with your actual Supabase URL and Anon Key
// It's best to use environment variables for these
const SUPABASE_URL = 'https://huybwgkwpdeixwgiakbw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1eWJ3Z2t3cGRlaXh3Z2lha2J3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NTMyMDUsImV4cCI6MjA2OTUyOTIwNX0.xFZen-OHhGldcOl8pkbpzJKaGdOfJ1DcIEAxcY0DjkA';

// If the URL or Key is missing, show a message
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Supabase URL or Anon Key is missing. Please check your setup.");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// -------- UI COMPONENTS --------

// Form component for adding new messages
const MessageForm = ({ onMessageAdded }) => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      setError('Please enter both your name and a message.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 2. -------- CALL PYTHON BACKEND --------
      // This makes a POST request to our Python/FastAPI server
      const response = await fetch('http://127.0.0.1:8000/add-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, message }),
      });

      if (!response.ok) {
        // If the server response is not OK, throw an error
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to send message.');
      }

      // If successful, clear the form and trigger the parent component to refresh messages
      setName('');
      setMessage('');
      if (onMessageAdded) {
        onMessageAdded();
      }

    } catch (err) {
      console.error('Error submitting message:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">Leave a Message</h2>
      {error && <div className="p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-600 mb-1">Name</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Your Name"
        />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-600 mb-1">Message</label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          rows="4"
          placeholder="Write your message here..."
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
      >
        {loading ? 'Sending...' : 'Submit Message'}
      </button>
    </form>
  );
};


// Component to display the list of messages
const MessageList = ({ messages }) => {
  if (!messages.length) {
    return <p className="text-center text-gray-500 mt-8">No messages yet. Be the first to write one!</p>;
  }

  return (
    <div className="mt-8 space-y-4">
      {messages.map((msg) => (
        <div key={msg.id} className="p-4 bg-white rounded-lg shadow-md">
          <p className="text-gray-800">{msg.message}</p>
          <div className="flex justify-between items-center mt-3 text-sm">
            <p className="font-semibold text-indigo-600">- {msg.name}</p>
            <p className="text-gray-400">{new Date(msg.created_at).toLocaleString()}</p>
          </div>
        </div>
      ))}
    </div>
  );
};


// -------- MAIN APP COMPONENT --------
export default function App() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch messages from Supabase
  const fetchMessages = async () => {
    setLoading(true);
    try {
      // 3. -------- READ FROM SUPABASE --------
      // The frontend reads data directly from the Supabase 'messages' table
      const { data, error: fetchError } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false }); // Show newest first

      if (fetchError) {
        throw fetchError;
      }
      setMessages(data);
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError('Could not fetch messages. Make sure your Supabase credentials are correct and the service is running.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages on initial component load
  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-2xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Guestbook</h1>
          <p className="mt-2 text-lg text-gray-600">Powered by React, Python, and Supabase</p>
        </header>

        <main>
          <MessageForm onMessageAdded={fetchMessages} />
          {error && <div className="mt-6 p-3 bg-red-100 text-red-700 rounded-md text-center">{error}</div>}
          {loading ? (
            <p className="text-center text-gray-500 mt-8">Loading messages...</p>
          ) : (
            <MessageList messages={messages} />
          )}
        </main>
      </div>
    </div>
  );
}
