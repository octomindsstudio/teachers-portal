"use client";

import { Link } from "@heroui/react";
import { Github, Twitter } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="border-t border-default-100 bg-white py-12">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <div className="font-bold text-xl mb-2">TeachersPortal</div>
            <p className="text-sm text-default-500">
              © {new Date().getFullYear()} OctoMinds. All rights reserved.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="#"
              className="text-default-500 hover:text-default-900 transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="#"
              className="text-default-500 hover:text-default-900 transition-colors"
            >
              Terms
            </Link>
            <Link
              href="#"
              className="text-default-500 hover:text-default-900 transition-colors"
            >
              Support
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="#"
              className="text-default-400 hover:text-default-900 transition-colors"
            >
              <Github size={20} />
            </Link>
            <Link
              href="#"
              className="text-default-400 hover:text-default-900 transition-colors"
            >
              <Twitter size={20} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
