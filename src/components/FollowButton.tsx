"use client"
import React, { useState } from 'react'
import { Button } from './ui/button'
import { Loader2Icon } from 'lucide-react'
import toast from 'react-hot-toast'
import { toggleFollow } from '@/actions/user.action'
import { revalidatePath } from 'next/cache'
export default function FollowButton({ userId }: { userId: string }) {
    const [isLoading, setIsLoading] = useState(false)
    const handleFollow = async () => {
        setIsLoading(true)
        try {
            await toggleFollow(userId)
            toast.success("User Followed Successfully")
        } catch (error) {
            toast.error("Error following user")
        } finally {
            setIsLoading(false)
        }

    }
  return (
    <Button
    size={"sm"}
    variant={"secondary"}
    disabled={isLoading}
    onClick={handleFollow}
    className='w-20'
    >
    {isLoading ? <Loader2Icon className='size-4 animate-spin' /> : "Follow"}
    </Button>
  )
}
