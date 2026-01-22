import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import AttemptDetailsView from "./view";
import { APP_NAME } from "@/config";

interface PageProps {
  params: Promise<{ code: string; attemptId: string }>;
}

export default async function AttemptDetailsPage({ params }: PageProps) {
  const { code, attemptId } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect(
      `/auth/signin?callbackUrl=/tpanel/exam/${code}/attempt/${attemptId}`,
    );
  }
  console.log(code, attemptId);

  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      answers: true,
      exam: {
        include: {
          questions: {
            include: {
              mcq: { include: { choices: true } },
              trueFalse: true,
              fillBlank: true,
            },
          },
        },
      },
    },
  });

  if (!attempt) {
    return notFound();
  }

  // Ownership Check
  if (
    attempt.exam.teacherId !== session.user.id &&
    session.user.role !== "admin"
  ) {
    return notFound();
  }

  return <AttemptDetailsView code={code} attempt={attempt} />;
}

export const generateMetadata = () => {
  return {
    title: `Exam Attempt Details | ${APP_NAME}`,
    robots: {
      index: false,
      follow: false,
    },
  };
};
