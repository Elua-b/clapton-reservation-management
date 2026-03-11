import { InviteClient } from "./invite-client"

// This is a Server Component
export default async function InvitePage({ params }: { params: Promise<{ code: string }> }) {
  // Await params in the server component for Next.js 15 compatibility
  const { code } = await params

  return <InviteClient code={code} />
}
