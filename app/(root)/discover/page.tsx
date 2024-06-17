"use client"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import EmptyState from "@/components/EmptyState"
import Searchbar from "@/components/Searchbar"
import PodcastCard from "@/components/PodcastCard"
import LoaderSpinner from "@/components/LoaderSpinner"
type DiscoverProps = {
  searchParams: {
    search: string
  }
}
const Discover = ({ searchParams: { search } }: DiscoverProps) => {
  const podcastsData = useQuery(api.podcasts.getPodcastBySearch, {
    search: search || "",
  })

  return (
    <div className="flex flex-col gap-9">
      <Searchbar />
      <div className="flex flex-col gap-9">
        <h1 className="text-20 font-bold text-white-1">
          {!search ? "Discover Trending Podcasts" : "Search results for "}
          {search && <span className="text-white-2">{search}</span>}
        </h1>
        {podcastsData ? (
          <>
            {podcastsData.length > 0 ? (
              <div className="podcast_grid">
                {podcastsData?.map(
                  ({ _id, podcastTitle, podcastDescription, imageUrl }) => (
                    <PodcastCard
                      key={_id}
                      imgUrl={imageUrl!}
                      title={podcastTitle}
                      description={podcastDescription}
                      podcastId={_id}
                    />
                  )
                )}
              </div>
            ) : (
              <EmptyState title="No results found" />
            )}
          </>
        ) : (
          <LoaderSpinner />
        )}
      </div>
    </div>
  )
}

export default Discover
