import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function NavBar() {
  return (
    <header className="bg-[#1f1f1f] p-5 flex flex-col md:flex-row justify-between items-center gap-4">
      <h1 className="text-yellow-400 text-2xl font-bold">
        🎬 What Should I Watch?
      </h1>
      <nav>
        <ul className="flex flex-wrap gap-5">
          <li>
            <Link
              href="/"
              className="text-white font-bold hover:text-yellow-400 transition"
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              href="#movies"
              className="text-white font-bold hover:text-yellow-400 transition scroll-smooth"
            >
              Trending
            </Link>
          </li>
          <li>
            <Link
              href="#movies"
              className="text-white font-bold hover:text-yellow-400 transition"
            >
              Watchlist
            </Link>
          </li>
          <li>
            <Link
              href="/"
              className="text-white font-bold hover:text-yellow-400 transition cursor-not-allowed scroll-smooth"
            >
              Profile
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
