import { getUserById } from '@/db/utils'
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

const Page = async () => {
  const clerkUser = await currentUser()
  const dbUser = await getUserById(clerkUser!.id)

  const role = dbUser?.role

  switch (role) {
    case 'student':
      redirect('/student')
    case 'trainer':
      redirect('/trainer')
    case 'institution':
      redirect('/institution')
    case 'monitoring_officer':
      redirect('/monitoring_officer')
    case 'programme_manager':
      redirect('/programme_manager')
  }

  return <div className="h-[calc(100vh-48px)] flex items-center justify-center">Welcome</div>
}

export default Page
