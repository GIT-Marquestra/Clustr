"use server"

import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache";

export async function syncUser(){
    try {
        const { userId } = await auth()
        const user = await currentUser();

        if(!userId || !user){
            return 
        }

        const existingUser = await prisma.user.findUnique({
            where:{
                clerkId: userId,
            },
        })

        if(existingUser){
            return existingUser
        }

        const dbuser = await prisma.user.create({
            data: {
                clerkId: userId,
                name: `${user.firstName || ""} ${user.lastName || ""}`,
                username: user.username ?? user.emailAddresses[0].emailAddress.split("@")[0],
                email: user.emailAddresses[0].emailAddress,
                image: user.imageUrl
            }
        })

        return dbuser
    } catch (error) {
        console.log("Error in syncUser: ", error)
    }

}

export async function getUserByClerkId(clerkId: string){
    return prisma.user.findUnique({
        where: {
            clerkId: clerkId,    
        },
        include:{
            _count:{
                select:{
                    followers: true,
                    following: true,
                    posts: true
                }
            }
        }
    })
}

export async function getDbUserId(){
    const { userId: clerkId } = await auth()
    if(!clerkId) {
        return null
    }

    const user = await getUserByClerkId(clerkId)

    if(!user){
        throw new Error("User not found")
    }

    return user.id
}

export async function getRandomUser(){
    try {
        const userId = await getDbUserId()
        if(!userId){
            return []
        }
        const randomUsers = await prisma.user.findMany({
            where:{
                AND:[
                    {NOT:{id: userId}},
                    {
                        NOT:{
                            followers:{
                                some:{
                                    followerId: userId
                                }
                            }
                        }
                    }
                ]
            }, 
            select:{
                id: true,
                name: true,
                username: true,
                image: true,
                _count:{
                    select:{
                        followers : true
                    }
                }
            },
            take: 3,
        })

        return randomUsers
    } catch (error) {
        console.log("Error while fetching Random users: ", error)
        return []
    }
    
}

export async function toggleFollow(targetUserId: string){
    try {
        const userId = await getDbUserId()
        if(!userId){
            return 
        }
        if(userId === targetUserId){
            throw new Error("You can not follow your self!") 
        }

        const existingFollow = await prisma.follows.findUnique({
            where:{
                followerId_followingId:{
                    followerId: userId,
                    followingId: targetUserId
                }
            }
        })

        if(existingFollow){
            // we are trying to unfollow
            await prisma.follows.delete({
                where:{
                    followerId_followingId:{
                        followerId: userId,
                        followingId: targetUserId
                    }
                }
            })
        }
        else {
            // follow
            await prisma.$transaction([
                prisma.follows.create({
                    data:{
                        followerId: userId,
                        followingId: targetUserId
                    }
                }),

                prisma.notification.create({
                    data:{
                        type: "FOLLOW",
                        userId: targetUserId, // user who is beign followed
                        creatorId: userId // user who followed, who triggered the notification
                    }
                })
            ])
        }
        revalidatePath("/") // refreshes the particular path
        return { success: true }
    } catch (error) {
        console.log("Error in toggleFollow: ", error)
        return { success: true, error: "Error toggling follow" }
        
    }
}