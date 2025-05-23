export interface LocationDetails {
  type?: 'store' | 'restaurant' | 'facility' | 'service' | 'entrance' | 'path';
  description?: string;
  openingHours?: string;
  contactInfo?: string;
  imageUrl?: string;
  isAccessible?: boolean;
}

export const getLocationDetails = (objectName: string | null): LocationDetails => {
  if (!objectName) return {};

  if (objectName === 'info_401') {
    return {
      type: 'facility',
      description: "Dean's Office - Administrative headquarters",
      openingHours: "Saturday - Thursday: 9:00 AM - 4:00 PM",
      contactInfo: "Room 401",
      isAccessible: true
    };
  }

  if (objectName === 'info_wc_male') {
    return {
      type: 'facility',
      description: "Men's Restroom",
      isAccessible: true
    };
  }

  if (objectName === 'info_wc_female') {
    return {
      type: 'facility',
      description: "Women's Restroom",
      isAccessible: true
    };
  }

  if (objectName === 'info_435' || objectName === 'info_438') {
    const hallNumber = objectName === 'info_435' ? '7' : '8';
    const roomNumber = objectName.replace('info_', '');
    return {
      type: 'facility',
      description: `Hall ${hallNumber} - Large lecture hall`,
      openingHours: "Saturday - Thursday: 9:00 AM - 4:00 PM",
      contactInfo: `Room ${roomNumber}`,
      isAccessible: true
    };
  }

  if (['info_411', 'info_412', 'info_413', 'info_415'].includes(objectName)) {
    const labNumber = objectName === 'info_411' ? '1' :
                     objectName === 'info_412' ? '2' :
                     objectName === 'info_413' ? '3' : '4';
    const roomNumber = objectName.replace('info_', '');
    return {
      type: 'facility',
      description: `Computer Lab ${labNumber} - Student workspace with computers`,
      openingHours: "Saturday - Thursday: 9:00 AM - 4:00 PM",
      contactInfo: `Room ${roomNumber}`,
      isAccessible: true
    };
  }

  return {};
}; 