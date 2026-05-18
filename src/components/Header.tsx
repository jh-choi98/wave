'use client'

import { useTransition } from 'react'
import { LogOut } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { signOutAction } from '@/actions/auth'

export type HeaderProps = {
  dateLabel: string
  hasSaved: boolean
  userName?: string | null
  userImage?: string | null
}

export function Header({ dateLabel, hasSaved, userName, userImage }: HeaderProps) {
  const [isPending, startTransition] = useTransition()
  const initial = (userName ?? 'U').trim().charAt(0).toUpperCase() || 'U'

  const handleSignOut = () => {
    startTransition(async () => {
      await signOutAction()
    })
  }

  return (
    <header className="flex items-center justify-between border-b px-4 py-3">
      <div className="flex items-center gap-2">
        <h1 className="text-sm font-medium">{dateLabel}</h1>
        {hasSaved && (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
            완료
          </span>
        )}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger aria-label="프로필 메뉴" className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Avatar size="sm">
            {userImage ? <AvatarImage src={userImage} alt={userName ?? ''} /> : null}
            <AvatarFallback>{initial}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={handleSignOut} disabled={isPending}>
            <LogOut />
            로그아웃
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
