"use client";

import { Card, CardBody } from "@heroui/react";
import {
  Zap,
  ShieldCheck,
  BarChart3,
  Users,
  Globe2,
  Clock,
} from "lucide-react";

const FEATURES = [
  {
    icon: Zap,
    title: "Instant Grading",
    description:
      "Get results immediately with our automated grading system for multiple question types.",
  },
  {
    icon: ShieldCheck,
    title: "Anti-Cheating",
    description:
      "Secure exam environment with activity tracking and randomized question support.",
  },
  {
    icon: BarChart3,
    title: "Detailed Analytics",
    description:
      "Gain insights into student performance with comprehensive reporting tools.",
  },
  {
    icon: Users,
    title: "Class Management",
    description:
      "Easily organize students, assignments, and exams in one central hub.",
  },
  {
    icon: Clock,
    title: "Timed Exams",
    description:
      "Set strict time limits and auto-submission rules to ensure fairness.",
  },
  {
    icon: Globe2,
    title: "Accessible Anywhere",
    description:
      "Optimized for all devices so students can take exams from anywhere.",
  },
];

export function LandingFeatures() {
  return (
    <section id="features" className="py-24 bg-default-50/50">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-4xl font-bold tracking-tight text-default-900">
            Everything you need to <br />
            <span className="text-primary">master assessments</span>
          </h2>
          <p className="text-xl text-default-500">
            Powerful tools designed to streamline the examination process for
            teachers and students alike.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((feature, idx) => (
            <Card
              key={idx}
              className="border-none shadow-md hover:shadow-xl transition-all duration-300 bg-white"
            >
              <CardBody className="p-8 gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2">
                  <feature.icon size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-default-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-default-500 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
