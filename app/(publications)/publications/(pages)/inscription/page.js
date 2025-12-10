"use client";

import { Row, Col, Form, Button, InputGroup, Alert, Modal, Spinner } from "react-bootstrap";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { register } from "@/services/authService";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError("");
    setSuccess(false);

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      setIsSubmitting(false);
      return;
    }

    try {
      await register({ email, password, profile, firstName, lastName });

      const loginRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (loginRes.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/publications/espace");
        }, 1500);
      }
    } catch (e) {
      setError(e.message || "Erreur lors de l'inscription.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Logo SINESE */}
      <div className="auth-logo">
        <img src="/logo-sinese.svg" alt="SINESE" />
      </div>

      {/* Card principale */}
      <div className="auth-card">
        <h2 className="auth-title text-uppercase">Inscription</h2>
        <p className="auth-subtitle">
          Créez un compte pour publier l'Empreinte Sociétale de votre entreprise sur le portail SINESE
        </p>

        {/* Modal de succès */}
        {success && (
          <Modal show={success} centered className="custom-success-modal">
            <Modal.Body className="text-center">
              <Image src="/illustrations/happy.svg" alt="Succès" height={150} width={200} className="mb-3" />
              <h4 className="mb-3">Bienvenue !</h4>
              <p>
                Votre compte a bien été créé.
                <br />
                Vous allez être redirigé vers votre espace personnel...
              </p>
            </Modal.Body>
          </Modal>
        )}

        {error && (
          <Alert variant="danger" className="d-flex align-items-center gap-2 px-3 py-2 rounded-3">
            <i className="bi bi-exclamation-triangle-fill me-2" style={{ fontSize: 22 }}></i>
            <div>{error}</div>
          </Alert>
        )}

        <Form onSubmit={handleSubmit} className="auth-form">
          <Row>
            <Col md={6}>
              <Form.Group className="form-group" controlId="firstName">
                <Form.Label>Prénom</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Votre prénom"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="form-group" controlId="lastName">
                <Form.Label>Nom</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Votre nom"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="form-group" controlId="email">
            <Form.Label>Adresse Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Votre email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="form-group" controlId="role">
            <Form.Label>Vous êtes :</Form.Label>
            <Form.Select value={profile} onChange={(e) => setProfile(e.target.value)} required>
              <option value="">Sélectionnez votre profil</option>
              <option value="expert-comptable">Expert-comptable</option>
              <option value="entreprise">Représentant d'entreprise</option>
              <option value="autre">Autre</option>
            </Form.Select>
          </Form.Group>


          <Form.Group className="form-group" controlId="password">
            <Form.Label>Mot de passe</Form.Label>
            <InputGroup>
              <Form.Control
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 caractères"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              <Button
                variant="icon-input-group-text"
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </Button>
            </InputGroup>
          </Form.Group>

          <Form.Group className="form-group" controlId="confirmPassword">
            <Form.Label>Confirmer le mot de passe</Form.Label>
            <InputGroup>
              <Form.Control
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirmez votre mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
              <Button
                variant="icon-input-group-text"
                type="button"
                tabIndex={-1}
                onClick={() => setShowConfirmPassword((v) => !v)}
                aria-label={showConfirmPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </Button>
            </InputGroup>
          </Form.Group>


          <Button variant="primary" type="submit" className="w-100" disabled={isSubmitting}>
            {isSubmitting && <Spinner size="sm" className="me-2" />}
            Créer mon compte
          </Button>
        </Form>

        <div className="auth-alt-link">
          Déjà un compte ? <a href="/publications/connexion">Connectez-vous</a>
        </div>
      </div>
    </div>
  );
}
