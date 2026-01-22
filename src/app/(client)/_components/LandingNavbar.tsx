"use client";

import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Button,
  Link,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export function LandingNavbar() {
  const router = useRouter();

  return (
    <Navbar
      maxWidth="xl"
      className="bg-white/80 backdrop-blur-md border-b border-default-100"
    >
      <NavbarBrand>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <div className="w-8 h-8 rounded-lg bg-primary items-center justify-center flex font-bold text-white text-lg">
            T
          </div>
          <p className="font-bold text-inherit text-xl tracking-tight">
            TeachersPortal
          </p>
        </motion.div>
      </NavbarBrand>
      <NavbarContent className="hidden sm:flex gap-8" justify="center">
        <NavbarItem>
          <Link
            color="foreground"
            href="#features"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Features
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link
            color="foreground"
            href="#how-it-works"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            How it Works
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link
            color="foreground"
            href="https://github.com/octominds"
            isExternal
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Github
          </Link>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify="end">
        <NavbarItem>
          <Button
            as={Link}
            color="primary"
            href="/admin"
            variant="flat"
            className="font-medium"
          >
            Teacher Login
          </Button>
        </NavbarItem>
        <NavbarItem>
          <Button
            as={Link}
            color="primary"
            href="/admin"
            variant="solid"
            className="font-medium shadow-lg shadow-primary/20"
          >
            Get Started
          </Button>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
