'use client'

import { useState } from 'react'

interface FriendLinkAvatarProps {
  avatar: string | null
  name: string
}

export default function FriendLinkAvatar({ avatar, name }: FriendLinkAvatarProps) {
  const [imgError, setImgError] = useState(false)

  if (!avatar || imgError) {
    return (
      <div className="w-12 h-12 rounded-full bg-primary-100 items-center justify-center flex-shrink-0">
        <span className="text-lg text-primary-600">{name[0]}</span>
      </div>
    )
  }

  return (
    <img
      src={avatar}
      alt={name}
      className="w-12 h-12 rounded-full object-cover flex-shrink-0"
      onError={() => setImgError(true)}
    />
  )
}