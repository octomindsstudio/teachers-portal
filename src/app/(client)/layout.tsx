import { ClientContextMenu } from "@/components/client/ClientContextMenu";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientContextMenu>{children}</ClientContextMenu>;
}
