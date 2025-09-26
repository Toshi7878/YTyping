"use client"
import { useSuspenseInfiniteQuery } from "@tanstack/react-query"
import { useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { useInView } from "react-intersection-observer"
import Spinner from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { useResultListInfiniteQueryOptions } from "@/utils/queries/result-list.queries"
import { useIsSearchingState, useSetIsSearching } from "../_lib/atoms"
import ResultCard from "./result-card/result-card"

function UsersResultList() {
  const searchParams = useSearchParams()
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useSuspenseInfiniteQuery(
    useResultListInfiniteQueryOptions(searchParams),
  )

  const isSearching = useIsSearchingState()
  const setIsSearching = useSetIsSearching()

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "2000px 0px",
  })

  useEffect(() => {
    if (data) {
      setIsSearching(false)
    }
  }, [data, setIsSearching])

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  return (
    <section className={cn("grid grid-cols-1 gap-3", isSearching ? "opacity-20" : "opacity-100")}>
      {data.pages.map((page) => page.items.map((result) => <ResultCard key={result.id} result={result} />))}
      {hasNextPage && <Spinner ref={ref} />}
    </section>
  )
}

export default UsersResultList
