import { useSearchParams } from 'react-router-dom'
import { CourseCard } from '@/components/features/CourseCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LoadingState } from '@/components/ui/loading'
import { ErrorState, EmptyState } from '@/components/ui/error'
import { useCourses } from '@/hooks'
import { DIFFICULTIES, CATEGORIES, PAGINATION } from '@/constants'

export function CoursesPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Extract filters from URL params
  const search = searchParams.get('search') || ''
  const difficulty = searchParams.get('difficulty') || ''
  const category = searchParams.get('category') || ''
  const page = parseInt(searchParams.get('page') || String(PAGINATION.DEFAULT_PAGE))

  // Fetch courses using custom hook
  const { data, isLoading, error, refetch } = useCourses({
    search: search || undefined,
    difficulty: difficulty || undefined,
    category: category || undefined,
    page,
    page_size: PAGINATION.DEFAULT_PAGE_SIZE,
  })

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams)
    if (value) {
      newParams.set(key, value)
    } else {
      newParams.delete(key)
    }
    newParams.set('page', '1') // Reset to page 1 on filter change
    setSearchParams(newParams)
  }

  const clearFilters = () => {
    setSearchParams({})
  }

  return (
    <div className="min-h-screen bg-light-primary dark:bg-dark-primary py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Explore Courses
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Master Web3 development with hands-on courses
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-6">
          {/* Search Bar */}
          <div className="max-w-2xl">
            <Input
              type="search"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="h-12 text-base"
            />
          </div>

          {/* Filters */}
          <div className="space-y-4">
            {/* Difficulty Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Difficulty</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={difficulty === '' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateFilter('difficulty', '')}
                >
                  All
                </Button>
                {DIFFICULTIES.map((level) => (
                  <Button
                    key={level}
                    variant={difficulty === level ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateFilter('difficulty', level)}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={category === '' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateFilter('category', '')}
                >
                  All
                </Button>
                {CATEGORIES.map((cat) => (
                  <Button
                    key={cat}
                    variant={category === cat ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateFilter('category', cat)}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>

            {/* Active Filters */}
            {(search || difficulty || category) && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
                {search && (
                  <Badge variant="secondary">
                    Search: {search}
                    <button
                      onClick={() => updateFilter('search', '')}
                      className="ml-1 hover:text-red-500"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {difficulty && (
                  <Badge variant="secondary">
                    {difficulty}
                    <button
                      onClick={() => updateFilter('difficulty', '')}
                      className="ml-1 hover:text-red-500"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {category && (
                  <Badge variant="secondary">
                    {category}
                    <button
                      onClick={() => updateFilter('category', '')}
                      className="ml-1 hover:text-red-500"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-primary-500"
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Courses Grid */}
        {isLoading ? (
          <LoadingState message="Loading courses..." />
        ) : error ? (
          <ErrorState
            message="Failed to load courses. Please try again."
            onRetry={() => refetch()}
          />
        ) : data && data.items.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {data.items.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>

            {/* Pagination */}
            {data.pages > 1 && (
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => updateFilter('page', (page - 1).toString())}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-2">
                  {[...Array(data.pages)].map((_, i) => (
                    <Button
                      key={i}
                      variant={page === i + 1 ? 'default' : 'outline'}
                      onClick={() => updateFilter('page', (i + 1).toString())}
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  disabled={page === data.pages}
                  onClick={() => updateFilter('page', (page + 1).toString())}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            icon="🔍"
            title="No courses found"
            message="Try adjusting your filters or search terms"
            action={{
              label: 'Clear Filters',
              onClick: clearFilters,
            }}
          />
        )}
      </div>
    </div>
  )
}
