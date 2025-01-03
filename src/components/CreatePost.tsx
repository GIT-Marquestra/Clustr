"use client"
import { useUser } from '@clerk/nextjs'
import React, { useState } from 'react'
import { Card, CardContent } from './ui/card'
import { Avatar, AvatarImage } from './ui/avatar'
import { Textarea } from './ui/textarea'
import { Brain, ImageIcon, Loader2Icon, SendIcon, Trash } from 'lucide-react'
import { Button } from './ui/button'
import { createPost } from '@/actions/post.action'
import toast from 'react-hot-toast'
import ImageUpload from './ImageUpload'
import { Skeleton } from './ui/skeleton'
export default function CreatePost() {
    const { user } = useUser()
    const [content, setContent] = useState('')
    const [imageUrl, setImageUrl] = useState('')
    const [isPosting, setIsPosting] = useState(false)
    const [showImageUpload, setShowImageUpload] = useState(false)
    const [enhancedText, setEnhancedText] = useState('')
    const [enhancing, setEnhancing] = useState(false)
    const handleSubmit = async () => {
        if(!content.trim() && !imageUrl){
            return 
        }

        setIsPosting(true)
        try {
            const result = await createPost(enhancedText || content, imageUrl)
            if(result?.success){
                setContent('')
                setImageUrl('')
                setShowImageUpload(false)
                toast.success("Post created successfully")
            }
        } catch (error) {
            console.log("Error while creating post: ", error)
        } finally {
            setIsPosting(false)
            setEnhancedText('')
        }
    }

    const handleEnhanceText = async () => {
      
      try {
        setEnhancing(true)
        if (!content.trim()) {
          toast.error("Please enter some text to enhance");
          return;
        }
        const res = await fetch("/api/enhancePost", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt: content }),
          
        })
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        const data = await res.json()
        const enhancedText = data.result;
        const parts = enhancedText.split(':');
        const resultText = parts.length > 1 ? parts[1].trim() : enhancedText.trim();
        setContent(resultText)
      } catch (error) {
        toast.error("Text couldn't be enhanced")
      } finally{
        setEnhancing(false)
      }
    }

    
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex space-x-4">
            <Avatar className="w-10 h-10">
              <AvatarImage src={user?.imageUrl || "/avatar.png"} />
            </Avatar>
            {enhancing ? <div className='w-full'>
              <Skeleton  className="h-4 w-[100%] my-2" />
              <Skeleton  className="h-4 w-[100%] my-2"/>
            </div>
            : <Textarea
            placeholder="What's on your mind?"
            className="min-h-[100px] border-none resize-none focus-visible:ring-0 p-0 text-base"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isPosting}
          />
            }
            <button className='flex items-start'><Brain size={20} strokeWidth={1.25} onClick={handleEnhanceText}/></button>
          </div>

          {(showImageUpload || imageUrl) && (
            <div className="border rounded-lg p-4">
              <ImageUpload
                endpoint="postImage"
                value={imageUrl}
                onChange={(url) => {
                  setImageUrl(url);
                  if (!url) setShowImageUpload(false);
                }}
              />
            </div>
          )}

          <div className="flex items-center justify-between border-t pt-4">
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary"
                onClick={() => setShowImageUpload(!showImageUpload)}
                disabled={isPosting}
              >
                <ImageIcon className="size-4 mr-2" />
                Photo
              </Button>
            </div>
            
            <Button
              className="flex items-center"
              onClick={handleSubmit}
              disabled={(!content.trim() && !imageUrl) || isPosting}
            >
              {isPosting ? (
                <>
                  <Loader2Icon className="size-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <SendIcon className="size-4 mr-2" />
                  Post
                </>
              )}
            </Button>
            
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
