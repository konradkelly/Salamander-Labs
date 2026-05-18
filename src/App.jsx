import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Videos from './pages/Videos.jsx';
import Preview from './pages/Preview.jsx';

export default function App() {
  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-10 border-b border-accent/35 bg-accent-soft/70 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center gap-3 text-sm font-semibold uppercase tracking-wide">
          <Link className="rounded-full border border-secondary/85 bg-secondary/88 px-3 py-1 text-white shadow-md transition-colors transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[#6f42c1]" to="/">
            Home
          </Link>
          <Link className="rounded-full border border-secondary/85 bg-secondary/88 px-3 py-1 text-white shadow-md transition-colors transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[#6f42c1]" to="/videos">
            Videos
          </Link>
        </div>
      </nav>

      <main className="mx-auto w-full max-w-5xl px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/videos" element={<Videos />} />
          <Route path="/preview" element={<Preview />} />
          <Route path="/preview/:filename" element={<Preview />} />
        </Routes>
      </main>
    </div>
  );
}