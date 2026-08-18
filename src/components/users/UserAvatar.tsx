import type { ComponentProps } from 'react'

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
      {photoUrl ? (
        <img src={photoUrl} alt="" className="size-full object-cover" />
      ) : (
        getInitials(name)
      )}
    </div>
  )
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}
