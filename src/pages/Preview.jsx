import { useEffect, useState, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getThumbnail } from '../mockApi.js';

export default function Preview() {
  const { filename } = useParams();
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const canvasRef = useRef(null)


  useEffect(() => {
    if (!filename) {
      setThumbnailUrl(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    getThumbnail(filename)
      .then((url) => {
        setThumbnailUrl(url);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, [filename]);
  useEffect(() => {
  if (!thumbnailUrl) return;

  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");

  const img = new Image();

  img.src = thumbnailUrl;

  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;

    ctx.drawImage(img, 0, 0);
  };
}, [thumbnailUrl]);

  let content;

  if (loading) {
    content = <p className="mt-3 font-semibold text-primary">Loading thumbnail...</p>;
  } else if (error) {
    content = (
      <p className="mt-3 rounded-xl border border-rose-300 bg-rose-50 p-4 font-semibold text-rose-800" role="alert">
        Error: {error}
      </p>
    );
  } else if (thumbnailUrl && filename) {
    content = (
      <img
        className="mt-4 w-full max-w-2xl rounded-xl border border-accent/45 bg-white/70 p-2"
        src={thumbnailUrl}
        alt={`Thumbnail for ${filename}`}
      />
    );
  } else {
    content = <p className="mt-3 text-primary">Choose a video from the Videos page to see its preview.</p>;
  }

  return (
    <section className="rounded-2xl border border-accent/35 bg-white/90 p-6 shadow-sm ring-2 ring-accent/20">
      <h1 className="text-3xl font-extrabold uppercase tracking-wide text-secondary">
        {filename ? `Preview: ${filename}` : 'Preview'}
      </h1>
      {content}
      <Link
        className="mt-5 inline-block rounded-full border border-accent/55 bg-accent-soft px-4 py-2 font-semibold text-primary transition hover:bg-accent hover:text-white"
        to="/videos"
      >
        Back to videos
      </Link>
    </section>
  );
}