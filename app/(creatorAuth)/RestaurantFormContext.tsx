// context/RestaurantFormContext.tsx
import React, { createContext, useContext, useState } from 'react';

const RestaurantFormContext = createContext(null);

export const RestaurantFormProvider = ({ children }) => {
  const [restaurantData, setRestaurantData] = useState({
    name: '',
    street: '',
    streetNr: '',
    zipCode: '',
    city: '',
    phoneNumber: '',
    website: '',
    types: [],
    openingHours: {
      monday: { start: '09:00', end: '17:00', closed: false },
      tuesday: { start: '09:00', end: '17:00', closed: false },
      wednesday: { start: '09:00', end: '17:00', closed: false },
      thursday: { start: '09:00', end: '17:00', closed: false },
      friday: { start: '09:00', end: '17:00', closed: false },
      saturday: { start: '09:00', end: '17:00', closed: false },
      sunday: { start: '09:00', end: '17:00', closed: false },
    },
  });

  const updateField = (key, value) => {
    setRestaurantData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <RestaurantFormContext.Provider value={{ restaurantData, updateField }}>
      {children}
    </RestaurantFormContext.Provider>
  );
};

export const useRestaurantForm = () => useContext(RestaurantFormContext);
