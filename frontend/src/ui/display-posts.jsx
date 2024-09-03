/* eslint-disable react/prop-types */
import { useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import PostCard from "./post-card";
import { Vortex } from "react-loader-spinner";

export default function DisplayPosts({ posts, fetchData }) {
  const [displayedPosts, setPosts] = useState(posts.data);
  const [hasMore, setHasMore] = useState(
    Number(posts.page) < Number(posts.total_pages)
  );
  
  const [page, setPage] = useState(2);

  const loadMorePosts = async (page) => {
    const { data, page: current_page, total_pages } = await fetchData(page);
    setPosts((prevPosts) => [...prevPosts, ...data]);
    Number(current_page) < Number(total_pages)
      ? setHasMore(true)
      : setHasMore(false);
    setPage((prev) => prev + 1);
  };

  return (
    <InfiniteScroll
      dataLength={displayedPosts.length}
      next={() => loadMorePosts(page)}
      hasMore={hasMore}
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
        {displayedPosts.map((post) => (
          <PostCard
            key={post.id}
            id={post.id}
            author={post.author || post.author_id}
            tags={post.tags}
            title={post.title}
            header_url={post.header_url}
            no_of_comments={post.no_of_comments}
            no_of_bookmarks={post.no_of_bookmarks}
          />
        ))}
      </div>
    </InfiniteScroll>
  );
}
