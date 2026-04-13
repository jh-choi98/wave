'use client'

import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-12 text-center">
      <div className="flex flex-col gap-3">
        <h1 className="text-5xl font-bold tracking-tight">WAVE</h1>
        <p className="text-muted-foreground text-base">매일 한 장, 묵상</p>
      </div>
      <Button
        size="lg"
        className="w-full"
        onClick={() => signIn('google', { redirectTo: '/' })}
      >
        Google로 시작하기
      </Button>
    </div>
  )
}
