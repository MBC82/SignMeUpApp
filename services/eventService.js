import { firestoreService } from '../config/firebase';

export const EventService = {
  createEvent: async (eventData) => {
    try {
      const docRef = await firestoreService.collection('events').add({
        ...eventData,
        createdAt: firestoreService.FieldValue.serverTimestamp(),
        participants: [eventData.username],
        status: 'active',
        // Preserve existing event structure
        backgroundImage: eventData.backgroundImage,
        bgColor: eventData.bgColor || 'transparent',
        dates: eventData.dates || [],
        editedTiles: eventData.editedTiles || {},
        emailNotificationsEnabled: eventData.emailNotificationsEnabled || false,
        eventTime: eventData.eventTime || '',
        fontColor: eventData.fontColor || 'black',
        fontSize: eventData.fontSize || 16,
        fontType: eventData.fontType || 'Marker Felt',
        globalNote: eventData.globalNote || '',
        headerFontColor: eventData.headerFontColor || 'black',
        headerTileColor: eventData.headerTileColor || 'lightpink',
        isEditing: eventData.isEditing || false,
        isNewEvent: eventData.isNewEvent || true,
        isPreview: eventData.isPreview || false,
        isTimeSlot: eventData.isTimeSlot || false,
        location: eventData.location || '',
        modalFontColor: eventData.modalFontColor || 'black',
        modalFontSize: eventData.modalFontSize || 16,
        modalFontType: eventData.modalFontType || 'Marker Felt',
        modalTileColor: eventData.modalTileColor || 'lightpink',
        neededItems: eventData.neededItems || [],
        organizer: eventData.organizer || '',
        organizerEmail: eventData.organizerEmail || '',
        organizerPhone: eventData.organizerPhone || '',
        screenBgColor: eventData.screenBgColor || 'transparent',
        slotLabels: eventData.slotLabels || {},
        textNotificationsEnabled: eventData.textNotificationsEnabled || false,
        textShadowEnabled: eventData.textShadowEnabled || false,
        tileColor: eventData.tileColor || 'lightpink',
        tileNames: eventData.tileNames || [],
        timeSlots: eventData.timeSlots || []
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  },

  getEvent: async (eventId) => {
    try {
      const doc = await firestoreService.collection('events').doc(eventId).get();
      return doc.exists ? doc.data() : null;
    } catch (error) {
      console.error('Error getting event:', error);
      throw error;
    }
  },

  updateEvent: async (eventId, eventData) => {
    try {
      await firestoreService.collection('events').doc(eventId).update({
        ...eventData,
        updatedAt: firestoreService.FieldValue.serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  },

  deleteEvent: async (eventId) => {
    try {
      await firestoreService.collection('events').doc(eventId).delete();
      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  },

  getEventParticipants: async (eventId) => {
    try {
      const eventDoc = await firestoreService.collection('events').doc(eventId).get();
      if (!eventDoc.exists) {
        return [];
      }
      return eventDoc.data().participants || [];
    } catch (error) {
      console.error('Error getting event participants:', error);
      throw error;
    }
  },

  addParticipant: async (eventId, userId, userData) => {
    try {
      const eventRef = firestoreService.collection('events').doc(eventId);
      await eventRef.update({
        participants: firestoreService.FieldValue.arrayUnion(userId)
      });
      
      await eventRef
        .collection('participants')
        .doc(userId)
        .set({
          ...userData,
          joinedAt: firestoreService.FieldValue.serverTimestamp()
        });
      
      return true;
    } catch (error) {
      console.error('Error adding participant:', error);
      throw error;
    }
  },

  removeParticipant: async (eventId, userId) => {
    try {
      const eventRef = firestoreService.collection('events').doc(eventId);
      await eventRef.update({
        participants: firestoreService.FieldValue.arrayRemove(userId)
      });
      
      await eventRef
        .collection('participants')
        .doc(userId)
        .delete();
      
      return true;
    } catch (error) {
      console.error('Error removing participant:', error);
      throw error;
    }
  },

  getEventInvitations: async (eventId) => {
    try {
      const invitationsSnapshot = await firestoreService
        .collection('events')
        .doc(eventId)
        .collection('invitations')
        .get();

      const invitations = [];
      invitationsSnapshot.forEach(doc => {
        invitations.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return invitations;
    } catch (error) {
      console.error('Error getting event invitations:', error);
      throw error;
    }
  }
}; 