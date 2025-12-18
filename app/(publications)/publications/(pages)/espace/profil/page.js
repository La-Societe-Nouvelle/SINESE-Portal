"use client";

import { Container, Row, Col, Form, Button, Alert, Card, Spinner, InputGroup } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { updateUserProfile, updateUserPassword, getUserProfile } from "@/services/userService";
import PublicationsPageHeader from "@/(publications)/publications/_components/PublicationsPageHeader";
import { Eye, EyeOff } from "lucide-react";

export default function ProfilPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  // Profile Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState("");

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Password visibility state
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  // UI State
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/publications/connexion");
    }
  }, [status, router]);

  // Fetch user profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (status === "authenticated") {
        try {
          const userData = await getUserProfile();
          setFirstName(userData.firstName || "");
          setLastName(userData.lastName || "");
          setEmail(userData.email || "");
          setProfile(userData.profile || "");
        } catch (error) {
          setProfileError(error.message || "Erreur lors du chargement du profil.");
        } finally {
          setIsLoadingProfile(false);
        }
      }
    };

    fetchProfile();
  }, [status]);

  // Handle Profile Update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (isSubmittingProfile) return;

    setIsSubmittingProfile(true);
    setProfileError("");
    setProfileSuccess("");

    try {
      await updateUserProfile({
        firstName,
        lastName,
        profile,
      });

      setProfileSuccess("Profil mis à jour avec succès.");

      // Update session to reflect changes
      await update({
        firstName,
        lastName,
        profile,
      });

    } catch (error) {
      setProfileError(error.message || "Erreur lors de la mise à jour du profil.");
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  // Handle Password Update
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (isSubmittingPassword) return;

    setIsSubmittingPassword(true);
    setPasswordError("");
    setPasswordSuccess("");

    // Client-side validation
    if (newPassword.length < 8) {
      setPasswordError("Le nouveau mot de passe doit contenir au moins 8 caractères.");
      setIsSubmittingPassword(false);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError("Les nouveaux mots de passe ne correspondent pas.");
      setIsSubmittingPassword(false);
      return;
    }

    try {
      await updateUserPassword({
        currentPassword,
        newPassword,
      });

      setPasswordSuccess("Mot de passe mis à jour avec succès.");

      // Clear password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");

    } catch (error) {
      setPasswordError(error.message || "Erreur lors de la mise à jour du mot de passe.");
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  // Show loading state
  if (status === "loading" || isLoadingProfile) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="profil-page">
      <PublicationsPageHeader
        title="Mon profil"
        description="Gérez vos informations personnelles et paramètres de compte."
      />

      <Container className="py-4">
        <Row>
          {/* Profile Information Section */}
          <Col lg={6} className="mb-4">
            <Card className="shadow-sm h-100">
              <Card.Body className="p-4">
                <h3 className="h5 mb-4 text-primary">
                  <i className="bi bi-person-circle me-2"></i>
                  Informations personnelles
                </h3>

                {profileSuccess && (
                  <Alert variant="success" className="d-flex align-items-center gap-2 px-3 py-2 rounded-3">
                    <i className="bi bi-check-circle-fill me-2" style={{ fontSize: 22 }}></i>
                    <div>{profileSuccess}</div>
                  </Alert>
                )}

                {profileError && (
                  <Alert variant="danger" className="d-flex align-items-center gap-2 px-3 py-2 rounded-3">
                    <i className="bi bi-exclamation-triangle-fill me-2" style={{ fontSize: 22 }}></i>
                    <div>{profileError}</div>
                  </Alert>
                )}

                <Form onSubmit={handleProfileSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="profileFirstName">
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
                      <Form.Group className="mb-3" controlId="profileLastName">
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

                  <Form.Group className="mb-3" controlId="profileEmail">
                    <Form.Label>Adresse Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Votre email"
                      value={email}
                      disabled
                    />

                  </Form.Group>

                  <Form.Group className="mb-4" controlId="profileType">
                    <Form.Label>Vous êtes :</Form.Label>
                    <Form.Select
                      value={profile}
                      onChange={(e) => setProfile(e.target.value)}
                      required
                    >
                      <option value="">Sélectionnez votre profil</option>
                      <option value="expert-comptable">Expert-comptable</option>
                      <option value="entreprise">Représentant d'entreprise</option>
                      <option value="autre">Autre</option>
                    </Form.Select>
                  </Form.Group>

                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100"
                    disabled={isSubmittingProfile}
                  >
                    {isSubmittingProfile && <Spinner size="sm" className="me-2" />}
                    Enregistrer les modifications
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          {/* Password Change Section */}
          <Col lg={6} className="mb-4">
            <Card className="shadow-sm h-100">
              <Card.Body className="p-4">
                <h3 className="h5 mb-4 text-primary">
                  <i className="bi bi-shield-lock me-2"></i>
                  Changer le mot de passe
                </h3>

                {passwordSuccess && (
                  <Alert variant="success" className="d-flex align-items-center gap-2 px-3 py-2 rounded-3">
                    <i className="bi bi-check-circle-fill me-2" style={{ fontSize: 22 }}></i>
                    <div>{passwordSuccess}</div>
                  </Alert>
                )}

                {passwordError && (
                  <Alert variant="danger" className="d-flex align-items-center gap-2 px-3 py-2 rounded-3">
                    <i className="bi bi-exclamation-triangle-fill me-2" style={{ fontSize: 22 }}></i>
                    <div>{passwordError}</div>
                  </Alert>
                )}

                <Form onSubmit={handlePasswordSubmit}>
                  <Form.Group className="mb-3" controlId="currentPassword">
                    <Form.Label>Mot de passe actuel</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="Entrez votre mot de passe actuel"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                      />
                      <Button
                        variant="icon-input-group-text"
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowCurrentPassword((v) => !v)}
                        aria-label={showCurrentPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                      >
                        {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </Button>
                    </InputGroup>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="newPassword">
                    <Form.Label>Nouveau mot de passe</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Minimum 8 caractères"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={8}
                      />
                      <Button
                        variant="icon-input-group-text"
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowNewPassword((v) => !v)}
                        aria-label={showNewPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                      >
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </Button>
                    </InputGroup>
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="confirmNewPassword">
                    <Form.Label>Confirmer le nouveau mot de passe</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type={showConfirmNewPassword ? "text" : "password"}
                        placeholder="Confirmez votre nouveau mot de passe"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        required
                        minLength={8}
                      />
                      <Button
                        variant="icon-input-group-text"
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowConfirmNewPassword((v) => !v)}
                        aria-label={showConfirmNewPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                      >
                        {showConfirmNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </Button>
                    </InputGroup>
                  </Form.Group>

                  <Button
                    variant="secondary"
                    type="submit"
                    className="w-100"
                    disabled={isSubmittingPassword}
                  >
                    {isSubmittingPassword && <Spinner size="sm" className="me-2" />}
                    Changer le mot de passe
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>

      </Container>
    </div>
  );
}
