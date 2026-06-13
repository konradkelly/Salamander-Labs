import { useEffect, useState, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getThumbnail, submitProcessingJob, getJobStatus } from '../api.js';

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
  const [submitState, setSubmitState] = useState('idle');
  const [submitError, setSubmitError] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);
  const [csvUrl, setCsvUrl] = useState(null);

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

  async function handleSubmit() {
    if (!filename || loading || submitState === 'submitting') {
      return;
    }

    setSubmitState('submitting');
    setSubmitError(null);
    setJobId(null);
    setJobStatus(null);
    setCsvUrl(null);

    try {
      const result = await submitProcessingJob(filename, color, threshold);
      setJobId(result.jobId);
      setSubmitState('submitted');
    } catch (err) {
      console.error(err);
      setSubmitError(err.message);
      setSubmitState('error');
    }
  }

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
      
  // find centroid with BFS
  const W = canvas.width;
  const H = canvas.height;
  // px[] is already the binarized data array (white=on, black=off)
  const visited = new Uint8Array(W * H);
  let best = null; // { size, cx, cy }

  for (let r = 0; r < H; r++) {
    for (let c = 0; c < W; c++) {
      const idx = r * W + c;
      if (px[idx * 4] !== 255 || visited[idx]) continue;

      // BFS (mirrors salamanderSearch)
      const queue = [idx];
      visited[idx] = 1;
      let head = 0, size = 0, sumC = 0, sumR = 0;

      while (head < queue.length) {
        const i = queue[head++];
        const ir = Math.floor(i / W);
        const ic = i % W;
        size++;
        sumC += ic;
        sumR += ir;

        for (const [nr, nc] of [[ir-1,ic],[ir+1,ic],[ir,ic-1],[ir,ic+1]]) {
          if (nr >= 0 && nr < H && nc >= 0 && nc < W) {
            const ni = nr * W + nc;
            if (!visited[ni] && px[ni * 4] === 255) {
              visited[ni] = 1;
              queue.push(ni);
            }
          }
        }
      }

      if (!best || size > best.size) {
        best = { size, cx: sumC / size, cy: sumR / size };
      }
    }
  }

  if (best) {
    ctx.beginPath();
    ctx.arc(best.cx, best.cy, 6, 0, 2 * Math.PI);
    ctx.fillStyle = '#f97316';
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  }, [imageReady, color, threshold]);

  useEffect(() => {
    if (submitState === 'submitting') {
      return;
    }
    setSubmitState('idle');
    setSubmitError(null);
    setJobId(null);
  }, [filename, color, threshold]);

useEffect(() => {
  if (!jobId) return;

  const intervalId = setInterval(async () => {
    try {
      const result = await getJobStatus(jobId);

      setJobStatus(result.status);

      if (result.status === 'complete') {
        setCsvUrl(result.csvUrl);
        clearInterval(intervalId);
      }

      if (result.status === 'failed') {
        clearInterval(intervalId);
      }
    } catch (err) {
      console.error(err);
      clearInterval(intervalId);
    }
  }, 1500);

  return () => clearInterval(intervalId);
}, [jobId]);
 

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
        className="h-full w-full rounded-xl border border-accent/45 bg-white/70 object-contain p-2"
        src={thumbnailUrl}
        alt={`Thumbnail for ${filename}`}
      />
    );
  } else {
    content = <p className="mt-3 text-primary">Choose a video from the Videos page to see its preview.</p>;
  }

  const canSubmit = Boolean(filename) && !loading && !error;

  let submitButtonText = 'Submit processing job';
  if (submitState === 'submitting') {
    submitButtonText = 'Submitting...';
  } else if (submitState === 'submitted') {
    submitButtonText = 'Submitted';
  } else if (submitState === 'error') {
    submitButtonText = 'Retry submit';
  }

  return (
    <section className="rounded-2xl border border-accent/35 bg-white/90 p-6 shadow-sm ring-2 ring-accent/20">
      {/* <h1 className="text-3xl font-extrabold uppercase tracking-wide text-secondary"> */}
      <h1 className="text-4xl font-black uppercase tracking-wide text-secondary">
  
        {filename ? `Preview: ${filename}` : 'Preview'}
      </h1>
      <div className="mt-4 flex gap-4">
        <div className="min-w-0 flex-1">{content}</div>
        <canvas className="min-w-0 flex-1 rounded-xl border border-accent/45 bg-white/70 p-2" ref={canvasRef} />
      </div>
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
        <div className="flex flex-wrap items-center gap-3">
          <button
            id="submit-processing"
            className="rounded-full border border-accent/55 bg-accent-soft px-4 py-2 font-semibold text-primary transition hover:bg-accent hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || submitState === 'submitting'}
          >
            {submitButtonText}
          </button>
          {submitState === 'submitting' && (
            <p className="font-semibold text-primary" role="status">
              Submitting job...
            </p>
          )}
          {submitState === 'submitted' && (
            <p className="font-semibold text-emerald-700" role="status">
              Job submitted successfully: {jobId}
            </p>
          )}
          {jobStatus && (
      <p className="font-semibold text-primary">
      Status: {jobStatus}
      </p>
          )}

        {csvUrl && (
          <a
            href={csvUrl}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-blue-600 underline"
          >
            Download CSV
          </a>
        )}
        </div>
        {submitState === 'error' && submitError && (
          <p className="rounded-xl border border-rose-300 bg-rose-50 p-3 font-semibold text-rose-800" role="alert">
            Error: {submitError}
          </p>
        )}
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