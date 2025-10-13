import { redirect } from "next/navigation";
import { getSession } from "@/modules/auth/utils/auth-utils";

export default async function Page() {
    const session = await getSession();

    if (!session?.user) {
        redirect("/");
    }

    return (
        <div className="container mx-auto px-4 py-4 sm:px-6 sm:py-6">
            <h1 className="mb-4 text-2xl font-bold">
                Welcome, {session.user.name}
            </h1>
        </div>
    );
}
