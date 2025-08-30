import { redirect } from 'next/navigation';

export default function SuspendedUsersRedirect() {
  // Compatibility route: old path redirects to the new filtered users list
  redirect('/dashboard/users?status=suspended');
}
