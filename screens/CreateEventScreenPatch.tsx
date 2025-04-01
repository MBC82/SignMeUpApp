import React, { useState, useEffect } from 'react';
import CreateEventScreen from './CreateEventScreen';

// This is a wrapper component that fixes the missing setter functions
const CreateEventScreenPatch = (props) => {
  // Create all the missing state variables and setters
  const [customBgColor, setCustomBgColor] = useState('white');
  const [customFontColor, setCustomFontColor] = useState('black');
  const [customFontSize, setCustomFontSize] = useState(16);
  const [customFontType, setCustomFontType] = useState('Arial');
  const [customTileColor, setCustomTileColor] = useState('#f0f0f0');
  const [globalNote, setGlobalNote] = useState('');
  const [showGlobalNote, setShowGlobalNote] = useState(false);
  const [textShadowEnabled, setTextShadowEnabled] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState(null);
  
  // Initialize state from route params
  useEffect(() => {
    if (props.route?.params?.eventData) {
      const eventData = props.route.params.eventData;
      setCustomBgColor(eventData.bgColor || 'white');
      setCustomFontColor(eventData.fontColor || 'black');
      setCustomFontSize(eventData.fontSize || 16);
      setCustomFontType(eventData.fontType || 'Arial');
      setCustomTileColor(eventData.tileColor || '#f0f0f0');
      setGlobalNote(eventData.globalNote || '');
      setShowGlobalNote(!!eventData.globalNote);
      setTextShadowEnabled(eventData.textShadowEnabled || false);
      setBackgroundImage(eventData.backgroundImage || null);
    }
  }, [props.route?.params?.eventData]);
  
  // Create a modified version of the route params
  const modifiedProps = {
    ...props,
    route: {
      ...props.route,
      params: {
        ...props.route?.params,
        // Add all the missing setter functions
        setCustomBgColor: setCustomBgColor,
        setCustomFontColor: setCustomFontColor,
        setCustomFontSize: setCustomFontSize,
        setCustomFontType: setCustomFontType,
        setCustomTileColor: setCustomTileColor,
        setGlobalNote: setGlobalNote,
        setShowGlobalNote: setShowGlobalNote,
        setTextShadowEnabled: setTextShadowEnabled,
        setBackgroundImage: setBackgroundImage,
        // Make sure all state variables are available
        customBgColor: customBgColor,
        customFontColor: customFontColor,
        customFontSize: customFontSize,
        customFontType: customFontType,
        customTileColor: customTileColor,
        globalNote: globalNote,
        showGlobalNote: showGlobalNote,
        textShadowEnabled: textShadowEnabled,
        backgroundImage: backgroundImage,
      }
    }
  };
  
  // Add this at the beginning of the component
  console.log('CreateEventScreenPatch props:', JSON.stringify(props.route?.params, null, 2));
  
  // Render the original component with the modified props
  const result = <CreateEventScreen {...modifiedProps} />;
  
  // Add this before returning
  console.log('Modified props:', JSON.stringify(modifiedProps.route?.params, null, 2));
  
  return result;
};

export default CreateEventScreenPatch; 