import { cn } from '#/lib/utils'
import { useState } from 'react'

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
  const fallbackInitial = Array.from(name.trim())[0]?.toLocaleUpperCase() ?? '?'
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null)
  const hasUsableImage =
    Boolean(profileImageUrl) && failedImageUrl !== profileImageUrl

  return (
    <div
      data-slot="horse-avatar"
      className={cn(
        'app-row shrink-0 overflow-hidden',
        sizeClassName[size],
        className,
      )}
    >
      {hasUsableImage ? (
        <img
          src={profileImageUrl ?? undefined}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setFailedImageUrl(profileImageUrl ?? null)}
          className="size-full object-cover"
        />
      ) : (
        <div
          aria-hidden="true"
          className={cn(
            'flex size-full items-center justify-center font-semibold text-muted-foreground',
            fallbackClassName[size],
          )}
        >
          {fallbackInitial}
        </div>
      )}
    </div>
  )
}
