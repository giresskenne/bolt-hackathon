import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function TextArea() {
  /* simple local demo state */
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const inputRef = useRef(null);
  const scrollAreaRef = useRef(null);

  /* auto-grow the textarea */
  useEffect(() => {
    if (!inputRef.current) return;
    inputRef.current.style.height = 'auto';
    inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
  }, [input]);

  /* auto-scroll to newest message */
  useEffect(() => {
    scrollAreaRef.current?.scrollTo({ top: scrollAreaRef.current.scrollHeight });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages((m) => [...m, input.trim()]);
    setInput('');
  };

  return (
    <div className="min-h-screen bg-discord-hero text-white">
      {/* ───────── nav bar ───────── */}
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/20 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-3 hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <img src="/extension/icons/Logo.png" alt="Prompt-Scrubber Logo" className="h-8 w-8" />
            <span className="text-xl font-bold">Prompt-Scrubber Demo</span>
          </Link>

          <Link to="/" className="hover:text-primary-light transition-colors">
            ← Back&nbsp;to&nbsp;Home
          </Link>
        </div>
      </nav>

      {/* ───────── main ───────── */}
      <main className="pt-24 pb-12 px-6">
        <div className="mx-auto max-w-3xl">
          {/* header */}
          <header className="mb-8 text-center">
            <h1 className="mb-4 text-4xl font-bold lg:text-5xl">
              Try <span className="text-primary-light">Prompt-Scrubber</span>
            </h1>
            <p className="mx-auto max-w-3xl text-xl text-gray-300">
              Type or paste any text below to see how Prompt-Scrubber protects your sensitive
              information in real-time.
            </p>
          </header>

          {/* chat card */}
          <section className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-lg">
            {/* scrollable message history */}
            <div
              ref={scrollAreaRef}
              className="max-h-[50vh] overflow-y-auto space-y-4 p-6"
            >
              {messages.length === 0 ? (
                <p className="text-center text-gray-400">No messages yet — start typing below.</p>
              ) : (
                messages.map((m, i) => (
                  <div
                    key={i}
                    className="ml-auto max-w-sm rounded-2xl bg-primary/20 px-4 py-2 text-sm text-white"
                  >
                    {m}
                  </div>
                ))
              )}
            </div>

            {/* input bar */}
            <form onSubmit={handleSend} className="border-t border-white/10 p-4">
              <textarea
                ref={inputRef}
                rows={3}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Start typing…"
                className="w-full resize-none rounded-xl bg-white px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary"
                style={{ maxHeight: '40vh' }}
              />
            </form>
          </section>

          {/* helper chips */}
          <div className="mt-6 text-center text-gray-400">
            <p>Try entering sensitive information like:</p>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {['Email Addresses', 'Phone Numbers', 'API Keys', 'Credit Cards'].map((chip) => (
                <span key={chip} className="rounded-full bg-white/5 px-3 py-1 text-sm">
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
