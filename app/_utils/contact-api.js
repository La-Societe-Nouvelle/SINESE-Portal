/**
 * Envoie un message de contact via l'API
 * @param {Object} contactData - Les données du formulaire de contact
 * @param {string} contactData.name - Nom du contact
 * @param {string} contactData.email - Email du contact
 * @param {string} contactData.subject - Sujet du message
 * @param {string} contactData.message - Contenu du message
 * @returns {Promise<Response>} - Réponse de l'API
 */
export async function sendContactMessage(contactData) {
  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contactData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erreur lors de l\'envoi du message');
    }

    return {
      success: true,
      data,
      status: response.status
    };

  } catch (error) {
    console.error('Erreur API contact:', error);
    
    return {
      success: false,
      error: error.message || 'Erreur de connexion',
      status: error.status || 500
    };
  }
}