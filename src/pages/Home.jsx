import redSalamander from '../assets/red_salamander.jpg';

export default function Home() {
  return (
    <div>
      <section className="rounded-2xl border border-accent/35 bg-gradient-to-br from-white to-accent-soft/45 p-6 shadow-sm ring-2 ring-accent/20">
        <div className="mb-4 h-2 w-24 rounded-full bg-accent/65" />
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-wide text-secondary sm:text-5xl">
              Salamander Tracker
            </h1>
            <p className="mt-3 max-w-2xl text-lg font-medium text-primary">
              Pick a video from the Videos page to start analyzing.
            </p>
          </div>
          <img
            src={redSalamander}
            alt="Red salamander"
            className="h-32 w-full rounded-xl border border-accent/40 object-cover shadow-sm md:h-32 md:w-48"
          />
        </div>
      </section>
    </div>
  );
}