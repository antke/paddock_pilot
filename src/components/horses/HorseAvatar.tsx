import { cn } from '#/lib/utils'

type HorseAvatarSize = 'sm' | 'md' | 'lg'

type HorseAvatarProps = {
  name: string
  profileImageUrl?: string | null
  size?: HorseAvatarSize
  className?: string
}

const sizeClassName = {
  sm: 'size-10',
  md: 'size-12 sm:size-14',
  lg: 'size-24',
} satisfies Record<HorseAvatarSize, string>

const fallbackClassName = {
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-2xl',
} satisfies Record<HorseAvatarSize, string>

export function HorseAvatar({
  name,
  profileImageUrl,
  size = 'md',
  className,
}: HorseAvatarProps) {
  return (
    <div
      data-slot="horse-avatar"
      className={cn(
        'app-row shrink-0 overflow-hidden',
        sizeClassName[size],
        className,
      )}
    >
      {profileImageUrl ? (
        <img
          src={profileImageUrl}
          alt={`${name} profile`}
          className="size-full object-cover"
        />
      ) : (
        <div
          className={cn(
            'flex size-full items-center justify-center font-semibold text-muted-foreground',
            fallbackClassName[size],
          )}
        >
          {name.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  )
}
