"use client";

import { useParams } from "next/navigation";
import BorrowerDetail from "@/components/BorrowerDetail";

export default function BorrowerPage() {
  const params = useParams();
  const borrowerId = params.id as string;

  return <BorrowerDetail borrowerId={borrowerId} />;
}
