import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/");
  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar user={{ name: session.user.name ?? "User", email: session.user.email ?? "", image: session.user.image ?? null }}/>
      <div className="flex-1 flex flex-col min-w-0 lg:pt-0 pt-14">
        {children}
      </div>
    </div>
  );
}