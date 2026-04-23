"""
Geocoding service to convert addresses to precise latitude/longitude coordinates.
Uses Nominatim (OpenStreetMap) API - free and doesn't require API key.
"""
import requests
import logging
from typing import Optional, Tuple

logger = logging.getLogger(__name__)

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"


def get_coordinates_from_address(
    address: str,
    city: Optional[str] = None,
    pincode: Optional[str] = None
) -> Tuple[Optional[str], Optional[str]]:
    """
    Convert address to precise latitude and longitude using Nominatim API.
    
    Args:
        address: Full address string
        city: City name for better precision
        pincode: Pincode for better precision
        
    Returns:
        Tuple of (latitude, longitude) as strings with high precision, or (None, None) if failed
    """
    try:
        headers = {
            "User-Agent": "KramaClinicApp/1.0 (contact@krama.care)"
        }
        
        # Build structured query for better precision
        query_parts = [address]
        if city:
            query_parts.append(city)
        if pincode:
            query_parts.append(pincode)
        query_parts.append("India")  # Always add country for precision
        
        full_query = ", ".join(query_parts)
        
        params = {
            "q": full_query,
            "format": "json",
            "limit": 1,
            "addressdetails": 1,  # Get detailed address components
            "extratags": 1,  # Get extra tags for better precision
            "namedetails": 1,  # Get name details
            "countrycodes": "in"  # Restrict to India
        }
        
        response = requests.get(
            NOMINATIM_URL,
            headers=headers,
            params=params,
            timeout=15
        )
        
        if response.status_code == 200:
            data = response.json()
            if data and len(data) > 0:
                result = data[0]
                lat = result.get("lat")
                lon = result.get("lon")
                importance = result.get("importance", 0)
                
                # Log precision details
                display_name = result.get("display_name", "")
                logger.info(f"Geocoding successful - Lat: {lat}, Lon: {lon}, Importance: {importance}")
                logger.info(f"Resolved address: {display_name[:100]}...")
                
                return lat, lon
            else:
                logger.warning(f"No results found for address: {address[:50]}...")
                return None, None
        else:
            logger.error(f"Geocoding API error: {response.status_code}")
            return None, None
            
    except Exception as e:
        logger.error(f"Error during geocoding: {str(e)}")
        return None, None


def get_coordinates_from_structured_address(
    street: str,
    road: str,
    layout: Optional[str],
    section: Optional[str],
    city: str,
    pincode: str
) -> Tuple[Optional[str], Optional[str]]:
    """
    Get precise coordinates from structured address components.
    This provides better accuracy than using a single concatenated string.
    
    Args:
        street: Street/Building number
        road: Road/Street name
        layout: Layout/Area (optional)
        section: Section/Block (optional)
        city: City name
        pincode: Pincode
        
    Returns:
        Tuple of (latitude, longitude) as strings with high precision
    """
    # Build address in order of specificity (most specific first)
    parts = [street, road]
    if layout:
        parts.append(layout)
    if section:
        parts.append(section)
    parts.extend([city, pincode, "India"])
    
    full_address = ", ".join(parts)
    return get_coordinates_from_address(full_address, city, pincode)


def format_coordinates(lat: Optional[str], lon: Optional[str]) -> str:
    """Format coordinates for display"""
    if lat and lon:
        return f"{lat}, {lon}"
    return "Not available"
