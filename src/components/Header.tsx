import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export type HeaderProps = {
  dateLabel: string
  hasSaved: boolean
  userName?: string | null
  userImage?: string | null
}

export function Header({ dateLabel, hasSaved, userName, userImage }: HeaderProps) {
  const initial = (userName ?? 'U').trim().charAt(0).toUpperCase() || 'U'
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
      <Avatar size="sm">
        {userImage ? <AvatarImage src={userImage} alt={userName ?? ''} /> : null}
        <AvatarFallback>{initial}</AvatarFallback>
      </Avatar>
    </header>
  )
}
