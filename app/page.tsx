// Updated app/page.tsx landing page
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="font-sans bg-zinc-50 dark:bg-black">
      <section className="flex flex-col items-center justify-center h-screen text-center px-6 bg-white dark:bg-black">
        <h2 className="max-w-2xl text-5xl font-bold text-black dark:text-white leading-tight">
          The fastest way for schools & clubs to share events.
        </h2>

        <p className="max-w-md mt-4 text-lg text-zinc-600 dark:text-zinc-400">
          Create once. Post everywhere. Keep your campus connected.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-10">
          <Link
            href="/login"
            className="inline-block rounded-full bg-blue-600 px-8 py-3 text-white font-medium hover:bg-blue-700 transition shadow-lg"
          >
            Get Started →
          </Link>
          <a
            href="#learn-more"
            className="inline-block rounded-full bg-black px-8 py-3 text-white font-medium hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition"
          >
            Learn More ↓
          </a>
        </div>
      </section>

      <section
        id="learn-more"
        className="max-w-3xl mx-auto px-8 py-24 flex flex-col gap-16 text-left"
      >
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

        <div className="text-center pt-8">
          <Link
            href="/home"
            className="inline-block rounded-full bg-blue-600 px-10 py-4 text-white font-semibold hover:bg-blue-700 transition shadow-lg text-lg"
          >
            Try Blip Now →
          </Link>
        </div>
      </section>

      <footer className="py-10 text-center text-sm text-zinc-500 dark:text-zinc-600">
        © {new Date().getFullYear()} Blip — All Rights Reserved
      </footer>
    </div>
  );
}