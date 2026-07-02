"use client";

import { Container, Row, Col, Form, Button, Alert, Card, Spinner, InputGroup } from "react-bootstrap";
import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { updateUserProfile, updateUserPassword } from "@/actions/user";
import { isError, getErrorMessage } from "@/_libs/errors";
import PublicationsPageHeader from "@/(publications)/publications/_components/PublicationsPageHeader";
import { Check, CircleCheck, CircleX, Eye, EyeOff, LockIcon, User } from "lucide-react";

export default function ProfilClient({ initialProfile }) {
  const { update } = useSession();

  const [firstName, setFirstName] = useState(initialProfile?.firstName || "");
  const [lastName, setLastName] = useState(initialProfile?.lastName || "");
  const [email] = useState(initialProfile?.email || "");
  const [profile, setProfile] = useState(initialProfile?.profile || "");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const [isProfilePending, startProfileTransition] = useTransition();
  const [isPasswordPending, startPasswordTransition] = useTransition();

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");
    startProfileTransition(async () => {
      const result = await updateUserProfile({ firstName, lastName, profile });
      if (isError(result)) {
        setProfileError(getErrorMessage(result));
        return;
      }
      setProfileSuccess("Profil mis à jour avec succès.");
      await update({ firstName, lastName, profile });
    });
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword.length < 8) {
      setPasswordError("Le nouveau mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }

    startPasswordTransition(async () => {
      const result = await updateUserPassword({ currentPassword, newPassword });
      if (isError(result)) {
        setPasswordError(getErrorMessage(result));
        return;
      }
      setPasswordSuccess("Mot de passe mis à jour avec succès.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    });
  };

  return (
    <div className="profil-page">
      <PublicationsPageHeader
        title="Mon profil"
        description="Gérez vos informations personnelles et paramètres de compte."
      />

      <Container className="py-4">
        <Row>
          <Col lg={6} className="mb-4">
            <Card className="shadow-sm h-100">
              <Card.Body className="p-4">
                <h3 className="h5 mb-4 text-primary">
                  <User size={20} className="me-2" />
                  Informations personnelles
                </h3>

                {profileSuccess && (
                  <Alert variant="success" className="d-flex align-items-center gap-2 px-3 py-2 rounded-3">
                   <CircleCheck size={22} className="me-2" />
                    <div>{profileSuccess}</div>
                  </Alert>
                )}

                {profileError && (
                  <Alert variant="danger" className="d-flex align-items-center gap-2 px-3 py-2 rounded-3">
                    <CircleX size={22} className="me-2" />
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
                    <Form.Control type="email" value={email} disabled />
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="profileType">
                    <Form.Label>Vous êtes :</Form.Label>
                    <Form.Select
                      value={profile}
                      onChange={(e) => setProfile(e.target.value)}
                      required
                    >
                      <option value="">Sélectionnez votre profil</option>
                      <option value="expert-comptable">Expert·e-comptable</option>
                      <option value="entreprise">Dirigeant·e d'entreprise</option>
                      <option value="autre">Autre</option>
                    </Form.Select>
                  </Form.Group>

                  <Button variant="primary" type="submit" className="w-100" disabled={isProfilePending}>
                    {isProfilePending && <Spinner size="sm" className="me-2" />}
                    Enregistrer les modifications
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={6} className="mb-4">
            <Card className="shadow-sm h-100">
              <Card.Body className="p-4">
                <h3 className="h5 mb-4 text-primary">
                 <LockIcon size={20} className="me-2" />
                  Changer le mot de passe
                </h3>

                {passwordSuccess && (
                  <Alert variant="success" className="d-flex align-items-center gap-2 px-3 py-2 rounded-3">
                    <CircleCheck size={22} className="me-2" />
                    <div>{passwordSuccess}</div>
                  </Alert>
                )}

                {passwordError && (
                  <Alert variant="danger" className="d-flex align-items-center gap-2 px-3 py-2 rounded-3">
                    <CircleX size={22} className="me-2" />
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

                  <Button variant="secondary" type="submit" className="w-100" disabled={isPasswordPending}>
                    {isPasswordPending && <Spinner size="sm" className="me-2" />}
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
