/**
 * payload-api regression tests (audit H6 follow-up)
 *
 * getPractitioners previously filtered on a `contactInfo.address.*` field group
 * that does not exist in the Practitioners collection (the address lives in the
 * `addresses` array). Because the practitioners page passes the search query as
 * the `location` arg, any practitioner search hit that branch and made Payload
 * throw a QueryError on the unknown path. These tests pin the query shape so the
 * non-existent group can't be reintroduced.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'

const findMock = vi.fn()

vi.mock('payload', () => ({
  getPayload: vi.fn(async () => ({ find: findMock })),
}))

import { getPractitioners } from '@/lib/payload-api'

describe('getPractitioners location filter', () => {
  beforeEach(() => {
    findMock.mockReset()
    findMock.mockResolvedValue({ docs: [], totalDocs: 0, totalPages: 0, page: 1 })
  })

  it('never queries the non-existent contactInfo group', async () => {
    await getPractitioners(1, 12, 'Portland')
    const { where } = findMock.mock.calls[0][0]
    expect(JSON.stringify(where)).not.toContain('contactInfo')
  })

  it('filters by the addresses array subfields when a location is given', async () => {
    await getPractitioners(1, 12, 'Portland')
    const { where } = findMock.mock.calls[0][0]
    const locationOr = where.and.find((c: any) => c.or)
    expect(locationOr?.or).toEqual([
      { 'addresses.city': { contains: 'Portland' } },
      { 'addresses.state': { contains: 'Portland' } },
      { 'addresses.country': { contains: 'Portland' } },
    ])
  })

  it('omits the location filter and stays scoped to published+verified when no location', async () => {
    await getPractitioners(1, 12)
    const { where } = findMock.mock.calls[0][0]
    expect(where.and.some((c: any) => c.or)).toBe(false)
    expect(where.and).toEqual([
      { _status: { equals: 'published' } },
      { verificationStatus: { equals: 'verified' } },
    ])
  })

  it('sorts by a field that exists on the collection (practitionerName, not name)', async () => {
    await getPractitioners(1, 12)
    const { sort } = findMock.mock.calls[0][0]
    expect(sort).toBe('practitionerName')
  })
})
