import { Show, UserButton } from '@clerk/nextjs'
import Link from 'next/link'

const Header = () => {
  return (
    <header className="flex justify-between items-center px-2 gap-4 h-12 border-b sticky top-0 left-0 z-10 bg-background">
      <div className="header-left">
        <Link href={'/'} className="text-sm">
          Attendance management
        </Link>
      </div>
      <div className="header-right flex items-center gap-4">
        <Show when="signed-in">
          <UserButton />
        </Show>
      </div>
    </header>
  )
}

export default Header
