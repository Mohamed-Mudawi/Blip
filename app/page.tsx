import Image from "next/image";

export default function Home() {
  return (
    <div className="font-sans bg-zinc-50 dark:bg-black">
      
      {/* HERO / WELCOME SECTION */}
      <section className="flex flex-col items-center justify-center h-screen text-center px-6 bg-white dark:bg-black">
        
        {/* Logo */}
        <div className="flex items-center gap-3 mb-6">
          <Image
            src="/blip-logo.png"
            alt="Blip logo"
            width={60}
            height={60}
            priority
          />
          <h1 className="text-4xl font-semibold text-black dark:text-white tracking-tight">
            Blip
          </h1>
        </div>

        {/* Headline */}
        <h2 className="max-w-2xl text-5xl font-bold text-black dark:text-white leading-tight">
          The fastest way for schools & clubs to share events.
        </h2>

        {/* Subtext */}
        <p className="max-w-md mt-4 text-lg text-zinc-600 dark:text-zinc-400">
          Create once. Post everywhere. Keep your campus connected.
        </p>

        {/* Scroll Button */}
        <a
          href="#learn-more"
          className="mt-10 inline-block rounded-full bg-black px-8 py-3 text-white font-medium hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition"
        >
          Learn More ↓
        </a>
      </section>


      {/* FULL ABOUT SECTION */}
      <section
        id="learn-more"
        className="max-w-3xl mx-auto px-8 py-24 flex flex-col gap-16 text-left"
      >
        {/* What is Blip? */}
        <div>
          <h3 className="text-3xl font-semibold text-black dark:text-white">
            What is Blip?
          </h3>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400 leading-7 text-lg">
            Blip is a simple platform that helps schools and clubs make announcements 
            effortlessly. Enter event details, generate a poster, pick where to share it—
            and Blip handles the posting for you.
          </p>
        </div>

        {/* Who is it for */}
        <div>
          <h3 className="text-3xl font-semibold text-black dark:text-white">
            Who is it for?
          </h3>
          <ul className="mt-3 space-y-2 list-disc pl-6 text-lg text-zinc-600 dark:text-zinc-400">
            <li>Student clubs & organizations</li>
            <li>Teachers and academic programs</li>
            <li>School administrators</li>
            <li>Students looking for opportunities</li>
          </ul>
        </div>

        {/* How it works */}
        <div>
          <h3 className="text-3xl font-semibold text-black dark:text-white">
            How does it work?
          </h3>
          <ol className="mt-3 space-y-3 list-decimal pl-6 text-lg text-zinc-600 dark:text-zinc-400">
            <li>Enter event details (time, location, description).</li>
            <li>Generate an AI-powered poster instantly.</li>
            <li>Select your platforms (IG, Discord, LMS, etc.).</li>
            <li>Post everywhere with one click.</li>
          </ol>
        </div>

        {/* Why Blip */}
        <div>
          <h3 className="text-3xl font-semibold text-black dark:text-white">
            Why Blip?
          </h3>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400 text-lg leading-7">
            Blip increases engagement, keeps students informed, and saves educators
            hours of repetitive posting work. It's clean, fast, and built for modern
            school communities.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 text-center text-sm text-zinc-500 dark:text-zinc-600">
        © {new Date().getFullYear()} Blip — All Rights Reserved
      </footer>
    </div>
  );
}
