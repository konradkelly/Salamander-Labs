import { useEffect, useState, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getThumbnail } from '../mockApi.js';

export default function Preview() {
  const { filename } = useParams();
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [color, setColor] = useState("#ff0000");
  const [threshold, setThreshold] = useState(50);
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const [imageReady, setImageReady] = useState(false);

  const handleColorChange = (e) => {
    const nextColor = e.target.value;
    console.log('Color changed:', nextColor);
    setColor(nextColor);
  };

  const handleThresholdChange = (e) => {
    const nextThreshold = Number(e.target.value);
    console.log('Threshold changed:', nextThreshold);
    setThreshold(nextThreshold);
  };

 // Fetch thumbnail for current filename and manage loading/error state
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

  // Draw thumbnail image to canvas when thumbnailUrl changes
  useEffect(() => {
    if (!thumbnailUrl) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = thumbnailUrl;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
    };
  }, [thumbnailUrl]);

  useEffect(() => {
    if (!thumbnailUrl) return;

    setImageReady(false);
    
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      imgRef.current = img;
      setImageReady(true);
    };
    img.src = thumbnailUrl;
  }, [thumbnailUrl]);

  useEffect(() => {
    if (!imageReady) return;

    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const px = data.data;

    const tr = parseInt(color.slice(1, 3), 16);
    const tg = parseInt(color.slice(3, 5), 16);
    const tb = parseInt(color.slice(5, 7), 16);

    for (let i = 0; i < px.length; i += 4) {
      const dr = px[i]     - tr;
      const dg = px[i + 1] - tg;
      const db = px[i + 2] - tb;
      const dist = Math.sqrt(dr * dr + dg * dg + db * db);
      const on = dist <= threshold;
      px[i]     = on ? 255 : 0;
      px[i + 1] = on ? 255 : 0;
      px[i + 2] = on ? 255 : 0;
    }

    ctx.putImageData(data, 0, 0);
  }, [imageReady, color, threshold]);

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
      <canvas className="mt-4 w-full max-w-2xl rounded-xl border border-accent/45 bg-white/70 p-2" ref={canvasRef} />
      <div className="mt-4 grid max-w-2xl gap-4 rounded-xl border border-accent/45 bg-white/70 p-4">
        <label className="flex items-center justify-between gap-3 font-semibold text-primary" htmlFor="target-color">
          Target Color
          <input
            id="target-color"
            type="color"
            value={color}
            onChange={handleColorChange}
          />
        </label>
        <label className="font-semibold text-primary" htmlFor="threshold">
          Threshold: {threshold}
          <input
            id="threshold"
            className="mt-2 w-full"
            type="range"
            min="0"
            max="255"
            value={threshold}
            onChange={handleThresholdChange}
          />
        </label>
      </div>
      <Link
        className="mt-5 inline-block rounded-full border border-accent/55 bg-accent-soft px-4 py-2 font-semibold text-primary transition hover:bg-accent hover:text-white"
        to="/videos"
      >
        Back to videos
      </Link>
    </section>
  );
}