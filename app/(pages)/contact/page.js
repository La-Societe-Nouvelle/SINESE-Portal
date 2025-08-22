"use client";

import React, { useState } from "react";
import { Alert, Button, Col, Container, Form, Row, Card, Spinner } from "react-bootstrap";
import PageHeader from "../../_components/PageHeader";
import { sendContactMessage } from "../../_utils/contact-api";

export default function Contact() {
  // États du formulaire
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  
  const [rgpdChecked, setRgpdChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Gestion des changements dans les champs
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Effacer l'alerte si l'utilisateur modifie le formulaire
    if (alert) {
      setAlert(null);
    }
  };

  // Validation du formulaire
  const validateForm = () => {
    const errors = [];
    
    if (!formData.name.trim()) errors.push("Le nom est requis");
    if (!formData.email.trim()) errors.push("L'email est requis");
    if (!formData.subject.trim()) errors.push("Le sujet est requis");
    if (!formData.message.trim()) errors.push("Le message est requis");
    if (!rgpdChecked) errors.push("Vous devez accepter les conditions");
    
    // Validation email
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (formData.email.trim() && !emailRegex.test(formData.email)) {
      errors.push("L'adresse email n'est pas valide");
    }
    
    return errors;
  };

  // Soumission du formulaire
  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormSubmitted(true);
    
    const errors = validateForm();
    if (errors.length > 0) {
      setAlert({
        type: "danger",
        message: errors.join(". ")
      });
      return;
    }

    setIsSubmitting(true);
    setAlert(null);

    try {
      const result = await sendContactMessage(formData);
      
      if (result.success) {
        setAlert({
          type: "success",
          message: result.data.message
        });
        // Réinitialiser le formulaire
        setFormData({ name: "", email: "", subject: "", message: "" });
        setRgpdChecked(false);
        setFormSubmitted(false);
      } else {
        setAlert({
          type: "danger",
          message: result.error
        });
      }
    } catch (error) {
      setAlert({
        type: "danger",
        message: "Une erreur inattendue est survenue. Veuillez réessayer."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper pour vérifier si un champ est en erreur
  const isFieldInvalid = (field) => {
    if (!formSubmitted) return false;
    if (field === 'email') {
      const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
      return !formData.email.trim() || !emailRegex.test(formData.email);
    }
    return !formData[field].trim();
  };

  return (
    <div className="open-data-portal">
      <PageHeader 
        title="Contactez-nous" 
        subtitle="Notre équipe est à votre disposition pour vous accompagner dans vos projets liés à l'empreinte sociétale et aux données ouvertes."
        path="contact"
        variant="minimal"
        icon={
          <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
          </svg>
        }
      />
      
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col lg={8}>
            
            {/* Formulaire de contact */}
            <Card 
              className="border-0 shadow-sm" 
              style={{ 
                borderRadius: '1rem',
                boxShadow: '0 4px 20px rgba(59, 77, 143, 0.1)' 
              }}
            >
              <Card.Body className="p-4 p-lg-5">
                <div className="d-flex align-items-center mb-4">
                  <div 
                    className="rounded-circle d-inline-flex align-items-center justify-content-center me-3"
                    style={{ 
                      width: '48px', 
                      height: '48px', 
                      backgroundColor: '#3b4d8f20',
                      color: '#3b4d8f'
                    }}
                  >
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-primary mb-1">Formulaire de contact</h3>
                    <p className="text-muted mb-0 small">Tous les champs marqués d'un * sont obligatoires</p>
                  </div>
                </div>
                
                {/* Alertes */}
                {alert && (
                  <Alert variant={alert.type} className="mb-4">
                    <div className="d-flex align-items-start">
                      <svg 
                        width="20" 
                        height="20" 
                        fill="currentColor" 
                        viewBox="0 0 24 24" 
                        className={`me-2 mt-1 flex-shrink-0 ${alert.type === 'success' ? 'text-success' : 'text-danger'}`}
                      >
                        {alert.type === 'success' ? (
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        ) : (
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                        )}
                      </svg>
                      <span>{alert.message}</span>
                    </div>
                  </Alert>
                )}
                
                <Form onSubmit={handleSubmit} noValidate>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-medium">
                          Nom et prénom *
                        </Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          isInvalid={isFieldInvalid('name')}
                          disabled={isSubmitting}
                          style={{ borderRadius: '0.5rem' }}
                        />
                        <Form.Control.Feedback type="invalid">
                          Ce champ est requis.
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-medium">
                          Adresse email *
                        </Form.Label>
                        <Form.Control
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          isInvalid={isFieldInvalid('email')}
                          disabled={isSubmitting}
                          style={{ borderRadius: '0.5rem' }}
                        />
                        <Form.Control.Feedback type="invalid">
                          Veuillez fournir une adresse email valide.
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">
                      Sujet de votre message *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      isInvalid={isFieldInvalid('subject')}
                      disabled={isSubmitting}
                      style={{ borderRadius: '0.5rem' }}
                      placeholder="Ex: Question sur les indicateurs ESE, Demande de partenariat..."
                    />
                    <Form.Control.Feedback type="invalid">
                      Ce champ est requis.
                    </Form.Control.Feedback>
                  </Form.Group>
                  
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-medium">
                      Votre message *
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={6}
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      isInvalid={isFieldInvalid('message')}
                      disabled={isSubmitting}
                      style={{ borderRadius: '0.5rem' }}
                      placeholder="Décrivez votre projet, votre question ou votre demande en détail..."
                    />
                    <Form.Control.Feedback type="invalid">
                      Ce champ est requis.
                    </Form.Control.Feedback>
                  </Form.Group>
                  
                  {/* Consentement RGPD */}
                  <Form.Group className="mb-4">
                    <Form.Check
                      type="checkbox"
                      checked={rgpdChecked}
                      onChange={(e) => setRgpdChecked(e.target.checked)}
                      isInvalid={formSubmitted && !rgpdChecked}
                      disabled={isSubmitting}
                      label={
                        <small className="text-muted">
                          En cochant cette case, j'accepte que mes données personnelles soient utilisées 
                          pour me recontacter dans le cadre de ma demande indiquée dans ce formulaire. 
                          Aucun autre traitement ne sera effectué avec mes informations personnelles.
                        </small>
                      }
                    />
                    {formSubmitted && !rgpdChecked && (
                      <Form.Control.Feedback type="invalid" style={{ display: 'block' }}>
                        Vous devez accepter pour soumettre le formulaire.
                      </Form.Control.Feedback>
                    )}
                  </Form.Group>
                  
                  {/* Bouton de soumission */}
                  <div className="d-grid">
                    <Button 
                      type="submit" 
                      variant="secondary" 
                      size="lg"
                      disabled={isSubmitting}
                      style={{ 
                        borderRadius: '0.75rem',
                        fontWeight: '600',
                        padding: '0.75rem 2rem'
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <Spinner size="sm" className="me-2" />
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" className="me-2">
                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                          </svg>
                          Envoyer le message
                        </>
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>

            {/* Note RGPD */}
            <div 
              className="mt-4 p-3 rounded-3" 
              style={{ backgroundColor: '#f8f9fc', border: '1px solid #e9ecf3' }}
            >
              <small className="text-muted d-flex align-items-start">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" className="me-2 mt-1 flex-shrink-0">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                </svg>
                Pour connaître et exercer vos droits, notamment de retrait de votre consentement 
                à l'utilisation de données collectées par ce formulaire, veuillez consulter{" "}
                <a href="/politique-confidentialite" className="text-primary text-decoration-none fw-medium">
                  notre politique de confidentialité
                </a>.
              </small>
            </div>

            {/* Informations de contact additionnelles */}
            <div className="mt-5">
              <Row>
                <Col md={6} className="mb-4">
                  <div className="text-center p-4 h-100" style={{ backgroundColor: '#f8f9fc', borderRadius: '1rem' }}>
                    <div 
                      className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                      style={{ 
                        width: '60px', 
                        height: '60px', 
                        backgroundColor: '#3b4d8f20',
                        color: '#3b4d8f'
                      }}
                    >
                      <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                      </svg>
                    </div>
                    <h5 className="text-primary mb-2">Email direct</h5>
                    <p className="text-muted mb-0">
                      <a href="mailto:contact@lasocietenouvelle.org" className="text-secondary text-decoration-none">
                        contact@lasocietenouvelle.org
                      </a>
                    </p>
                  </div>
                </Col>
                
                <Col md={6} className="mb-4">
                  <div className="text-center p-4 h-100" style={{ backgroundColor: '#f8f9fc', borderRadius: '1rem' }}>
                    <div 
                      className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                      style={{ 
                        width: '60px', 
                        height: '60px', 
                        backgroundColor: '#e74c5a20',
                        color: '#e74c5a'
                      }}
                    >
                      <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                    </div>
                    <h5 className="text-primary mb-2">Adresse</h5>
                    <p className="text-muted mb-0">
                      165 avenue de Bretagne<br />
                      59000 LILLE
                    </p>
                  </div>
                </Col>
              </Row>
            </div>
            
          </Col>
        </Row>
      </Container>
    </div>
  );
}