import { getUserById } from '@/db/utils'
import { currentUser } from '@clerk/nextjs/server'
import { ReactNode } from 'react'

const layout = async ({ children }: { children: ReactNode }) => {
  const clerkUser = await currentUser()
  const user = await getUserById(clerkUser!.id)

  return (
    <div>
      <div className="px-2 h-12 flex items-center justify-between">
        <span>Welcome {user?.name}</span>
        <div className="flex items-center gap-4"></div>
      </div>
      {children}
    </div>
  )
}

export default layout
