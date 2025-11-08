"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { storage } from "@/lib/storage";
import { User } from "@/types";
import Auth from "@/components/Auth";
import BorrowerDetail from "@/components/BorrowerDetail";

export default function BorrowerPage() {
  const router = useRouter();
  const params = useParams();
  const borrowerId = params.id as string;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = storage.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    } else {
      router.push("/");
    }
    setLoading(false);
  }, [router]);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  return <BorrowerDetail user={user} borrowerId={borrowerId} />;
}

