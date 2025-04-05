import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/whatsapp-agent';

// Simplifica a conexão para o MVP
let isConnected = false;

/**
 * Conecta ao MongoDB usando mongoose
 */
async function connectToDatabase() {
  if (isConnected) {
    return mongoose;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log('MongoDB conectado com sucesso');
    return mongoose;
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error);
    throw error;
  }
}

export default connectToDatabase; 