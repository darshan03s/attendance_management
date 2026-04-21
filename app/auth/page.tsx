import { Button } from '@/components/ui/button'
import { SignInButton, SignUpButton } from '@clerk/nextjs'

const Page = () => {
  return (
    <div className="h-[calc(100vh-48px)] flex items-center justify-center">
      <div className="flex flex-col gap-4">
        <SignInButton>
          <Button variant={'outline'} size={'sm'}>
            Sign In
          </Button>
        </SignInButton>
        <SignUpButton>
          <Button size={'sm'}>Sign Up</Button>
        </SignUpButton>
      </div>
    </div>
  )
}

export default Page
