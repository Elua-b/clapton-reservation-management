import { InviteClient } from "./invite-client"


// This is a Server Component
export default function InvitePage({ params }: { params: { code: string } }) {
  // Access params directly in the server component
  const code = params.code

  return <InviteClient code={code} />
}
