/* eslint-disable react/no-unescaped-entities */

"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Form, Button, Alert, InputGroup } from "react-bootstrap";
import { useSession } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";

export default function ConnexionPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/publications/espace";

  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/publications/espace");
    }
  }, [status, router]);

  // Nettoyer l'URL au chargement
  useEffect(() => {
    if (searchParams.get("callbackUrl")) {
      router.replace("/publications/connexion", { scroll: false });
    }
  }, [searchParams, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (res.ok) {
      router.push(callbackUrl);
    } else {
      setError("Email ou mot de passe incorrect.");
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
        <h1 className="auth-title">Connexion</h1>
        <p className="auth-subtitle">Accédez à votre espace de publication</p>
 
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit} className="auth-form">
          <Form.Group className="form-group" controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Entrez votre email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="form-group" controlId="password">
            <Form.Label>Mot de passe</Form.Label>
            <InputGroup>
              <Form.Control
                type={showPassword ? "text" : "password"}
                placeholder="Entrez votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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

          <Button variant="secondary" type="submit" className="w-100">
            Se connecter
          </Button>
        </Form>

        <div className="auth-alt-link">
          Pas encore de compte ? <a href="/publications/inscription">Créez-en un</a>
        </div>
      </div>
    </div>
  );
}
