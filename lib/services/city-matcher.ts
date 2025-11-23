/**
 * City matching service
 * Handles city name matching with improved logic to avoid ambiguous matches
 */

import { getSupabaseClient } from '../supabase/supabase-bot.js'

interface CityMatch {
  id: string
  name: string
  country_code: string
}

/**
 * Match city name with improved logic
 * - Tries exact match first
 * - Then tries case-insensitive match
 * - Then tries partial match (but avoids ambiguous matches)
 * - Handles common abbreviations
 */
export async function matchCity(cityName: string): Promise<string | null> {
  if (!cityName || cityName.trim().length === 0) {
    return null
  }

  const supabase = getSupabaseClient()
  const normalizedCity = cityName.trim()

  // Common abbreviations mapping
  const abbreviations: Record<string, string> = {
    'nyc': 'New York',
    'ny': 'New York',
    'la': 'California',
    'sf': 'San Francisco',
    'tor': 'Toronto',
    'van': 'Vancouver',
    'bram': 'Brampton',
    'miss': 'Mississauga',
  }

  // Check if it's an abbreviation
  const expandedCity = abbreviations[normalizedCity.toLowerCase()]
  const searchCity = expandedCity || normalizedCity

  // 1. Try exact match (case-insensitive)
  const { data: exactMatch } = await supabase
    .from('cities')
    .select('id, name, country_code')
    .ilike('name', searchCity)
    .eq('is_active', true)
    .limit(1)
    .single()

  if (exactMatch) {
    return exactMatch.id
  }

  // 2. Try partial match, but check for ambiguity
  const { data: partialMatches } = await supabase
    .from('cities')
    .select('id, name, country_code')
    .ilike('name', `%${searchCity}%`)
    .eq('is_active', true)
    .limit(5)

  if (!partialMatches || partialMatches.length === 0) {
    return null
  }

  // If multiple matches, prefer exact substring match
  const exactSubstringMatch = partialMatches.find(
    (city) => city.name.toLowerCase() === searchCity.toLowerCase()
  )

  if (exactSubstringMatch) {
    return exactSubstringMatch.id
  }

  // If only one match, use it
  if (partialMatches.length === 1) {
    return partialMatches[0].id
  }

  // If multiple matches and search term is too short, return null (ambiguous)
  if (searchCity.length < 5) {
    return null
  }

  // If multiple matches, prefer the one that starts with the search term
  const startsWithMatch = partialMatches.find((city) =>
    city.name.toLowerCase().startsWith(searchCity.toLowerCase())
  )

  if (startsWithMatch) {
    return startsWithMatch.id
  }

  // Return first match as fallback
  return partialMatches[0].id
}

