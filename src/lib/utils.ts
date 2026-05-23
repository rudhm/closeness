export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return {
    km: distance,
    miles: distance * 0.621371
  };
};

export const estimateTravelTime = (distanceKm: number) => {
  return {
    walking: distanceKm / 5,
    car: distanceKm / 60,
    train: distanceKm / 80
  };
};

export const formatTime = (hours: number) => {
  if (hours < 1) {
    const mins = Math.round(hours * 60);
    return `${mins} min`;
  }
  const fullHours = Math.floor(hours);
  const mins = Math.round((hours - fullHours) * 60);
  return `${fullHours}h ${mins}m`;
};
