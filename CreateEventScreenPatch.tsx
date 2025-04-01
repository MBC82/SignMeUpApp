import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import CreateEventScreen from './CreateEventScreen';

// This is a wrapper component that fixes the setCustomBgColor issue
const CreateEventScreenPatch = (props) => {
  // Create the missing state variables and setters
  const [customBgColor, setCustomBgColor] = useState('white');
  
  // If we're editing an event, extract the bgColor from eventData
  useEffect(() => {
    if (props.route?.params?.eventData?.bgColor) {
      setCustomBgColor(props.route.params.eventData.bgColor);
    }
  }, [props.route?.params?.eventData]);
  
  // Create a modified version of the route params
  const modifiedProps = {
    ...props,
    route: {
      ...props.route,
      params: {
        ...props.route?.params,
        // Add the missing setter function
        setCustomBgColor: setCustomBgColor,
        // Make sure customBgColor is available
        customBgColor: customBgColor,
      }
    }
  };
  
  // Render the original component with the modified props
  return <CreateEventScreen {...modifiedProps} />;
};

export default CreateEventScreenPatch; 