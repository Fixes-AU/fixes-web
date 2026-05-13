'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { useJsApiLoader } from '@react-google-maps/api'
import { MapPin, Search, Loader2, Keyboard } from 'lucide-react'

const LIBRARIES: ('places')[] = ['places']

interface AddressComponents {
  address: string
  suburb: string
  postcode: string
  state: string
  lat: number
  lng: number
}

interface AddressAutocompleteProps {
  onSelect: (components: AddressComponents) => void
  onManualMode: () => void
  defaultValue?: string
}

const STATE_ABBREV: Record<string, string> = {
  'new south wales': 'NSW',
  'victoria': 'VIC',
  'queensland': 'QLD',
  'south australia': 'SA',
  'western australia': 'WA',
  'tasmania': 'TAS',
  'northern territory': 'NT',
  'australian capital territory': 'ACT',
}

function extractAddressComponents(place: google.maps.places.PlaceResult): AddressComponents | null {
  if (!place.address_components || !place.geometry?.location) return null

  const get = (type: string): string => {
    const comp = place.address_components!.find(c => c.types.includes(type))
    return comp?.long_name ?? ''
  }

  const getShort = (type: string): string => {
    const comp = place.address_components!.find(c => c.types.includes(type))
    return comp?.short_name ?? ''
  }

  const rawSubpremise = get('subpremise')
  const unitNumber = rawSubpremise
    .replace(/^(unit|apt|apartment|suite|lot|flat|shop|level)\s*/i, '')
    .trim()
  const streetNumber = get('street_number')
  const route = get('route')
  const suburb = get('locality') || get('sublocality_level_1') || get('neighborhood')
  const postcode = get('postal_code')
  const stateLong = get('administrative_area_level_1').toLowerCase()
  const state = STATE_ABBREV[stateLong] || getShort('administrative_area_level_1') || stateLong.toUpperCase()

  let address = ''
  if (streetNumber && route) {
    address = unitNumber
      ? `Unit ${unitNumber}/${streetNumber} ${route}`
      : `${streetNumber} ${route}`
  } else {
    address = route || place.formatted_address?.split(',')[0] || ''
  }

  return {
    address: address.trim(),
    suburb,
    postcode,
    state,
    lat: place.geometry!.location.lat(),
    lng: place.geometry!.location.lng(),
  }
}

export default function AddressAutocomplete({ onSelect, onManualMode, defaultValue = '' }: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const [inputValue, setInputValue] = useState(defaultValue)
  const [hasSelected, setHasSelected] = useState(false)

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? '',
    libraries: LIBRARIES,
  })

  const handlePlaceChanged = useCallback(() => {
    const ac = autocompleteRef.current
    if (!ac) return

    const place = ac.getPlace()
    if (!place?.geometry) return

    const components = extractAddressComponents(place)
    if (!components) return

    setInputValue(place.formatted_address || components.address)
    setHasSelected(true)
    onSelect(components)
  }, [onSelect])

  useEffect(() => {
    if (!isLoaded || !inputRef.current || autocompleteRef.current) return

    const ac = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: 'au' },
      types: ['address'],
      fields: ['address_components', 'formatted_address', 'geometry'],
    })

    ac.addListener('place_changed', handlePlaceChanged)
    autocompleteRef.current = ac

    return () => {
      google.maps.event.clearInstanceListeners(ac)
    }
  }, [isLoaded, handlePlaceChanged])

  return (
    <>
      <style>{`.pac-container { z-index: 9999 !important; }`}</style>
      <div className="space-y-3">
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
          {!isLoaded ? (
            <Loader2 className="w-4.5 h-4.5 text-gray-400 animate-spin" />
          ) : (
            <Search className="w-4.5 h-4.5 text-gray-400" />
          )}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value)
            setHasSelected(false)
          }}
          placeholder="Start typing your address..."
          disabled={!isLoaded}
          className="w-full pl-11 pr-4 py-3.5 border border-gray-300 rounded-xl text-(--upwork-navy) placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-(--upwork-green) focus:border-transparent disabled:opacity-50 disabled:cursor-wait text-[16px]"
          autoComplete="off"
        />
        {hasSelected && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <MapPin className="w-4 h-4 text-(--upwork-green)" />
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onManualMode}
        className="flex items-center gap-1.5 text-xs text-(--upwork-gray) hover:text-(--upwork-green) transition-colors"
      >
        <Keyboard className="w-3.5 h-3.5" />
        Enter address manually instead
      </button>
    </div>
    </>
  )
}
