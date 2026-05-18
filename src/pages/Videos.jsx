import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getVideos } from '../mockApi.js';

export default function Videos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    getVideos()
    .then((data) => {
      setVideos(data); setLoading(false);
    })
    .catch((err) => {
      console.error(err);
      setError(err.message);
      setLoading(false);
    });
  }, []);

 if (loading) {
   return <p className="font-semibold text-primary">Loading videos...</p>;
  }

  if (error) {
    return (
      <p className="rounded-xl border border-rose-300 bg-rose-50 p-4 font-semibold text-rose-800" role="alert">
        Error: {error}
      </p>
    );
  }

  return (
    <section className="rounded-2xl border border-accent/35 bg-white/90 p-6 shadow-sm ring-2 ring-accent/20">
      <h1 className="mb-4 text-3xl font-extrabold uppercase tracking-wide text-secondary">Available Videos</h1>
      <ul className="space-y-3">
        {videos.map((filename) => (
          <li key={filename}>
            <Link
              className="block rounded-lg border border-accent/45 bg-white/70 px-4 py-2 font-semibold text-primary transition-colors transition-transform duration-200 hover:-translate-y-0.5 hover:border-accent hover:bg-accent-soft"
              to={`/preview/${filename}`}
            >
              {filename}
            </Link>
          </li>
          
        ))}
      </ul>
    </section>
  );
}