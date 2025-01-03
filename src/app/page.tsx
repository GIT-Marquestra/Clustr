import { getUserPosts } from "@/actions/post.action";
import { getDbUserId } from "@/actions/user.action";
import CreatePost from "@/components/CreatePost";
import PostCard from "@/components/PostCard";
import WhoToFollow from "@/components/WhoToFollow";
import { currentUser } from "@clerk/nextjs/server";


export default async function Home() {
  const user = await currentUser()
  const posts = await getUserPosts()
  const dbUserId = await getDbUserId()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
      <div className="lg:col-span-6">
       {user ?  <CreatePost/> : null}

       <div className="space-y-6">

       {posts.map((post) => (
          <PostCard key={post.id} post={post} dbUserId={dbUserId}/> // passing these as props
        ))}

       </div>
      </div>

      <div className="lg:block hidden lg:col-span-4 top-20 sticky">
        <WhoToFollow/>
      </div>
      
    </div>
  );
}