import { Link, useParams } from 'react-router-dom';

export default function Preview() {
  const { filename } = useParams();

  return (
    <section className="rounded-2xl border border-accent/35 bg-white/90 p-6 shadow-sm ring-2 ring-accent/20">
      <h1 className="text-3xl font-extrabold uppercase tracking-wide text-secondary">
        {filename ? `Preview: ${filename}` : 'Preview'}
      </h1>
      <p className="mt-3 text-primary">
        {filename
          ? 'Thumbnail and tuning controls will go here in a future pair program.'
          : 'Choose a video from the Videos page to see its preview.'}
      </p>
      <Link
        className="mt-5 inline-block rounded-full border border-accent/55 bg-accent-soft px-4 py-2 font-semibold text-primary transition hover:bg-accent hover:text-white"
        to="/videos"
      >
        Back to videos
      </Link>
    </section>
  );
}