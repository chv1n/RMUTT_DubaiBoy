
import { UserProfile } from "@/components/users/user-profile";

interface PageProps {
    params: {
        id: string;
    };
}

export default function UserProfilePage({ params }: PageProps) {
    return <UserProfile userId={params.id} />;
}
