const { Server } = require('socket.io');

let ioInstance = null;

/**
 * Initializes the Socket.IO server on the provided HTTP server.
 * 
 * @param {object} httpServer - Node HTTP server instance
 * @param {string[]} allowedOrigins - Configured CORS allowed origin list
 * @returns {object} The initialized Socket.IO server
 */
const init = (httpServer, allowedOrigins) => {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  ioInstance.on('connection', (socket) => {
    console.log(`Socket client connected: ${socket.id}`);

    // Join a doctor's active daily scheduling queue updates channel
    socket.on('join_room', ({ doctorId }) => {
      if (doctorId) {
        const roomName = `doctor_${doctorId}`;
        socket.join(roomName);
        console.log(`Socket client ${socket.id} joined room: ${roomName}`);
      }
    });

    // Join a personal patient room to receive targeted position change events
    socket.on('join_patient_room', ({ patientId }) => {
      if (patientId) {
        const roomName = `patient_${patientId}`;
        socket.join(roomName);
        console.log(`Socket client ${socket.id} joined patient room: ${roomName}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket client disconnected: ${socket.id}`);
    });
  });

  return ioInstance;
};

/**
 * Retrieves the active Socket.IO server instance.
 * Throws an error if init() has not been called yet.
 */
const getIO = () => {
  if (!ioInstance) {
    throw new Error('Socket.IO has not been initialized yet!');
  }
  return ioInstance;
};

/**
 * Broadcasts queue status updates to all clients in a doctor's room.
 * 
 * @param {string} doctorId - Doctor profile ID
 * @param {object} payload - Updated queue metrics and patient list
 */
const emitQueueUpdated = (doctorId, payload) => {
  if (ioInstance) {
    ioInstance.to(`doctor_${doctorId}`).emit('queueUpdated', payload);
  }
};

/**
 * Emits notification that a consultation checkup is complete.
 * 
 * @param {string} doctorId - Doctor profile ID
 * @param {string} appointmentId - The completed appointment ID
 * @param {object} prescription - Completed prescription summary
 */
const emitAppointmentCompleted = (doctorId, appointmentId, prescription) => {
  if (ioInstance) {
    ioInstance.to(`doctor_${doctorId}`).emit('appointmentCompleted', {
      appointmentId,
      prescription
    });
  }
};

/**
 * Broadcasts which patient is currently being called into the consultation room.
 * 
 * @param {string} doctorId - Doctor profile ID
 * @param {string} appointmentId - The next patient's appointment ID
 */
const emitNextPatient = (doctorId, appointmentId) => {
  if (ioInstance) {
    ioInstance.to(`doctor_${doctorId}`).emit('nextPatient', {
      appointmentId
    });
  }
};

/**
 * Sends a targeted update to a specific patient regarding their position change.
 * 
 * @param {string} patientId - Patient profile/user ID
 * @param {object} payload - Updated position and wait time
 */
const emitQueuePositionChanged = (patientId, payload) => {
  if (ioInstance) {
    ioInstance.to(`patient_${patientId}`).emit('queuePositionChanged', payload);
  }
};

module.exports = {
  init,
  getIO,
  emitQueueUpdated,
  emitAppointmentCompleted,
  emitNextPatient,
  emitQueuePositionChanged
};
