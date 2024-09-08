/* eslint-disable react/prop-types */
import { memo } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import PostCard from "./post-card";
import { Vortex } from "react-loader-spinner";

export const AdminDisplayPosts = memo(function AdminDisplayPosts({
  posts,
  setPosts,
  fetchData,
}) {
  const page = Number(posts.page) || 1;

  const hasMore = page < Number(posts.total_pages);

  const loadMorePosts = async (page) => {    
    const response = await fetchData(page);
    if (response) {
      setPosts((prev) => ({ ...prev, data: [...prev.data, ...response.data.data], page: response.data.page}));
    }
  };

  const handlePostDelete = (postId) => setPosts((prev) => ({ ...prev, data: prev.data.filter(post => post.id != postId)}))

  return (
    <InfiniteScroll
      dataLength={posts.data.length}
      next={() => loadMorePosts(page + 1)}
      hasMore={hasMore}
      scrollableTarget="scrollableDiv"
      loader={
        <div className="w-full flex items-center justify-center">
          <Vortex
            visible={true}
            height="80"
            width="80"
            ariaLabel="vortex-loading"
            wrapperStyle={{}}
            wrapperClass="vortex-wrapper"
            colors={["red", "green", "blue", "yellow", "orange", "purple"]}
          />
        </div>
      }
    >
      <div className="w-full grid gap-3 md:gap-4 xl:gap-6">
        {posts.data.map((post) => (
          <PostCard
            key={post.id}
            id={post.id}
            author={post.author}
            authorId={post.author_id}
            tags={post.tags}
            title={post.title}
            header_url={post.header_url}
            no_of_comments={post.no_of_comments}
            no_of_likes={post.no_of_likes}
            is_published={post.is_published}
            deletePost={handlePostDelete}
          />
        ))}
      </div>
    </InfiniteScroll>
  );
});
