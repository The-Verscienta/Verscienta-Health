'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export interface FilterOption {
  label: string
  value: string
  count?: number
}

export interface FilterGroup {
  id: string
  label: string
  options: FilterOption[]
  multiSelect?: boolean
}

interface SearchFiltersProps {
  filterGroups: FilterGroup[]
  activeFilters: Record<string, string[]>
  onFilterChange: (filterId: string, values: string[]) => void
  onClearAll: () => void
  sortOptions?: { label: string; value: string }[]
  activeSort?: string
  onSortChange?: (value: string) => void
}

export function SearchFilters({
  filterGroups,
  activeFilters,
  onFilterChange,
  onClearAll,
  sortOptions,
  activeSort,
  onSortChange,
}: SearchFiltersProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(filterGroups.map((g) => g.id))
  )
  const [showFilters, setShowFilters] = useState(true)

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId)
    } else {
      newExpanded.add(groupId)
    }
    setExpandedGroups(newExpanded)
  }

  const handleFilterToggle = (groupId: string, value: string, multiSelect: boolean) => {
    const currentValues = activeFilters[groupId] || []

    if (multiSelect) {
      // Toggle value in multi-select
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value]
      onFilterChange(groupId, newValues)
    } else {
      // Single select
      const newValues = currentValues.includes(value) ? [] : [value]
      onFilterChange(groupId, newValues)
    }
  }

  const activeFilterCount = Object.values(activeFilters).reduce(
    (sum, values) => sum + values.length,
    0
  )

  return (
    <div className="space-y-4">
      {/* Header with Toggle and Clear */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="default" className="ml-1">
              {activeFilterCount}
            </Badge>
          )}
        </Button>

        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onClearAll} className="gap-2">
            <X className="h-4 w-4" />
            Clear All
          </Button>
        )}

        {sortOptions && onSortChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={activeSort || ''}
              onChange={(e) => onSortChange(e.target.value)}
              className="input-standard text-sm py-1"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Active Filters Pills */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(activeFilters).map(([groupId, values]) =>
            values.map((value) => {
              const group = filterGroups.find((g) => g.id === groupId)
              const option = group?.options.find((o) => o.value === value)
              return (
                <Badge
                  key={`${groupId}-${value}`}
                  variant="outline"
                  className="gap-1 pr-1"
                >
                  {option?.label || value}
                  <button
                    onClick={() =>
                      handleFilterToggle(groupId, value, group?.multiSelect || false)
                    }
                    className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )
            })
          )}
        </div>
      )}

      {/* Filter Groups */}
      {showFilters && (
        <div className="space-y-3">
          {filterGroups.map((group) => (
            <Card key={group.id}>
              <CardHeader
                className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
                onClick={() => toggleGroup(group.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-sm font-semibold">{group.label}</CardTitle>
                    {activeFilters[group.id]?.length > 0 && (
                      <CardDescription className="text-xs mt-1">
                        {activeFilters[group.id].length} selected
                      </CardDescription>
                    )}
                  </div>
                  {expandedGroups.has(group.id) ? (
                    <ChevronUp className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  )}
                </div>
              </CardHeader>

              {expandedGroups.has(group.id) && (
                <CardContent className="pt-0 pb-3">
                  <div className="space-y-2">
                    {group.options.map((option) => {
                      const isActive = activeFilters[group.id]?.includes(option.value) || false
                      return (
                        <label
                          key={option.value}
                          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                        >
                          <input
                            type={group.multiSelect ? 'checkbox' : 'radio'}
                            name={group.id}
                            checked={isActive}
                            onChange={() =>
                              handleFilterToggle(group.id, option.value, group.multiSelect || false)
                            }
                            className="rounded text-earth-600 focus:ring-earth-600"
                          />
                          <span className="flex-1 text-sm">{option.label}</span>
                          {option.count !== undefined && (
                            <span className="text-xs text-gray-500">({option.count})</span>
                          )}
                        </label>
                      )
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
