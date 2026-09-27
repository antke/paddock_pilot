import type { ComponentProps } from 'react'
import { useState } from 'react'

import { cn } from '#/lib/utils'

type UserAvatarSize = 'sm' | 'md'

type UserAvatarProps = Omit<ComponentProps<'div'>, 'children'> & {
  name: string
  photoUrl?: string
  size?: UserAvatarSize
}

const userAvatarSizeClassNames = {
  sm: 'size-9 text-xs',
  md: 'size-11 text-sm',
} satisfies Record<UserAvatarSize, string>

export function UserAvatar({
  className,
  name,
  photoUrl,
  size = 'md',
  ...props
}: UserAvatarProps) {
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null)
  const hasUsableImage = Boolean(photoUrl) && failedImageUrl !== photoUrl
  return (
    <div
      data-slot="user-avatar"
      aria-hidden="true"
      className={cn(
        'grid shrink-0 place-items-center overflow-hidden rounded-full border border-primary/20 bg-primary/10 font-black text-primary',
        userAvatarSizeClassNames[size],
        className,
      )}
      {...props}
    >
      {hasUsableImage ? (
        <img
          src={photoUrl}
          alt=""
          onError={() => setFailedImageUrl(photoUrl ?? null)}
          className="size-full object-cover"
        />
      ) : (
        getInitials(name)
      )}
    </div>
  )
}

function getInitials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => Array.from(part)[0]?.toLocaleUpperCase())
      .join('') || '?'
  )
}
